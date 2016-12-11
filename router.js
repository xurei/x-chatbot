/**
 * Handles the routing of the messages/postbacks with a register paradigm
 */

"use strict";
const isset = require('xurei-util').isset;

module.exports = function() {
	var routes = [];
	
	return {
		/**
		 * @param action:string
		 * @param callback:function(api, session, payload)
		 */
		register: function(action, callback) {
			routes[action] = callback;
		},
		
		/**
		 * @param action:string
		 * @param api:object
		 * @param session:Session
		 * @param payload:object
		 */
		route: function(action, api, session, payload) {
			var curState = session.getQuestion();
			if (isset(curState) && isset(curState.answers) && isset(curState.answers[action])) {
				curState.answers[action](api, session, payload);
			}
			else if (isset(routes[action])) {
				console.log("Called action '" + action + "' for user " + session.senderId());
				session.setQuestion(null);
				session.lastAction = action;
				session.lastPayload = payload;
				session.onChange();
				routes[action](api, session, payload);
			}
			else {
				console.log("ERROR : No route found for action '" + action + "'");
			}
		}
	}
};