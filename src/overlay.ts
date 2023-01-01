import {Effects} from "@crowbartools/firebot-custom-scripts-types/types/effects";

const cahStyles = `
    .cah {
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
    
    .cah-card {
        background-color: white;
        border-radius: 10px;
        width: 200px;
        height: 300px;
        padding: 20px;
        margin: 10px;
        float: left;
        display: flex;
        flex-direction: column;
    }
    
    .cah-text {
        flex: 1;
    }
    
    .cah-user {
        font-size: 16pt;
        font-style: italic;
    }
    
    .cah-card--black {
        background-color: black;
        color: white;
    }
    
    .cah-message {
        background-color: white;
        border-radius: 10px;
        color: black;
        margin-top: 20px;
        padding: 20px;
        clear: both;
    }
`

type OverlayData = {
    blackCard?: string;
    whiteCards: Record<string, string>
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

                if (data.blackCard) {
                    if (!$el.length) {
                        $el = $(`
                            <div class="cah">
                                <div class="cah-card cah-card--black"><div class="cah-text"></div></div>
                                <div class="cah-whitecards"></div>
                                <div class="cah-message">Type "!card" in chat to draw a card! <span class="cah-remaining"></span> seconds left!</div>
                            </div>
                        `)
                        $wrapper.append($el)
                        const $remaining = $el.find('.cah-remaining');

                        // TODO make this configurable
                        let remaining = 60
                        $remaining.text(remaining)
                        const interval = setInterval(() => {
                            if (--remaining <= 0) {
                                clearInterval(interval);
                            }
                            $remaining.text(remaining)
                        }, 1000)
                    }

                    $el.find('.cah-card--black .cah-text').text(data.blackCard.replace(/_/g, "____________").replace(/\\n/g, "<br/>"))
                    $el.find('.cah-whitecards').html(Object.entries(data.whiteCards).map(([user, text]) => {
                        return `<div class="cah-card cah-card--white"><div class="cah-text">${text}</div><div class="cah-user">${user}</div></div>`
                    }).join())
                } else {
                    $el.remove()
                }
            }
        }
    }
}

export default CahOverlay