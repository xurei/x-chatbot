/**
 * Handles the routing of the messages/postbacks with a register paradigm
 */

"use strict";
const isset = require('./isset');

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
			var curState = session.getState();
			if (isset(curState) && isset(curState.actions) && isset(curState.actions[action])) {
				curState.answers[action](api, session, payload);
			}
			else if (isset(routes[action])) {
				console.log("Called action '" + action + "' for user "+session.senderId());
				routes[action](api, session, payload);
			}
			else {
				console.log("ERROR : No route found for action '" + action + "'");
			}
		}
	}
};