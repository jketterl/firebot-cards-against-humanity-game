import * as fs from "fs";
import globals from "./globals";
import {CardCommand, VoteCommand} from "./commands";

export type BlackCard = {
    text: string;
    pick: number;
}

export type Draw = {
    texts: string[];
    user: string;
}

export enum GamePhase {
    Drawing = "drawing",
    Voting = "voting",
    Finished = "finished"
}

export class CahGame {
    static currentGame?: CahGame

    static async newGame(): Promise<CahGame> {
        return new Promise((resolve, reject) => {
            fs.readFile(globals.settings.settings.cardSource.packFile, "utf-8", function(err, data) {
                if (err) return reject(err)

                const pack = JSON.parse(data)

                resolve(new CahGame(
                    pack.black[Math.floor(Math.random() * pack.black.length)],
                    CahGame.shuffle(pack.white)
                ));
            })
        })
    }

    static shuffle<Type>(input: Type[]): Type[] {
        const array = [...input]
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
            // swap elements array[i] and array[j]
            // we use "destructuring assignment" syntax to achieve that
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array
    }

    blackCard: BlackCard;
    whiteCards: string[];
    draws: Draw[] = [];
    winners: Draw[] = []
    phase: GamePhase = GamePhase.Drawing;
    timeout?: NodeJS.Timeout;
    votes: Record<string, number> = {};

    constructor(blackCard: BlackCard, whiteCards: string[]) {
        this.blackCard = blackCard
        this.whiteCards = whiteCards
        this.sendState()
        globals.eventManager.triggerEvent('de.justjakob.cahgame', 'game-started', {blackCard: this.blackCard})
        globals.commandManager.registerSystemCommand(CardCommand)
        this.timeout = setTimeout(() => {
            this.nextPhase()
        }, (globals.settings.settings.gameSettings.drawingTime || 60) * 1000);
    }

    nextPhase(): void {
        this.timeout = null;
        switch (this.phase) {
            case GamePhase.Drawing:
                if (!this.draws.length) {
                    globals.twitchChat.sendChatMessage("No card draws, Cards Against Humanity aborted.")
                    this.stop()
                    return
                }
                this.draws = CahGame.shuffle(this.draws)
                this.phase = GamePhase.Voting
                this.timeout = setTimeout(() => {
                    this.nextPhase()
                }, (globals.settings.settings.gameSettings.votingTime || 60) * 1000);
                globals.commandManager.unregisterSystemCommand(CardCommand.definition.id)
                globals.commandManager.registerSystemCommand(VoteCommand)
                break;
            case GamePhase.Voting:
                this.winners = this.getWinners()
                if (!this.winners.length) {
                    globals.twitchChat.sendChatMessage("No votes cast. Cards Against Humanity ended without a winner.")
                }
                this.stop()
                break
        }
        this.sendState();
    }

    sendState(): void {
        globals.httpServer.sendToOverlay("cah", {
            blackCard: this.blackCard.text,
            whiteCards: this.draws,
            phase: this.phase,
            winners: this.winners,
            drawingTime: globals.settings.settings.gameSettings.drawingTime || 60,
            votingTime: globals.settings.settings.gameSettings.votingTime || 60,
            lingerTime: globals.settings.settings.gameSettings.lingerTime || 10,
        });
    }

    userHasDrawn(user: string): boolean {
        const found = this.draws.find(draw => draw.user == user)
        return typeof(found) !== 'undefined'
    }

    draw(user: string): void {
        const draw: Draw = {
            user,
            texts: [...new Array(this.blackCard.pick)].map(() => this.whiteCards.shift())
        }
        this.draws.push(draw)
        if (this.blackCard.pick == 1) {
            globals.twitchChat.sendChatMessage(`You drew a card that says "${draw.texts[0]}".`, user, null);
        } else {
            globals.twitchChat.sendChatMessage(`You drew ${this.blackCard.pick} cards that say "${draw.texts.join('", "')}".`, user, null);
        }
        this.sendState()
    }

    userHasVoted(user: string): boolean {
        return user in this.votes
    }

    vote(user: string, index: number): boolean {
        if (index < this.draws.length) {
            this.votes[user] = index
            return true
        }

        return false
    }

    getWinners(): Draw[] {
        const values = Object.values(this.votes)

        // no votes = no winner
        if (!values.length) return [];

        const sorted = values.reduce((acc, index) => {
            acc[index] += 1
            return acc
        }, new Array(this.draws.length).fill(0)).map((votes, index) => {
            return {votes, draw: this.draws[index]}
        }).sort((a, b) => b.votes - a.votes)

        const max = sorted[0].votes

        return sorted.filter(x => x.votes >= max).map(x => x.draw)
    }

    stop(): void {
        this.phase = GamePhase.Finished
        globals.commandManager.unregisterSystemCommand(CardCommand.definition.id)
        globals.commandManager.unregisterSystemCommand(VoteCommand.definition.id)
        this.sendState()
        globals.eventManager.triggerEvent('de.justjakob.cahgame', 'game-ended', {blackCard: this.blackCard, winners: this.winners})
        clearTimeout(this.timeout)
        CahGame.currentGame = null;
    }
}