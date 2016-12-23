/**
 * Front interface of xChatbot.
 * xChatbot is a small framework for simple Q&A chatbot. It is not designed for NLP processing.
 */

const express = require('express');
const bodyParser = require('body-parser');
const chatbotApiWrapper = require('./chatbot-api-wrapper');
const router = require('./router');
const Session = require('./session');
const isset = require('xurei-util').isset;
const util = require('util');

/**
 * @param {{validation_token:string, access_token:string}} options
 * @returns {{ express, api, registerQuestion, registerQuestions, registerAction }}
 */
module.exports = function (options) {
	const app = express();
	const _router = router();
	app.use(bodyParser.json());
	
	const api = chatbotApiWrapper(options.access_token);
	
	const sessionStore = [];
	
	const questions = [];
	//------------------------------------------------------------------------------------------------------------------
	
	/**
	 * @param state {{name:string, execute: function, answers:[function] }}
	 */
	function registerQuestion(state) {
		questions[state.name] = state;
	}
	//------------------------------------------------------------------------------------------------------------------
	
	function registerQuestions(states) {
		for (var i in states) {
			var state = states[i];
			registerQuestion(state);
		}
	}
	//------------------------------------------------------------------------------------------------------------------
	
	function getSession(fb_id) {
		return new Promise(function(resolve, reject) {
			var session;
			if (!isset(sessionStore[fb_id])) {
				session = new Session(fb_id, api, questions, _router);
				session.onChange = chatbot.writeSession;
				
				chatbot.readSession(fb_id)
				.then((sessionData) => {
					if (isset(sessionData)) {
						session.store = sessionData.store;
						session.lastAction = sessionData.action;
						session.lastPayload = sessionData.payload;
						session.setQuestion(sessionData.question, false);
					}
					
					sessionStore[fb_id] = session;
					resolve(sessionStore[fb_id]);
				});
			}
			else {
				resolve(sessionStore[fb_id]);
			}
		});
	}
	//------------------------------------------------------------------------------------------------------------------
	
	var chatbot = {
		express: app,
		api: api,
		registerQuestion: registerQuestion,
		registerQuestions: registerQuestions,
		registerAction: _router.register,
		getSession: getSession,
		readSession: function(senderId) { return null; },
		writeSession: function(session) { }
	};
	
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
			
			//TODO rewrite this entire method, it's a mess
			
			//TODO handle attachments
			
			if (isset(event.message))
				console.log("EVENT MESSAGE", JSON.stringify(event.message));
			
			if (event.postback
			|| (event.message && (event.message.text || (isset(event.message.attachments))) && typeof(event.message.app_id) === "undefined")) {
				var sender_id = event.sender.id;
				
				//Session management
				getSession(sender_id)
				.then((session) => {
					//Action & payload crafting
					let action = null;
					let payload = null;
					if (event.postback) {
						console.log('POSTBACK');
						payload = JSON.parse(event.postback.payload);
						try {
							payload = JSON.parse(event.postback.payload);
						}
						catch (e) {
							console.log("Wrong payload :", event.postback.payload);
							return;
						}
						action = payload.action;
					}
					else if (event.message) {
						if (isset(event.message.attachments) && event.message.attachments[0].type === "location") {
							console.log('LOCATION');
							payload = event.message.attachments[0].payload;
							payload.name = event.message.attachments[0].title;
							action = "SET_LOCATION";
						}
						else if (isset(event.message.attachments) && event.message.attachments[0].type === "image") {
							console.log('PICTURE');
							payload = event.message.attachments[0].payload;
							action = "SET_PICTURE";
						}
						else if (event.message.quick_reply) {
							console.log('QUICK REPLY');
							try {
								payload = JSON.parse(event.message.quick_reply.payload);
							}
							catch (e) {
								console.log("Wrong payload :", event.message.quick_reply.payload);
								return;
							}
							action = payload.action;
						}
						else if (event.message.text) {
							console.log('MESSAGE');
							action = "INPUT";
							payload = { text: event.message.text };
						}
						else {
							payload = {};
						}
					}
					
					if (action=="INPUT" && payload.text.toLowerCase() == "again") {
						//"again" INPUT
						console.log('AGAIN request');
						if (isset(session.getQuestion())) {
							session.setQuestion(session.getQuestion().name);
						}
						else {
							session.redirect(session.lastAction, session.lastPayload);
						}
					}
					else {
						//Send to router
						payload.sender = event.sender;
						_router.route(action, api, session, payload);
					}
				})
				.catch((error) => {
					console.error("An error occurred", error);
					console.error("Event", event);
				});
			}
		}
		res.sendStatus(200);
	});
	//------------------------------------------------------------------------------------------------------------------
	
	return chatbot;
};