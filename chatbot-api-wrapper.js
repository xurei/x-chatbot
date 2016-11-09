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
				function(error, response, body) {
					if (error) {
						console.log('Error sending message: ', error);
						reject(error);
					} 
					else {
						if (response.body.error) {
							console.log('Error: ', response.body.error)
						}
						console.log('Message sent ' + JSON.stringify(messageData));
						resolve(response);
					}
				})
			});
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
				function(error, response, body) {
					if (error) {
						console.log('Error setting menu: ', error)
						reject(error);
					}
					else {
						if (response.body.error) {
							console.log('Error: ', response.body.error)
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
				function(error, response, body) {
					if (error) {
						console.log('Error setting menu: ', error)
						reject(error);
					}
					else {
						if (response.body.error) {
							console.log('Error: ', response.body.error)
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
				function (error, response, body) {
					if (error) {
						console.log('Error setting menu: ', error)
						reject(error);
					}
					else {
						if (response.body.error) {
							console.log('Error: ', response.body.error)
						}
						resolve(response);
					}
				})
			});
		}, 
		//END OF GREETING MESSAGE 
	}
};


