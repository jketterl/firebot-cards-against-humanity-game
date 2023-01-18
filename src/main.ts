import {Firebot} from "@crowbartools/firebot-custom-scripts-types";
import GameDefinition from "./gamedef";
import globals from "./globals";
import CahEventSource from "./events";
import CahOverlay from "./overlay";
import CahTriggerEffect from "./trigger";
import {CahBlackCardVariable, CahWinnerVariable, CahWinningComboVariable} from "./variables";
import {CahGameHasWinner} from "./filters";

const script: Firebot.CustomScript = {
    run: runRequest => {
        // this is ugly, but i currently don't know how to get to these objects at a later point.
        globals.commandManager = runRequest.modules.commandManager
        globals.twitchChat = runRequest.modules.twitchChat
        globals.httpServer = runRequest.modules.httpServer
        globals.eventManager = runRequest.modules.eventManager
        runRequest.modules.gameManager.registerGame(GameDefinition)
        runRequest.modules.eventManager.registerEventSource(CahEventSource)
        runRequest.modules.effectManager.registerEffect(CahOverlay)
        runRequest.modules.effectManager.registerEffect(CahTriggerEffect);
        [
            CahBlackCardVariable,
            CahWinnerVariable,
            CahWinningComboVariable
        ].forEach(v => runRequest.modules.replaceVariableManager.registerReplaceVariable(v))
        runRequest.modules.eventFilterManager.registerFilter(CahGameHasWinner)
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