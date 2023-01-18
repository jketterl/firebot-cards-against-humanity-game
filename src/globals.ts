import {GameManager, GameSettings} from "@crowbartools/firebot-custom-scripts-types/types/modules/game-manager";
import {CommandManager} from "@crowbartools/firebot-custom-scripts-types/types/modules/command-manager";
import {TwitchChat} from "@crowbartools/firebot-custom-scripts-types/types/modules/twitch-chat";
import {EventManager} from "@crowbartools/firebot-custom-scripts-types/types/modules/event-manager";

type Globals = {
    commandManager: CommandManager;
    twitchChat: TwitchChat;
    httpServer: any;
    eventManager: EventManager;
    settings: GameSettings;
}

const globals: Globals = {
    commandManager: null,
    twitchChat: null,
    httpServer: null,
    eventManager: null,
    settings: null
}

export default globals