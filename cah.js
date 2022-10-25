const fs = require('fs')

const state = {
    currentGame: null
}

const cahCommand = {
    definition: {
        id: "de.justjakob.cahgame::cah",
        name: "Cards Against Humanity control",
        active: true,
        trigger: "!cah",
        description: "Cards Against Humanity game control",
        subCommands: [{
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
                if (state.currentGame) {
                    globals.twitchChat.sendChatMessage("There is already a game of Cards Against Humanity running!", null, null, event.chatMessage.id)
                    return
                }
                await startGame();
        }
    }
}

function shuffle(input) {
    const array = [...input]
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
        // swap elements array[i] and array[j]
        // we use "destructuring assignment" syntax to achieve that
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array
}

async function startGame() {
    return new Promise((resolve, reject) => {
        fs.readFile(globals.settings.settings.cardSource.packFile, "utf-8", function(err, data) {
            if (err) return reject(err)

            const pack = JSON.parse(data)

            state.currentGame = {
                blackCard: pack.black[Math.floor(Math.random() * pack.black.length)],
                whiteCards: shuffle(pack.white)
            }

            console.info(state.currentGame)

            globals.eventManager.triggerEvent('de.justjakob.cahgame', 'game-started')

            resolve()
        })
    })
}


const cahTriggerEffect = {
    definition: {
        id: "de.justjakob.cahgame::startEffect",
        name: "Trigger Cards Against Humanity",
        description: "Starts a new game of Cards Against Humanity",
        icon: "fa-clone",
        categories: [],
        dependency: [],
    },
    onTriggerEvent: async event => {
        if (!globals.settings.active) return Promise.reject(new Error("Cards Against Humanity game is not active"))
        if (state.currentGame) return Promise.reject(new Error("There is already a game of Cards Against Humanity running"))
        await startGame()
    }
}

const cahEventSource = {
    id: "de.justjakob.cahgame",
    name: "Cards Against Humanity",
    description: "Events from the Cards Against Humanity game.",
    events: [{
        id: "game-started",
        name: "Game started",
        description: "When a new game is started",
        cached: false
    },{
        id: "game-ended",
        name: "Game ended",
        description: "When a game ends (independent of outcome)",
        cached: false
    }]
}

const gameDef = {
    id: "de.justjakob.cahgame",
    name: "Cards Against Humanity",
    subtitle: "Fill the blanks",
    description: "A fill-in-the-blank party game that turns your awkward personality and lackluster social skills into hours of fun!",
    icon: "clone", // Font Awesome 5 icon to use for the game
    settingCategories: {
        cardSource: {
            title: "Pack settings",
            description: "Where to find the card files",
            sortRank: 1,
            settings: {
                packFile: {
                    type: "filepath",
                    title: "CAH JSON file",
                    description: "Cards Against Humanity pack file (available from https://crhallberg.com/cah/)",
                    default: "",
                    sortRank: 2,
                    validation: {
                        required: true
                    }
                },
            }
        },
    },
    onLoad: gameSettings => {
        if (gameSettings) globals.settings = gameSettings;
        globals.commandManager.registerSystemCommand(cahCommand)
    },
    onUnload: gameSettings => {
        // this seems to be undefined, so i don't think this works as intended
        //globals.settings = gameSettings
        state.currentGame = null
        globals.commandManager.unregisterSystemCommand(cahCommand.definition.id)
    },
    onSettingsUpdate: gameSettings => {
        // this seems to be undefined, so i don't think this works as intended
        //globals.settings = gameSettings
    }
}

const globals = {
    gameManager: null,
    commandManager: null,
    twitchChat: null,
    eventManager: null,
}

module.exports = {
    run: runRequest => {
        // this is ugly, but i currently don't know how to get to these objects at a later point.
        globals.gameManager = runRequest.modules.gameManager
        globals.commandManager = runRequest.modules.commandManager
        globals.twitchChat = runRequest.modules.twitchChat
        globals.eventManager = runRequest.modules.eventManager
        runRequest.modules.gameManager.registerGame(gameDef)
        runRequest.modules.eventManager.registerEventSource(cahEventSource)
        runRequest.modules.effectManager.registerEffect(cahTriggerEffect)
    },
    getScriptManifest: () => {
        return {
            name: "Cards Against Humanity",
            description: "Cards Against Humanity game",
            author: "Jakob Ketterl",
            version: "0.1"
        }
    }
}