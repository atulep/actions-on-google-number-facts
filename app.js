'use strict'

process.env.DEBUG = 'actions-on-google:*';

let Assistant = require('actions-on-google').ApiAiAssistant;
let express = require('express');
let bodyParser = require('body-parser');
let request = requre('request'); // for sending the http requests to Numbers API
let app = express();
app.set('port', (process.env.PORT || 8080));
app.use(bodyParser.json({type: 'application/json'}));

// name of the actions -- correspond to the names I defined in the API.AI console
const PROVIDE_FACT = "provide_fact";
const PLAY_AGAIN_YES = "play_again_yes";
const DEFAULT_WELCOME = "input.welcome";
// other useful contstants
const NUMBER_ARGUMENT = "number";
const PREFIX_HAPPY = "Sure. Did you know that "; 

app.post('/', function(request, response) {
    const assistant = new Assistant({request: request, response: response});
    
    /**
     * An action that provides a fact based on the given number by the user. 
     */
    function provideFact(assistant) {
        var number = assistant.getArgument(NUMBER_ARGUMENT);
        var fact = sendRequest("http://numbersapi.com/" + number); // defaults to trivia
        var reply = PREFIX_HAPPY + fact;
        assistant.tell(reply);
    }
    
    /**
     * Helper function to send the GET request to Numbers API
     */
    function sendRequest(url) {
        console.log("Sending GET to " + url);
        var ret_val;
        request.get(url, function(error, response, body) {
            ret_val = body;
        });
        return ret_val;
    }

    let actionMap = new Map();
    assistant.handleRequest(actionMap);
});

var server = app.listen(app.get('port'), function() {
    console.log('App listening on port %s', server.address().port);
    console.log('Press Ctrl+C to quit.');
});
