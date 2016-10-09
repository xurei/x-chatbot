# xurei Messenger Chatbot

Simple Messenger chatbot framework for simple Q&A conversations based on Finite State Machine.

**This is a work in progress ! Expect things to be broken**

## Usage

### Setting up

Before using the chatbot, you need to register a messenger app on the [Facebook for Developpers Page](https://developers.facebook.com).

See [Facebook's Guide](https://developers.facebook.com/docs/messenger-platform/quickstart) for more infos
(Don't bother too much about the code in the guide. Most of it is handled by the framework :-) )

Take note of the access token and the validation token of you app.

```
npm install x-chatbot
```

```javascript
const http = require('http');
const xchatbot = require('../../xchatbot/xchatbot');

const chatbot = xchatbot({
	validation_token: "this_is_y_validation_token",
	access_token: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
});
const app = chatbot.express;
const httpServer = http.createServer(app);
httpServer.listen(80, function () {
  console.log('Marconi Server Control listening on '+this.address().address+' port '+ this.address().port +'!');
});
```

### Creating you chat flow

The framework works by setting the different questions and the answers that it expects.
Questions are linked together via a simple FSM, i.e. by changing state of the current session.

Here is an example of question :
```javascript
chatbot.registerQuestion("QUESTION_NAME", {
    execute: function(api, session) {
        return api.sendTextMessage(session.senderId(), "When is the meeting taking place (dd/mm/yyyy) ?");
    },
    answers: {
        "INPUT": function (api, session, payload) {

            if (is_date_valid(payload.text)) {
                //Store information in the user session
                session.store.date = payload.text;
                //Change the state to the next question
                session.setState("REQUEST_BUDGET");
            }
            else {
                //Send the invalid data message
                api.sendTextMessage(session.senderId(), "Sorry, I didn't get it.")
                //Change the state to itself so it can ask the question again
                .then(() => session.setState("REQUEST_DATE"));
            }
        }
    }
});
```
You can also use `chatbot.registerQuestions` :
```javascript
chatbot.registerQuestions({
    "QUESTION_1": {
        execute: /* ... */,
        answers: /* ... */
    },
    "QUESTION_1": {
        execute: /* ... */,
        answers: /* ... */
    }
});
```

## API Doc

#### chatbot.express
Instance of express framework running the chatbot.

#### chatbot.api
This is the wrapper of the Facebook API. All the methods return ES6 promises to deal with the asynchronicity.

##### chatbot.api.sendTextMessage : function(idSender, text)
Sends a basic text message to a user.

Too send multiple messages in a specific order, use `then()` :
```javascript
chatbot.api.sendTextMessage(session.senderId(), "Hello")
.then(() => chatbot.api.sendTextMessage(session.senderId(), "World"));
```

##### chatbot.api.sendPicMessage : function(idSender, url)
Sends an image to a user.

##### chatbot.api.send : function(idSender, messageData)
Sends raw data to the facebook messaging endpoint (https://graph.facebook.com/v2.6/me/messages). You can basically send
any king of message with this method.
- `idSender` id of the user to send the message
- `messageData` json "message" field as requested by Facebook API

Example :
```javascript
chatbot.api.send(session.senderId(), {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
          {
            "title":"Welcome to Peter\'s Hats",
            "item_url":"https://petersfancybrownhats.com",
            "image_url":"https://petersfancybrownhats.com/company_image.png",
            "subtitle":"We\'ve got the right hat for everyone.",
            "buttons":[
              {
                "type":"web_url",
                "url":"https://petersfancybrownhats.com",
                "title":"View Website"
              },
              {
                "type":"postback",
                "title":"Start Chatting",
                "payload":"DEVELOPER_DEFINED_PAYLOAD"
              }
            ]
          }
        ]
      }
    }
}
```

##### chatbot.api.setMenu : function(data)
Define the persistant menu, as defined by [Facebook docs](https://developers.facebook.com/docs/messenger-platform/thread-settings/persistent-menu)
Example :
```javascript
chatbot.api.setMenu({
	"setting_type" : "call_to_actions",
	"thread_state" : "existing_thread",
	"call_to_actions":[
		{
			"type":"postback",
			"title":"Help",
			"payload": JSON.stringify({action: "HELP"})
		},
		{
			"type":"postback",
			"title":"Create new request",
			"payload": JSON.stringify({action: "CREATE_REQUEST"})
		},
		{
			"type":"web_url",
			"title":"View Website",
			"url":"http://www.google.com/"
		}
	]
});
```

#### chatbot.registerAction : function(actionName, callback)
Register an action that the user can do at any time, typically via the menu.
- `actionName` the action trigerred. See chatbot.api.setMenu() example.
- `callback: function(api, session, payload)` method to be called when the action is trigerred
    - `api` instance of chatbot.api
    - `session` Session object, see below
    - `payload` additionnal information if required

#### chatbot.registerQuestion : function(question_name, question_data)
#### chatbot.registerQuestions : function(questions)
Register a question along with the expected answer and the functions to handle them. It is the key element to create flows
using the FSM.

Example :
```javascript
chatbot.registerQuestion("ARE_YOU_SURE", {
    execute: function(api, session) {
        return
            api.sendTextMessage(session.senderId(), "Are you sure ?")
            .then(() => api.send(session.senderId(), {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [
                            {
                                "title": "Please confirm",
                                "buttons": [{
                                    "type": "postback",
                                    "title": "Yes",
                                    "payload": JSON.stringify({action: "CONFIRM_REQUEST"})
                                },
                                {
                                    "type": "postback",
                                    "title": "No",
                                    "payload": JSON.stringify({action: "DENY_REQUEST"})
                                }]
                            }
                        ]
                    }
                }
            }));
    },
    answers: {
        "CONFIRM_REQUEST": function (api, session, payload) {
            session.store.confirmed = true;
            session.setQuestion("REQUEST_CONFIRMED");
        },
        "DENY_REQUEST": function (api, session, payload) {
            session.store.confirmed = false;
            session.setQuestion("REQUEST_DENIED");
        },
        "INPUT": function (api, session, payload) {
            api.sendTextMessage(session.senderId(), "Please use the buttons")
            .then(() => session.setQuestion("ARE_YOU_SURE")); //Ask the question again
        }
    }
});
```

The `execute` function is executed when `session.setQuestion()` is called. The `answers` are the expected answers. There
can be multiple possible answers.

The name of the answer is defined by the actionss you provided in the `execute()` method. The `INPUT` answer is when the
user types in text directly.

### The Session object
The session object handles the sessions like a traditionnal HTTP session. The only
difference is that it uses the Facebook user id as session key. It also contains
the current question asked to a user and provides a store for extra information.

#### Session.setQuestion: function (question_name)
Set the current question to a registered question and ask it to the user.
#### Session.getQuestion: function ()
Returns the current question object.
#### Session.senderId: function ()
Returns the id of the user.
#### Session.store: {}
Storage space where you can put anything you need to keep the state of your bot.

### Full Example
Coming soon...