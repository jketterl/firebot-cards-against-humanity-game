(()=>{"use strict";var __webpack_modules__={49:function(__unused_webpack_module,exports,__webpack_require__){var __awaiter=this&&this.__awaiter||function(thisArg,_arguments,P,generator){return new(P||(P=Promise))((function(resolve,reject){function fulfilled(value){try{step(generator.next(value))}catch(e){reject(e)}}function rejected(value){try{step(generator.throw(value))}catch(e){reject(e)}}function step(result){var value;result.done?resolve(result.value):(value=result.value,value instanceof P?value:new P((function(resolve){resolve(value)}))).then(fulfilled,rejected)}step((generator=generator.apply(thisArg,_arguments||[])).next())}))};Object.defineProperty(exports,"__esModule",{value:!0}),exports.VoteCommand=exports.CardCommand=exports.CahCommand=void 0;const game_1=__webpack_require__(769),globals_1=__webpack_require__(888),CahCommand={definition:{id:"de.justjakob.cahgame::cah",name:"Cards Against Humanity control",active:!0,trigger:"!cah",description:"Cards Against Humanity game control",subCommands:[{name:"Cards Against Humanity start command",active:!0,trigger:"",id:"de.justjakob.cahgame::start",arg:"start",regex:!1,usage:"start",description:"Start a new game of Cards Against Humanity."},{name:"Cards Against Humanity stop command",active:!0,trigger:"",id:"de.justjakob.cahgame::stop",arg:"stop",regex:!1,usage:"stop",description:"Stop the currently running game of Cards Against Humanity"}]},onTriggerEvent:event=>__awaiter(void 0,void 0,void 0,(function*(){if(1===event.userCommand.args.length)switch(event.userCommand.args[0]){case"start":if(game_1.CahGame.currentGame)return void globals_1.default.twitchChat.sendChatMessage("There is already a game of Cards Against Humanity running!",null,null,event.chatMessage.id);game_1.CahGame.currentGame=yield game_1.CahGame.newGame();break;case"stop":game_1.CahGame.currentGame&&game_1.CahGame.currentGame.stop(),game_1.CahGame.currentGame=null}}))};exports.CahCommand=CahCommand;const CardCommand={definition:{id:"de.justjakob.cahgame::card",name:"Draw card",active:!0,trigger:"!card",description:"Draw a Cards Against Humanity white card"},onTriggerEvent:event=>{if(!game_1.CahGame.currentGame)return;const{userCommand}=event,username=userCommand.commandSender;game_1.CahGame.currentGame.userHasDrawn(username)?globals_1.default.twitchChat.sendChatMessage("Sorry, but you can only draw once per round.",null,null,event.chatMessage.id):game_1.CahGame.currentGame.draw(username)}};exports.CardCommand=CardCommand;const VoteCommand={definition:{id:"de.justjakob.cahgame::vote",name:"Vote for card",active:!0,trigger:"!vote\\s[0-9]+",description:"Vote for a Cards Against Humanity card combo",triggerIsRegex:!0},onTriggerEvent:event=>{if(!game_1.CahGame.currentGame)return;const{userCommand}=event,username=userCommand.commandSender;game_1.CahGame.currentGame.userHasVoted(username)?globals_1.default.twitchChat.sendChatMessage("Sorry, but you can only vote once per round.",null,null,event.chatMessage.id):game_1.CahGame.currentGame.vote(username,parseInt(userCommand.args[0]))||globals_1.default.twitchChat.sendChatMessage("Invalid vote",null,null,event.chatMessage.id)}};exports.VoteCommand=VoteCommand},242:(__unused_webpack_module,exports)=>{Object.defineProperty(exports,"__esModule",{value:!0});exports.default={id:"de.justjakob.cahgame",name:"Cards Against Humanity",events:[{id:"game-started",name:"Game started",description:"When a new game is started",cached:!1},{id:"game-ended",name:"Game ended",description:"When a game ends (independent of outcome)",cached:!1}]}},769:function(__unused_webpack_module,exports,__webpack_require__){var __awaiter=this&&this.__awaiter||function(thisArg,_arguments,P,generator){return new(P||(P=Promise))((function(resolve,reject){function fulfilled(value){try{step(generator.next(value))}catch(e){reject(e)}}function rejected(value){try{step(generator.throw(value))}catch(e){reject(e)}}function step(result){var value;result.done?resolve(result.value):(value=result.value,value instanceof P?value:new P((function(resolve){resolve(value)}))).then(fulfilled,rejected)}step((generator=generator.apply(thisArg,_arguments||[])).next())}))};Object.defineProperty(exports,"__esModule",{value:!0}),exports.CahGame=exports.GamePhase=void 0;const fs=__webpack_require__(147),globals_1=__webpack_require__(888),commands_1=__webpack_require__(49);var GamePhase;!function(GamePhase){GamePhase.Drawing="drawing",GamePhase.Voting="voting",GamePhase.Finished="finished"}(GamePhase=exports.GamePhase||(exports.GamePhase={}));class CahGame{static newGame(){return __awaiter(this,void 0,void 0,(function*(){return new Promise(((resolve,reject)=>{fs.readFile(globals_1.default.settings.settings.cardSource.packFile,"utf-8",(function(err,data){if(err)return reject(err);const pack=JSON.parse(data);resolve(new CahGame(pack.black[Math.floor(Math.random()*pack.black.length)],CahGame.shuffle(pack.white)))}))}))}))}static shuffle(input){const array=[...input];for(let i=array.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[array[i],array[j]]=[array[j],array[i]]}return array}constructor(blackCard,whiteCards){this.draws=[],this.phase=GamePhase.Drawing,this.votes={},this.blackCard=blackCard,this.whiteCards=whiteCards,this.sendState(),globals_1.default.eventManager.triggerEvent("de.justjakob.cahgame","game-started",{}),globals_1.default.commandManager.registerSystemCommand(commands_1.CardCommand),this.timeout=setTimeout((()=>{this.nextPhase()}),1e3*globals_1.default.settings.settings.gameSettings.drawingTime)}nextPhase(){switch(this.timeout=null,this.phase){case GamePhase.Drawing:if(!this.draws.length)return globals_1.default.twitchChat.sendChatMessage("No card draws, Cards Against Humanity aborted."),void this.stop();this.draws=CahGame.shuffle(this.draws),this.phase=GamePhase.Voting,this.timeout=setTimeout((()=>{this.nextPhase()}),1e3*globals_1.default.settings.settings.gameSettings.votingTime),globals_1.default.commandManager.unregisterSystemCommand(commands_1.CardCommand.definition.id),globals_1.default.commandManager.registerSystemCommand(commands_1.VoteCommand);break;case GamePhase.Voting:this.winner=this.getWinner(),this.stop()}this.sendState()}sendState(){globals_1.default.httpServer.sendToOverlay("cah",{blackCard:this.blackCard.text,whiteCards:this.draws,phase:this.phase,drawingTime:globals_1.default.settings.settings.gameSettings.drawingTime,votingTime:globals_1.default.settings.settings.gameSettings.votingTime,lingerTime:globals_1.default.settings.settings.gameSettings.lingerTime})}userHasDrawn(user){return void 0!==this.draws.find((draw=>draw.user==user))}draw(user){const draw={user,text:this.whiteCards.shift()};this.draws.push(draw),globals_1.default.twitchChat.sendChatMessage(`You drew a card that says "${draw.text}".`,user,null),this.sendState()}userHasVoted(user){return user in this.votes}vote(user,index){return index<this.draws.length&&(this.votes[user]=index,!0)}getWinner(){return Object.values(this.votes).reduce(((acc,index)=>(acc[index]+=1,acc)),new Array(this.draws.length).fill(0)).map(((votes,index)=>({votes,draw:this.draws[index]}))).sort((e=>e.votes))[0].draw}stop(){this.phase=GamePhase.Finished,globals_1.default.commandManager.unregisterSystemCommand(commands_1.CardCommand.definition.id),globals_1.default.commandManager.unregisterSystemCommand(commands_1.VoteCommand.definition.id),this.sendState(),clearTimeout(this.timeout),CahGame.currentGame=null}}exports.CahGame=CahGame},62:(__unused_webpack_module,exports,__webpack_require__)=>{Object.defineProperty(exports,"__esModule",{value:!0});const globals_1=__webpack_require__(888),commands_1=__webpack_require__(49),game_1=__webpack_require__(769),GameDefinition={id:"de.justjakob.cahgame",name:"Cards Against Humanity",subtitle:"Fill the blanks",description:"A fill-in-the-blank party game that turns your awkward personality and lackluster social skills into hours of fun!",icon:"clone",settingCategories:{cardSource:{title:"Pack settings",description:"Where to find the card files",sortRank:1,settings:{packFile:{type:"filepath",title:"CAH JSON file",description:"Cards Against Humanity pack file (available from https://crhallberg.com/cah/)",tip:"",showBottomHr:!1,default:"",sortRank:2,validation:{required:!0}}}},gameSettings:{title:"Game settings",description:"General game settings",sortRank:3,settings:{drawingTime:{type:"number",title:"Voting time",description:"How long should the voting phase last?",tip:"Time in seconds",showBottomHr:!1,default:60,sortRank:4,validation:{required:!0,min:0}},votingTime:{type:"number",title:"Voting time",description:"How long should the voting phase last?",tip:"Time in seconds",showBottomHr:!1,default:60,sortRank:5,validation:{required:!0,min:0}},lingerTime:{type:"number",title:"Linger time",description:"How long should the voting results stay on screen?",tip:"Time in seconds",showBottomHr:!1,default:10,sortRank:6,validation:{required:!0,min:0}}}}},onLoad:gameSettings=>{gameSettings&&(globals_1.default.settings=gameSettings),globals_1.default.commandManager.registerSystemCommand(commands_1.CahCommand)},onUnload:gameSettings=>{game_1.CahGame.currentGame=null,globals_1.default.commandManager.unregisterSystemCommand(commands_1.CahCommand.definition.id)},onSettingsUpdate:gameSettings=>{}};exports.default=GameDefinition},888:(__unused_webpack_module,exports)=>{Object.defineProperty(exports,"__esModule",{value:!0});exports.default={gameManager:null,commandManager:null,twitchChat:null,httpServer:null,eventManager:null,settings:null}},531:function(__unused_webpack_module,exports){var __awaiter=this&&this.__awaiter||function(thisArg,_arguments,P,generator){return new(P||(P=Promise))((function(resolve,reject){function fulfilled(value){try{step(generator.next(value))}catch(e){reject(e)}}function rejected(value){try{step(generator.throw(value))}catch(e){reject(e)}}function step(result){var value;result.done?resolve(result.value):(value=result.value,value instanceof P?value:new P((function(resolve){resolve(value)}))).then(fulfilled,rejected)}step((generator=generator.apply(thisArg,_arguments||[])).next())}))};Object.defineProperty(exports,"__esModule",{value:!0});const CahOverlay={definition:{id:"de.justjakob.cahmangame::overlayEffect",name:"Cards Against Humanity overlay",description:"Cards Against Humanity overlay",icon:"clone",categories:[],dependencies:[]},optionsTemplate:"",optionsController:($scope,utilityService)=>{},optionsValidator:effect=>[],onTriggerEvent:event=>__awaiter(void 0,void 0,void 0,(function*(){return!0})),overlayExtension:{dependencies:{css:[],globalStyles:'\n    .cah {\n        background-color: rgba(0, 0, 0, 0.25);\n        border-radius: 10px;\n        position: absolute;\n        left: 50%;\n        top: 50%;\n        transform: translate(-50%, -50%);\n        box-sizing: border-box;\n        font-family: "HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;\n        font-weight: bold;\n        font-size: 20pt;\n        color: black;\n    }\n    \n    .cah-cards {\n        display: flex;\n        flex-direction: row;\n        justify-content: center;\n    }\n    \n    .cah-card {\n        background-color: white;\n        border-radius: 10px;\n        width: 200px;\n        height: 300px;\n        padding: 20px;\n        margin: 10px;\n        display: flex;\n        flex-direction: column;\n    }\n    \n    .cah-text {\n        flex: 1;\n    }\n    \n    .cah-user {\n        text-align: center;\n        font-size: 16pt;\n        font-style: italic;\n    }\n    \n    .cah-card--black {\n        background-color: black;\n        color: white;\n    }\n    \n    .cah-footer {\n        background-color: white;\n        border-radius: 10px;\n        color: black;\n        margin-top: 20px;\n        padding: 20px;\n    }\n    \n    .cah-phase--drawing .cah-whitecards {\n        display: flex;\n        flex-direction: column;\n    }\n    \n    .cah-phase--drawing .cah-card--white {\n        height: unset;\n    }\n    \n    .cah-phase--drawing .cah-card--white .cah-text {\n        display: none;\n        height: unset;\n    }\n    \n    .cah-vote {\n        display: none;\n        text-align: center;\n    }\n    \n    .cah-phase--voting .cah-card--white .cah-vote {\n        display: unset;\n    }\n    \n    .cah-phase--voting .cah-card--white .cah-user {\n        display: none;\n    }\n',js:[]},event:{name:"cah",onOverlayEvent:data=>{console.info(data);const $wrapper=$(".wrapper");let $el=$wrapper.find(".cah");if(data.phase){if(!$el.length){$el=$('\n                            <div class="cah">\n                                <div class="cah-cards">\n                                    <div class="cah-card cah-card--black"><div class="cah-text"></div></div>\n                                    <div class="cah-whitecards"></div>\n                                </div>\n                                <div class="cah-footer">\n                                    <span class="cah-message">Type "!card" in chat to draw a card!</span>\n                                    <span class="cah-countdown"><span class="cah-remaining"></span> seconds left!</span>\n                                </div>\n                            </div>\n                        '),$wrapper.append($el);const $message=$el.find(".cah-message"),$remaining=$el.find(".cah-remaining");let remaining=0;if($message.data("phase")!==data.phase)switch(data.phase){case"drawing":remaining=data.drawingTime;break;case"voting":$message.text("Vote for your favorite card now!"),remaining=data.votingTime}$message.data("phase",data.phase),console.info("remaining: "+remaining),$remaining.text(remaining);const interval=setInterval((()=>{--remaining<=0&&(clearInterval(interval),$message.text()),$remaining.text(remaining)}),1e3)}$el.removeClass("cah-phase--voting cah-phase--drawing").addClass("cah-phase--"+data.phase),$el.find(".cah-card--black .cah-text").text(data.blackCard.replace(/_/g,"____________").replace(/\\n/g,"<br/>"));const renderDraw=(draw,index)=>`\n                        <div class="cah-card cah-card--white">\n                            <div class="cah-text">${draw.text}</div>\n                            <div class="cah-user">${draw.user}</div>\n                            <div class="cah-vote">!vote ${index}</div>\n                        </div>\n                    `;data.winner?$el.find(".cah-whitecards").html(renderDraw(data.winner,0)):$el.find(".cah-whitecards").html(data.whiteCards.map(renderDraw).join())}else $el.remove()}}}};exports.default=CahOverlay},892:function(__unused_webpack_module,exports,__webpack_require__){var __awaiter=this&&this.__awaiter||function(thisArg,_arguments,P,generator){return new(P||(P=Promise))((function(resolve,reject){function fulfilled(value){try{step(generator.next(value))}catch(e){reject(e)}}function rejected(value){try{step(generator.throw(value))}catch(e){reject(e)}}function step(result){var value;result.done?resolve(result.value):(value=result.value,value instanceof P?value:new P((function(resolve){resolve(value)}))).then(fulfilled,rejected)}step((generator=generator.apply(thisArg,_arguments||[])).next())}))};Object.defineProperty(exports,"__esModule",{value:!0});const globals_1=__webpack_require__(888),game_1=__webpack_require__(769),CahTriggerEffect={definition:{id:"de.justjakob.cahgame::startEffect",name:"Trigger Cards Against Humanity",description:"Starts a new game of Cards Against Humanity",icon:"fa-clone",categories:[],dependencies:[]},onTriggerEvent:event=>__awaiter(void 0,void 0,void 0,(function*(){return globals_1.default.settings.active?game_1.CahGame.currentGame?Promise.reject(new Error("There is already a game of Cards Against Humanity running")):void(game_1.CahGame.currentGame=yield game_1.CahGame.newGame()):Promise.reject(new Error("Cards Against Humanity game is not active"))})),optionsTemplate:""};exports.default=CahTriggerEffect},147:module=>{module.exports=require("fs")}},__webpack_module_cache__={};function __webpack_require__(moduleId){var cachedModule=__webpack_module_cache__[moduleId];if(void 0!==cachedModule)return cachedModule.exports;var module=__webpack_module_cache__[moduleId]={exports:{}};return __webpack_modules__[moduleId].call(module.exports,module,module.exports,__webpack_require__),module.exports}var __webpack_exports__={};(()=>{var exports=__webpack_exports__;const gamedef_1=__webpack_require__(62),globals_1=__webpack_require__(888),events_1=__webpack_require__(242),overlay_1=__webpack_require__(531),trigger_1=__webpack_require__(892),script={run:runRequest=>{globals_1.default.gameManager=runRequest.modules.gameManager,globals_1.default.commandManager=runRequest.modules.commandManager,globals_1.default.twitchChat=runRequest.modules.twitchChat,globals_1.default.httpServer=runRequest.modules.httpServer,globals_1.default.eventManager=runRequest.modules.eventManager,runRequest.modules.gameManager.registerGame(gamedef_1.default),runRequest.modules.eventManager.registerEventSource(events_1.default),runRequest.modules.effectManager.registerEffect(overlay_1.default),runRequest.modules.effectManager.registerEffect(trigger_1.default)},getDefaultParameters:()=>({}),getScriptManifest:()=>({name:"Cards Against Humanity",description:"Cards Against Humanity game",author:"Jakob Ketterl",version:"0.1"})};exports.default=script})(),module.exports=__webpack_exports__.default})();