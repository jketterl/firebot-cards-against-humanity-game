import {FirebotGame} from "@crowbartools/firebot-custom-scripts-types/types/modules/game-manager";
import globals from "./globals";
import {CahCommand} from "./commands";
import {CahGame} from "./game";

const GameDefinition: FirebotGame = {
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
                    tip: "",
                    showBottomHr: false,
                    default: "",
                    sortRank: 2,
                    validation: {
                        required: true
                    }
                },
            }
        },
        gameSettings: {
            title: "Game settings",
            description: "General game settings",
            sortRank: 3,
            settings: {
                drawingTime: {
                    type: "number",
                    title: "Drawing time",
                    description: "How long should the drawing phase last?",
                    tip: "Time in seconds",
                    showBottomHr: false,
                    default: 60,
                    sortRank: 4,
                    validation: {
                        required: true,
                        min: 0
                    }
                },
                votingTime: {
                    type: "number",
                    title: "Voting time",
                    description: "How long should the voting phase last?",
                    tip: "Time in seconds",
                    showBottomHr: false,
                    default: 60,
                    sortRank: 5,
                    validation: {
                        required: true,
                        min: 0
                    }
                },
                lingerTime: {
                    type: "number",
                    title: "Linger time",
                    description: "How long should the voting results stay on screen?",
                    tip: "Time in seconds",
                    showBottomHr: false,
                    default: 10,
                    sortRank: 6,
                    validation: {
                        required: true,
                        min: 0
                    }
                }
            }
        },
        overlaySettings: {
            title: "Overlay settings",
            description: "Change on-stream overlay behaviour",
            sortRank: 7,
            settings: {
                position: {
                    type: "enum",
                    title: "Overlay position",
                    description: "Where should the overlay appear on screen?",
                    tip: "",
                    showBottomHr: false,
                    default: "center-center",
                    sortRank: 8,
                    //@ts-ignore firebot types don't know about enum options
                    options: {
                        "top-left": "Top left",
                        "top-center": "Top center",
                        "top-right": "Top right",
                        "center-left": "Center left",
                        "center-center": "Center",
                        "center-right": "Center right",
                        "bottom-left": "Bottom left",
                        "bottom-center": "Bottom center",
                        "bottom-right": "Bottom right"
                    },
                    validation: {
                        required: true
                    }
                },
            }
        },
        chatSettings: {
            title: "Chat settings",
            description: "Configure chat messages",
            sortRank: 9,
            settings: {
                whisperAccount: {
                    type: "chatter-select",
                    title: "Card Whisper account",
                    description: "What account should be used to whisper the drawn card to users?",
                    tip: "",
                    showBottomHr: false,
                    default: null,
                    sortRank: 9,
                    validation: {
                        required: false
                    }
                }
            }
        }
    },
    onLoad: gameSettings => {
        if (gameSettings) globals.settings = gameSettings;
        globals.commandManager.registerSystemCommand(CahCommand)
    },
    onUnload: gameSettings => {
        // this seems to be undefined, so i don't think this works as intended
        //globals.settings = gameSettings
        CahGame.currentGame = null
        globals.commandManager.unregisterSystemCommand(CahCommand.definition.id)
    },
    onSettingsUpdate: gameSettings => {
        // this seems to be undefined, so i don't think this works as intended
        //globals.settings = gameSettings
        CahGame.currentGame?.sendState()
    }
}

export default GameDefinition;