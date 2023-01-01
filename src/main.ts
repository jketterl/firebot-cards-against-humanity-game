import {Firebot} from "@crowbartools/firebot-custom-scripts-types";
import GameDefinition from "./gamedef";
import globals from "./globals";
import CahEventSource from "./events";
import CahOverlay from "./overlay";
import CahTriggerEffect from "./trigger";

const script: Firebot.CustomScript = {
    run: runRequest => {
        // this is ugly, but i currently don't know how to get to these objects at a later point.
        globals.gameManager = runRequest.modules.gameManager
        globals.commandManager = runRequest.modules.commandManager
        globals.twitchChat = runRequest.modules.twitchChat
        globals.httpServer = runRequest.modules.httpServer
        globals.eventManager = runRequest.modules.eventManager
        runRequest.modules.gameManager.registerGame(GameDefinition)
        runRequest.modules.eventManager.registerEventSource(CahEventSource)
        runRequest.modules.effectManager.registerEffect(CahOverlay)
        runRequest.modules.effectManager.registerEffect(CahTriggerEffect)
    },
    getDefaultParameters: () => {
        return {}
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

export default script