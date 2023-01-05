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

function naturalJoin(input: string[]): string {
    if (!input.length) return ''
    if (input.length == 1) return input[0]
    return input.slice(0, -1).join(', ') + ' and ' + input.slice(-1)
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
        const draws = trigger.metadata.eventData.winners as Draw[]
        const users = draws.map(x => x.user)
        return naturalJoin(users)
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
        const draws = (trigger.metadata.eventData.winners as Draw[])
        const blackCard = (trigger.metadata.eventData.blackCard as BlackCard)
        return naturalJoin(draws.map(draw => {
            const replacements = draw.texts.map(x => `[${x}]`)
            let result = blackCard.text.replace(/_/g, () => replacements.shift())
            if (replacements.length) {
                result += ' ' + replacements.join(' ')
            }
            return result.replace(/\\n/g, '\n')
        }))
    }
}

export {
    CahBlackCardVariable,
    CahWinnerVariable,
    CahWinningComboVariable
}