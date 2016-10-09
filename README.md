# xurei Messenger Chatbot

Simple Messenger chatbot framework for simple Q&A conversations based on Finite State Machine.

**This is a work in progress ! Expect things to be broken**

### Usage

##### Setting up

Before using the chatbot, you need to register a messenger app on the [Facebook for Developpers Page](https://developers.facebook.com).
See [Facebook's Guide](https://developers.facebook.com/docs/messenger-platform/quickstart) for more infos.

Don't bother too much about the code. That's what the framework is for :-)

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

##### Creating you chat flow

The chatbot works by setting the different questions and the answers that it expects.
Questions are linked together via a simple FSM, i.e. by changing state of the current session.

Here is an example of question :
```javascript
chatbot.registerState("QUESTION_NAME", {
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
You can also use `chatbot.registerStates` :
```javascript
chatbot.registerStates({
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


```
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