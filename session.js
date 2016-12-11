/**
 * Handles the sessions of the users and maintain their stores
 */

const isset = require('xurei-util').isset;

/**
 * @param senderId: number
 * @param api
 * @param {[{execute:function}]} questions
 * @param {object} [currentQuestion]
 * @param {{}} [store]
 */
var Session = function Session(senderId, api, questions, router) {
	const _senderId = senderId;
	var _curQuestion = null;
	this.store = {};
	this.lastAction = null;
	this.lastPayload = null;
	
	this.setQuestion = function setQuestion(key, doExecute = true) {
		if (!isset(key)) {
			_curQuestion = null;
			this.triggerChange();
		}
		else {
			var question = questions[key];
			if (isset(question)) {
				_curQuestion = key;
				this.lastAction = null;
				if (doExecute && isset(question.execute)) {
					question.execute(api, this);
					this.triggerChange();
				}
			}
			else {
				console.log("ERROR : question '"+key+"' does not exist");
			}
		}
	};
	/**
	 * @returns {{execute:function, answers:[]}}
	 */
	this.getQuestion = function getQuestion() {
		if (_curQuestion == null) {
			return null;
		}
		else {
			return Object.assign({}, questions[_curQuestion]);
		}
	};
	
	this.redirect = function (key, payload = {}) {
		router.route(key, api, this, payload);
	};
	
	this.senderId = function senderId() {
		return _senderId;
	};
	
	this.triggerChange = function() {
		this.onChange({fb_id: _senderId, store: this.store, question: _curQuestion, action: this.lastAction, payload: this.lastPayload});
	};
	
	//Used to trigger a change and save the session
	this.onChange = function(payload) {};
	
	return this;
};

module.exports = Session;