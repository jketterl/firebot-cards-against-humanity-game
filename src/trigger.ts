import {Effects} from "@crowbartools/firebot-custom-scripts-types/types/effects";
import globals from "./globals";
import {CahGame} from "./game";

const CahTriggerEffect: Effects.EffectType<any> = {
    definition: {
        id: "de.justjakob.cahgame::startEffect",
        name: "Trigger Cards Against Humanity",
        description: "Starts a new game of Cards Against Humanity",
        icon: "fa-clone",
        categories: [],
        dependencies: [],
    },
    onTriggerEvent: async event => {
        if (!globals.settings.active) return Promise.reject(new Error("Cards Against Humanity game is not active"))
        if (CahGame.currentGame) return Promise.reject(new Error("There is already a game of Cards Against Humanity running"))
        CahGame.currentGame = await CahGame.newGame()
    },
    optionsTemplate: ''
}

export default CahTriggerEffect