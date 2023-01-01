import {SystemCommand} from "@crowbartools/firebot-custom-scripts-types/types/modules/command-manager";
import {CahGame} from "./game";
import globals from "./globals";

const CahCommand: SystemCommand = {
    definition: {
        id: "de.justjakob.cahgame::cah",
        name: "Cards Against Humanity control",
        active: true,
        trigger: "!cah",
        description: "Cards Against Humanity game control",
        subCommands: [{
            name: "Cards Against Humanity start command",
            active: true,
            trigger: "",
            id: "de.justjakob.cahgame::start",
            arg: "start",
            regex: false,
            usage: "start",
            description: "Start a new game of Cards Against Humanity."
        }]
    },
    onTriggerEvent: async event => {
        if (event.userCommand.args.length !== 1) {
            return
        }

        switch (event.userCommand.args[0]) {
            case "start":
                if (CahGame.currentGame) {
                    //@ts-ignore firebot types are not updated for message responses
                    globals.twitchChat.sendChatMessage("There is already a game of Cards Against Humanity running!", null, null, event.chatMessage.id)
                    return
                }
                CahGame.currentGame = await CahGame.newGame()
        }
    }
}

const CardCommand: SystemCommand = {
    definition: {
        id:"de.justjakob.cahgame::card",
        name:"Draw card",
        active: true,
        trigger: "!card",
        description: "Draw a Cards Against Humanity white card"
    },
    onTriggerEvent: event => {
        if (!CahGame.currentGame) {
            return
        }

        const { userCommand } = event
        const username = userCommand.commandSender

        if (CahGame.currentGame.userHasDrawn(username)) {
            //@ts-ignore firebot types are not updated for message responses
            globals.twitchChat.sendChatMessage(`Sorry, but you can only draw once per round.`, null, null, event.chatMessage.id);
            return
        }

        CahGame.currentGame.draw(username)
    }
}

export { CahCommand, CardCommand }