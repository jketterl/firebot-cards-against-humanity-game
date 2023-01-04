import {EventFilter} from "@crowbartools/firebot-custom-scripts-types/types/modules/event-filter-manager";

const CahGameHasWinner: EventFilter = {
    id: 'de.justjakob.cahgame:has-winner',
    name: 'Winner',
    description: 'Has the game ended with a winner?',
    events: [
        { eventSourceId: 'de.justjakob.cahgame', eventId: 'game-ended' }
    ],
    comparisonTypes: ['is'],
    valueType: 'preset',
    presetValues(...args): Promise<any[]> {
        return Promise.resolve([
            {
                value: "true",
                display: "Available"
            },
            {
                value: "false",
                display: "Not available"
            }
        ])
    },
    predicate(filterSettings: { comparisonType: string; value: any }, eventData: { eventSourceId: string; eventId: string; eventMeta: Record<string, any> }): Promise<boolean> {
        return Promise.resolve(!!eventData.eventMeta.winner)
    }
}

export { CahGameHasWinner }