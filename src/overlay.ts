import {Effects} from "@crowbartools/firebot-custom-scripts-types/types/effects";
import {Draw, GamePhase} from "./game";

const cahStyles = `
    .cah {
        width: 100vw;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .cah.cah--top {
        align-items: start;
    }
    
    .cah.cah--bottom {
        align-items: end;
    }
    
    .cah.cah--left {
        justify-content: left;
    }
    
    .cah.cah--right {
        justify-content: right;
    }

    .cah-wrapper {
        background-color: rgba(0, 0, 0, 0.25);
        border-radius: 10px;
        box-sizing: border-box;
        font-family: "HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
        font-weight: bold;
        font-size: 20pt;
        color: black;
        min-width: 700px;
        max-height: 100vh;
        display: flex;
        flex-direction: column;
        flex-grow: 0;
        margin: 20px;
    }
    
    .cah-cards {
        flex: 1;
        display: flex;
        flex-direction: row;
        justify-content: center;
        overflow: hidden;
        align-items: start;
    }
    
    .cah-card {
        background-color: white;
        border-radius: 10px;
        width: 200px;
        min-height: 300px;
        padding: 20px;
        margin: 10px;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
    }
    
    .cah-text {
        flex: 1;
    }
    
    .cah-user {
        text-align: center;
        font-size: 16pt;
        font-style: italic;
    }
    
    .cah-card--black {
        background-color: black;
        color: white;
    }
    
    .cah-footer {
        flex: 0;
        background-color: white;
        border-radius: 10px;
        color: black;
        padding: 20px;
        text-align: center;
    }
    
    .cah-whitecards {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }
    
    .cah-cardstack {
        display: flex;
        flex-direction: column;
        min-height: 340px;
        background-color: white;
        border-radius: 10px;
        margin: 10px;
    }
    
    .cah-cardstack > .cah-card {
        border-top: 1px solid black;
        min-height: unset;
        margin: 0;
        flex: 1 0 auto;
    }
    
    .cah-cardstack > .cah-card:first-child {
        border-top: none;
    }
    
    .cah-cardstack .cah-user,
    .cah-cardstack .cah-vote {
        padding: 5px;
    }
    
    .cah-phase--drawing .cah-card--white .cah-text {
        display: none;
        height: unset;
    }
    
    .cah-vote {
        display: none;
        text-align: center;
    }
    
    .cah-phase--voting .cah-cardstack .cah-vote {
        display: unset;
    }
    
    .cah-phase--voting .cah-cardstack .cah-user {
        display: none;
    }
`

type OverlayData = {
    blackCard: string;
    whiteCards: Draw[];
    phase: GamePhase;
    winners: Draw[];
    drawingTime: number;
    votingTime: number;
    lingerTime: number;
    position: string;
}

type Timer = {
    remaining: number;
    interval?: NodeJS.Timeout;
    phase: GamePhase;
}

const CahOverlay: Effects.EffectType<any, OverlayData> = {
    definition: {
        id: "de.justjakob.cahmangame::overlayEffect",
        name: "Cards Against Humanity overlay",
        description: "Cards Against Humanity overlay",
        icon: "clone",
        categories: [],
        dependencies: [],
    },
    optionsTemplate: ``,
    optionsController: ($scope, utilityService) => {

    },
    optionsValidator: effect => {
        return []
    },
    onTriggerEvent: async event => {
        return true;
    },
    overlayExtension: {
        dependencies: {
            css: [],
            globalStyles: cahStyles,
            js: []
        },
        event: {
            name: "cah",
            onOverlayEvent: data => {
                const $wrapper = $('.wrapper')
                let $el = $wrapper.find('.cah')

                const selectedClasses = data.position.split('-').map(p => 'cah--' + p).join(' ');
                const allClasses = ['top', 'bottom', 'left', 'right', 'center'].map(p => 'cah--' + p).join(' ');
                $el.removeClass(allClasses).addClass(selectedClasses);

                if (data.phase) {
                    if (data.phase && data.phase == 'finished') {
                        if (data.winners.length) {
                            setTimeout(() => {
                                $el.remove()
                            }, data.lingerTime * 1000)
                        } else {
                            $el.remove()
                            return
                        }
                    }

                    if (!$el.length) {
                        $el = $(`
                            <div class="cah ${selectedClasses}">
                                <div class="cah-wrapper">
                                    <div class="cah-cards">
                                        <div class="cah-card cah-card--black"><div class="cah-text"></div></div>
                                        <div class="cah-whitecards"></div>
                                    </div>
                                    <div class="cah-footer">
                                        <span class="cah-message">Type "!card" in chat to draw a card!</span>
                                        <span class="cah-countdown"><span class="cah-remaining">${data.drawingTime}</span> seconds left!</span>
                                    </div>
                                </div>
                            </div>
                        `)
                        $wrapper.append($el)

                        const timer: Timer = {
                            interval: null,
                            remaining: data.drawingTime,
                            phase: data.phase
                        }
                        $el.data('timer', timer);
                    }

                    $el.removeClass('cah-phase--voting cah-phase--drawing cah-phase--finished').addClass('cah-phase--' + data.phase)
                    $el.find('.cah-card--black .cah-text').html(data.blackCard.replace(/_/g, "____________").replace(/\\n/g, "<br/>"))

                    const renderDraw = (draw: Draw, index: number) => `
                        <div class="cah-cardstack">
                            ${draw.texts.map((text) => `
                                <div class="cah-card cah-card--white">
                                    <div class="cah-text">${text}</div>
                                </div>
                            `).join('')}
                            <div class="cah-user">${draw.user}</div>
                            <div class="cah-vote">!vote ${index + 1}</div>
                        </div>
                    `

                    const cards = data.winners.length ? data.winners : data.whiteCards
                    $el.find('.cah-whitecards').html(cards.map(renderDraw).join(''))

                    const timer: Timer = $el.data('timer');
                    if (timer) {
                        const $message = $el.find('.cah-message');
                        const $countdown = $el.find('.cah-countdown');
                        const $remaining = $countdown.find('.cah-remaining');

                        if (timer.phase !== data.phase) {
                            switch (data.phase) {
                                case 'drawing':
                                    timer.remaining = data.drawingTime
                                    break;
                                case 'voting':
                                    $message.text("Vote for your favorite card now!")
                                    timer.remaining = data.votingTime
                                    break
                                case 'finished':
                                    $message.text("We have a winner!")
                                    $countdown.text('')
                                    break
                            }
                            timer.phase = data.phase
                        }

                        if (!timer.interval) {
                            timer.interval = setInterval(() => {
                                if (--timer.remaining <= 0) {
                                    clearInterval(timer.interval);
                                    timer.interval = null;
                                }
                                $remaining.text(timer.remaining)
                            }, 1000)
                        }
                    }
                } else {
                    $el.remove()
                }
            }
        }
    }
}

export default CahOverlay