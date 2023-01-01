import * as fs from "fs";
import globals from "./globals";
import {CardCommand} from "./commands";

type BlackCard = {
    text: string;
    draws: number;
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
    draws: Record<string, string> = {}

    constructor(blackCard: BlackCard, whiteCards: string[]) {
        this.blackCard = blackCard
        this.whiteCards = whiteCards
        this.sendState()
        globals.eventManager.triggerEvent('de.justjakob.cahgame', 'game-started', {})
        globals.commandManager.registerSystemCommand(CardCommand)
    }

    sendState(): void {
        globals.httpServer.sendToOverlay("cah", {blackCard: this.blackCard.text, whiteCards: this.draws});
    }

    userHasDrawn(user: string): boolean {
        return user in this.draws
    }

    draw(user: string): void {
        this.draws[user] = this.whiteCards.shift()
        this.sendState()
    }
}