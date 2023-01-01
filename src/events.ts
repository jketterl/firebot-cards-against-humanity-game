import {EventSource} from "@crowbartools/firebot-custom-scripts-types/types/modules/event-manager";

const CahEventSource: EventSource = {
    id: "de.justjakob.cahgame",
    name: "Cards Against Humanity",
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

export default CahEventSource