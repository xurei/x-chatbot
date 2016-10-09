/**
 * Front interface of xChatbot.
 * xChatbot is a small framework for simple Q&A chatbot. It is not designed for NLP processing.
 */

const express = require('express');
const bodyParser = require('body-parser');
const chatbotApiWrapper = require('./chatbot-api-wrapper');
const router = require('./router');
const Session = require('./session');
const isset = require('./isset');

/**
 * @param {{validation_token:string, access_token:string}} options
 * @returns {{express, api}}
 */
module.exports = function (options) {
	const app = express();
	const _router = router();
	app.use(bodyParser.json());
	
	const api = chatbotApiWrapper(options.access_token);
	
	const sessionStore = [];
	
	const states = {};
	//------------------------------------------------------------------------------------------------------------------
	
	/**
	 * @param {{ body:{ entry:[{ messaging: [] }] } }} req
	 * @param {{ sendStatus:function(code:int) }} res
	 */
	app.get('/webhook', function(req, res) {
		if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === options.validation_token) {
			console.log("Validating webhook");
			res.status(200).send(req.query['hub.challenge']);
		}
		else {
			console.error("Failed validation. Make sure the validation tokens match.");
			res.sendStatus(403);
		}
	});
	//------------------------------------------------------------------------------------------------------------------
	
	/**
	 * @param {{ body:{ entry:[{ messaging: [] }] } }} req
	 * @param {{ sendStatus:function(code:int) }} res
	 */
	app.post('/webhook', function (req, res) {
		let messaging_events = req.body.entry[0].messaging;
		
		for (let i = 0; i < messaging_events.length; i++) {
			/**
			 * @type {{ sender: {id: int}, postback, message, app_id:int }} event
			 */
			let event = req.body.entry[0].messaging[i];
			
			if (event.postback || (event.message && event.message.text && typeof(event.message.app_id) === "undefined")) {
				var sender_id = event.sender.id;
				
				//Session management
				if (!isset(sessionStore[sender_id])) {
					//TODO better session handler and persistence implementation
					sessionStore[sender_id] = new Session(sender_id, api, states);
				}
				var session = sessionStore[sender_id];
				
				//Action & payload crafting
				let action = null;
				let payload = null;
				if (event.postback) {
					console.log('POSTBACK');
					payload = JSON.parse(event.postback.payload);
					action = payload.action;
				}
				else if (event.message && event.message.text) {
					console.log('MESSAGE');
					console.log(event.message);
					action = "INPUT";
					payload = { text: event.message.text };
				}
				
				//Send to router
				payload.sender = event.sender;
				_router.route(action, api, sessionStore[sender_id], payload);
			}
		}
		res.sendStatus(200);
	});
	//------------------------------------------------------------------------------------------------------------------
	
	function registerState(statename, state) {
		states[statename] = state;
	}
	//------------------------------------------------------------------------------------------------------------------
	
	function registerStates(states) {
		for (var statename in states) {
			var state = states[statename];
			registerState(statename, state);
		}
	}
	//------------------------------------------------------------------------------------------------------------------
	
	return {
		express: app,
		api: api,
		registerState: registerState,
		registerStates: registerStates,
		registerAction: _router.register,
		registerInput: (callback) => _router.register('INPUT', callback),
		subscribe: function(onNext) {
			let dispose = store.subscribe(() => onNext(store.getState()));
			onNext(store.getState());
			return { dispose };
		}
	};
};