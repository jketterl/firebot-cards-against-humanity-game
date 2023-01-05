import {EventFilter} from "@crowbartools/firebot-custom-scripts-types/types/modules/event-filter-manager";

const CahGameHasWinner: EventFilter = {
    id: 'de.justjakob.cahgame:has-winner',
    name: 'Winner',
    description: 'Has the game ended with a winner?',
    events: [
        { eventSourceId: 'de.justjakob.cahgame', eventId: 'game-ended' }
    ],
    comparisonTypes: ['is', 'is not'],
    valueType: 'preset',
    presetValues(...args): Promise<any[]> {
        return Promise.resolve([
            {
                value: "available",
                display: "Available"
            }
        ])
    },
    predicate(filterSettings: { comparisonType: string; value: any }, eventData: { eventSourceId: string; eventId: string; eventMeta: Record<string, any> }): Promise<boolean> {
        const available = !!eventData.eventMeta.winners.length
        switch (filterSettings.comparisonType) {
            case 'is':
                return Promise.resolve(available)
            case 'is not':
                return Promise.resolve(!available)
        }
    }
}

export { CahGameHasWinner }