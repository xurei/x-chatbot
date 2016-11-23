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
var Session = function Session(senderId, api, questions, router, currentState = null, store = {}) {
	var _curState = currentState;
	this.store = store;
	const _senderId = senderId;
	
	this.setQuestion = function setQuestion(key, doExecute = true) {
		var question = questions[key];
		if (isset(question)) {
			_curState = key;
			if (doExecute && isset(question.execute)) {
				question.execute(api, this);
				this.onChange(this);
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
	
	this.redirect = function (key, payload = {}) {
		router.route(key, api, this, payload);
	};
	
	this.senderId = function senderId() {
		return _senderId;
	};
	
	//Used to trigger a change and save the session
	this.onChange = function(me) {};
	
	return this;
};

module.exports = Session;