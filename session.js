/**
 * Handles the sessions of the users and maintain their stores
 */

const isset = require('./isset');

/**
 * @param senderId: number
 * @param api
 * @param {[{execute:function}]} questions
 * @param {object} [currentState]
 * @param {{}} [store]
 */
var Session = function Session(senderId, api, questions, currentState = null, store = {}) {
	var _curState = currentState;
	this.store = store;
	const _senderId = senderId;
	
	this.setQuestion = function setQuestion(key) {
		var question = questions[key];
		if (isset(question)) {
			_curState = key;
			if (isset(question.execute)) {
				question.execute(api, this);
			}
		}
		else {
			console.log("ERROR : question '"+key+"' does not exist");
		}
	};
	/**
	 * @returns {{execute:function, answers:[]}}
	 */
	this.getQuestion = function getQuestion() {
		return Object.assign({}, questions[_curState]);
	};
	this.senderId = function senderId() {
		return _senderId;
	};
	
	return this;
};

module.exports = Session;