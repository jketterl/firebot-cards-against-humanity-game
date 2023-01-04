import {ReplaceVariable} from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import {Effects} from "@crowbartools/firebot-custom-scripts-types/types/effects";
import {Draw, BlackCard} from "./game";

const CahBlackCardVariable: ReplaceVariable = {
    definition: {
        handle: "cahBlackCard",
        description: "Cards Against Humanity black card",
        triggers: {
            event: [
                "de.justjakob.cahgame:game-started",
                "de.justjakob.cahgame:game-ended"
            ],
            manual: true
        },
        possibleDataOutput: [
            "text"
        ]
    },
    evaluator(trigger: Effects.Trigger, ...args): any {
        const blackCard = (trigger.metadata.eventData.blackCard as BlackCard)
        return blackCard.text.replace(/_/g, '[blank]').replace(/\\n/g, '\n')
    }
}

const CahWinnerVariable: ReplaceVariable = {
    definition: {
        handle: "cahWinner",
        description: "Winner of the Cards Against Humanity game",
        triggers: {
            event: [
                "de.justjakob.cahgame:game-ended"
            ],
            manual: true
        },
        possibleDataOutput: [
            "text"
        ]
    },
    evaluator(trigger: Effects.Trigger, ...args): any {
        return (trigger.metadata.eventData.winner as Draw)?.user || ''
    }
}

const CahWinningComboVariable: ReplaceVariable = {
    definition: {
        handle: "cahWinningCombo",
        description: "Winning Combo of the Cards Against Humanity game",
        triggers: {
            event: [
                "de.justjakob.cahgame:game-ended"
            ],
            manual: true
        },
        possibleDataOutput: [
            "text"
        ]
    },
    evaluator(trigger: Effects.Trigger, ...args): any {
        const draw = (trigger.metadata.eventData.winner as Draw)
        if (!draw) return '';
        const blackCard = (trigger.metadata.eventData.blackCard as BlackCard)
        const replacements = draw.texts.map(x => `[${x}]`)
        let result = blackCard.text.replace(/_/g, () => replacements.shift())
        if (replacements.length) {
            result += ' ' + replacements.join(' ')
        }
        return result.replace(/\\n/g, '\n')
    }
}

export {
    CahBlackCardVariable,
    CahWinnerVariable,
    CahWinningComboVariable
}