import {Effects} from "@crowbartools/firebot-custom-scripts-types/types/effects";
import {Draw, GamePhase} from "./game";

const cahStyles = `
    .cah {
        background-color: rgba(0, 0, 0, 0.25);
        border-radius: 10px;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        box-sizing: border-box;
        font-family: "HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
        font-weight: bold;
        font-size: 20pt;
        color: black;
    }
    
    .cah-cards {
        display: flex;
        flex-direction: row;
        justify-content: center;
    }
    
    .cah-card {
        background-color: white;
        border-radius: 10px;
        width: 200px;
        height: 300px;
        padding: 20px;
        margin: 10px;
        display: flex;
        flex-direction: column;
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
        background-color: white;
        border-radius: 10px;
        color: black;
        margin-top: 20px;
        padding: 20px;
        text-align: center;
    }
    
    .cah-phase--drawing .cah-whitecards {
        display: flex;
        flex-direction: column;
    }
    
    .cah-phase--drawing .cah-card--white {
        height: unset;
    }
    
    .cah-phase--drawing .cah-card--white .cah-text {
        display: none;
        height: unset;
    }
    
    .cah-vote {
        display: none;
        text-align: center;
    }
    
    .cah-phase--voting .cah-card--white .cah-vote {
        display: unset;
    }
    
    .cah-phase--voting .cah-card--white .cah-user {
        display: none;
    }
`

type OverlayData = {
    blackCard: string;
    whiteCards: Draw[];
    phase: GamePhase;
    winner?: Draw;
    drawingTime: number;
    votingTime: number;
    lingerTime: number;
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
                console.info(data);

                const $wrapper = $('.wrapper')
                let $el = $wrapper.find('.cah')

                if (data.phase) {
                    if (data.phase && data.phase == 'finished') {
                        if (data.winner) {
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
                            <div class="cah">
                                <div class="cah-cards">
                                    <div class="cah-card cah-card--black"><div class="cah-text"></div></div>
                                    <div class="cah-whitecards"></div>
                                </div>
                                <div class="cah-footer">
                                    <span class="cah-message">Type "!card" in chat to draw a card!</span>
                                    <span class="cah-countdown"><span class="cah-remaining">${data.drawingTime}</span> seconds left!</span>
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
                    $el.find('.cah-card--black .cah-text').text(data.blackCard.replace(/_/g, "____________").replace(/\\n/g, "<br/>"))

                    const renderDraw = (draw: Draw, index: number) => `
                        <div class="cah-card cah-card--white">
                            <div class="cah-text">${draw.text}</div>
                            <div class="cah-user">${draw.user}</div>
                            <div class="cah-vote">!vote ${index}</div>
                        </div>
                    `

                    if (data.winner) {
                        $el.find('.cah-whitecards').html(renderDraw(data.winner, 0))
                    } else {
                        $el.find('.cah-whitecards').html(data.whiteCards.map(renderDraw).join())
                    }

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