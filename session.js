/**
 * Handles the sessions of the users and maintain their stores
 */

const isset = require('./isset');

/**
 * @param senderId: number
 * @param api
 * @param states: [{execute:function}]
 */
var Session = function Session(senderId, api, states) {
	var _curState = null;
	const _senderId = senderId;
	
	this.setQuestion = function setQuestion(key) {
		var state = states[key];
		if (isset(state)) {
			if (isset(state.execute)) {
				state.execute(api, this);
			}
			_curState = key;
		}
		else {
			console.log("ERROR : state '"+key+"' does not exist");
		}
	};
	/**
	 * @returns {{execute:function, answers:[]}}
	 */
	this.getQuestion = function getQuestion() {
		return Object.assign({}, states[_curState]);
	};
	this.senderId = function senderId() {
		return _senderId;
	};
	
	this.store = {};
	
	return this;
};

module.exports = Session;