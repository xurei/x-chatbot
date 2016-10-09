/**
 * Handles the sessions of the users and creates the stores for them
 */

const isset = require('./isset');

/**
 * @param senderId: number
 * @param states: []
 */
var Session = function Session(senderId, api, states) {
	var _curState = null;
	const _senderId = senderId;
	
	this.setState = function setState(statename) {
		var state = states[statename];
		if (isset(state)) {
			if (isset(state.execute)) {
				state.execute(api, this);
			}
			_curState = statename;
		}
		else {
			console.log("ERROR : state '"+statename+"' does not exist");
		}
	};
	/**
	 * @returns {{execute:function, answers:[]}}
	 */
	this.getState = function getState() {
		return Object.assign({}, states[_curState]);
	};
	this.senderId = function senderId() {
		return _senderId;
	};
	
	this.store = {};
	
	return this;
};

module.exports = Session;