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

const cardCommand = {
    definition: {
        id:"de.justjakob.cahgame::card",
        name:"Draw card",
        active: true,
        trigger: "!card",
        description: "Draw a Cards Against Humanity white card"
    },
    onTriggerEvent: event => {
        if (!state.currentGame) {
            return
        }

        const { userCommand } = event
        const username = userCommand.commandSender

        if (username in state.currentGame.draws) {
            globals.twitchChat.sendChatMessage(`Sorry, but you can only draw once per round.`, null, null, event.chatMessage.id);
            return
        }

        state.currentGame.draws[username] = state.currentGame.whiteCards.shift()
        sendGameState()
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
                whiteCards: shuffle(pack.white),
                draws: {}
            }

            sendGameState()
            globals.eventManager.triggerEvent('de.justjakob.cahgame', 'game-started')
            globals.commandManager.registerSystemCommand(cardCommand)

            resolve()
        })
    })
}

function sendGameState() {
    globals.httpServer.sendToOverlay("cah", {blackCard: state.currentGame.blackCard.text, whiteCards: state.currentGame.draws});
}

const cahStyles = `
    .cah {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        box-sizing: border-box;
        font-family: "HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
        font-weight: bold;
        font-size: 20pt;
        color: black;
    }
    
    .cah-card {
        background-color: white;
        border-radius: 10px;
        width: 200px;
        height: 300px;
        padding: 20px;
        margin: 10px;
        float: left;
        display: flex;
        flex-direction: column;
    }
    
    .cah-text {
        flex: 1;
    }
    
    .cah-user {
        font-size: 16pt;
        font-style: italic;
    }
    
    .cah-card--black {
        background-color: black;
        color: white;
    }
    
    .cah-message {
        background-color: white;
        border-radius: 10px;
        color: black;
        margin-top: 20px;
        padding: 20px;
        clear: both;
    }
`

const cahOverlayEffect = {
    definition: {
        id: "de.justjakob.cahmangame::overlayEffect",
        name: "Cards Against Humanity overlay",
        description: "Cards Against Humanity overlay",
        icon: "clone",
        categories: [],
        dependency: [],
    },
    globalSettings: {},
    optionsTemplate: ``,
    optionsController: ($scope, utilityService) => {

    },
    optionsValidator: effect => {
        return []
    },
    onTriggerEvent: async event => {
        return true;
    },
    overlayExtension: {
        dependencies: {
            css: [],
            globalStyles: cahStyles,
            js: []
        },
        event: {
            name: "cah",
            onOverlayEvent: data => {
                console.info(data);

                const $wrapper = $('.wrapper')
                let $el = $wrapper.find('.cah')

                if (data.blackCard) {
                    if (!$el.length) {
                        $el = $(`
                            <div class="cah">
                                <div class="cah-card cah-card--black"><div class="cah-text"></div></div>
                                <div class="cah-whitecards"></div>
                                <div class="cah-message">Type "!card" in chat to draw a card! <span class="cah-remaining"></span> seconds left!</div>
                            </div>
                        `)
                        $wrapper.append($el)
                        const $remaining = $el.find('.cah-remaining');

                        // TODO make this configurable
                        let remaining = 60
                        $remaining.text(remaining)
                        const interval = setInterval(() => {
                            if (--remaining <= 0) {
                                clearInterval(interval);
                            }
                            $remaining.text(remaining)
                        }, 1000)
                    }

                    $el.find('.cah-card--black .cah-text').text(data.blackCard.replace(/_/g, "____________").replace(/\\n/g, "<br/>"))
                    $el.find('.cah-whitecards').html(Object.entries(data.whiteCards).map(([user, text]) => {
                        return $(`
                            <div class="cah-card cah-card--white"><div class="cah-text">${text}</div><div class="cah-user">${user}</div></div>
                        `)
                    }))
                } else {
                    $el.remove()
                }
            }
        }
    }
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
    httpServer: null,
    eventManager: null,
}

module.exports = {
    run: runRequest => {
        // this is ugly, but i currently don't know how to get to these objects at a later point.
        globals.gameManager = runRequest.modules.gameManager
        globals.commandManager = runRequest.modules.commandManager
        globals.twitchChat = runRequest.modules.twitchChat
        globals.httpServer = runRequest.modules.httpServer
        globals.eventManager = runRequest.modules.eventManager
        runRequest.modules.gameManager.registerGame(gameDef)
        runRequest.modules.eventManager.registerEventSource(cahEventSource)
        runRequest.modules.effectManager.registerEffect(cahOverlayEffect)
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