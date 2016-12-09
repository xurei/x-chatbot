/**
 * API wrapper for Messenger chatbot
 */

'use strict';

const request = require('request');
/**
 * @type {{Promise:object}}
 */
const es6Promise = require('es6-promise');
const Promise = es6Promise.Promise;

function setTyping(token, idSender, action) {
	return new Promise(function(resolve, reject) {
		request({
			url: 'https://graph.facebook.com/v2.6/me/messages',
			qs: {access_token: token},
			method: 'POST',
			json: {
				recipient: {id: idSender},
				sender_action: action,
			}
		},
		function (error, response) {
			if (error) {
				console.log('Error setting typing: ', error);
				reject(error);
			}
			else {
				if (response.body.error) {
					console.error(__filename + ' - send Error: ', response.body.error);
					console.trace();
				}
				resolve(response);
			}
		})
	});
}

module.exports = function(token) {
	return {
		send: function(idSender, messageData) {
			return new Promise(function(resolve, reject) {
				console.log('Sending message ' + JSON.stringify(messageData));
				request({
					url: 'https://graph.facebook.com/v2.6/me/messages',
					qs: {access_token:token},
					method: 'POST',
					json: {
						recipient: {id:idSender},
						message: messageData,
					}
				}, 
				function(error, response) {
					if (error) {
						console.log('Error sending message: ', error);
						reject(error);
					} 
					else {
						if (response.body.error) {
							console.error(__filename + ' - send Error: ', response.body.error);
							console.trace();
						}
						console.log('Message sent ' + JSON.stringify(messageData));
						resolve(response);
					}
				})
			});
		},
		
		setTyping: function(idSender) {
			return setTyping(token, idSender, "typing_on");
		},
		unsetTyping: function(idSender) {
			return setTyping(token, idSender, "typing_off");
		},
		
		sendTextMessage: function sendTextMessage(idSender, text) {
			let messageData = { text:text };
			return this.send(idSender, messageData);
		},
		
		sendPicMessage: function sendPicMessage(idSender, url) {
			return this.send(idSender, {
				"attachment":{
					"type":"image",
					"payload":{
						"url":url
					}
				}
			});
		},
		
		setMenu: function setMenu(data) {
			return new Promise(function(resolve,reject) {
				request({
					url: 'https://graph.facebook.com/v2.6/me/thread_settings',
					qs: {access_token:token},
					method: 'POST',
					json: data
				},
				function(error, response) {
					if (error) {
						console.log('Error setting menu: ', error);
						reject(error);
					}
					else {
						if (response.body.error) {
							console.log(__filename + ' - setMenu Error: ', response.body.error)
						}
						resolve(response);
					}
				})
			});
		},
		
		setStartButton: function setMenu(data) {
			return new Promise(function(resolve,reject) {
				request({
					url: 'https://graph.facebook.com/v2.6/me/thread_settings',
					qs: {access_token:token},
					method: 'POST',
					json: data
				},
				function(error, response) {
					if (error) {
						console.log('Error setting menu: ', error);
						reject(error);
					}
					else {
						if (response.body.error) {
							console.log(__filename + ' - setStartButton Error: ', response.body.error)
						}
						resolve(response);
					}
				})
			});
		},
		
		//SET GREETING MESSAGE RAPH 
		setGreetingMessage: function setGreetingMessage(data) {
			return new Promise(function (resolve, reject) {
				request({
					url: 'https://graph.facebook.com/v2.6/me/thread_settings',
					qs: {access_token: token},
					method: 'POST',
					json: {
						"setting_type": "greeting",
						"greeting": {
							"text": data
						}
					}
				},
				function (error, response) {
					if (error) {
						console.log('Error setting menu: ', error);
						reject(error);
					}
					else {
						if (response.body.error) {
							console.log( __filename + ' - setGreetingMessage Error: ', response.body.error)
						}
						resolve(response);
					}
				})
			});
		}, 
		//END OF GREETING MESSAGE 
	}
};


