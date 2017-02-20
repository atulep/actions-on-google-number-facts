'use strict'

process.env.DEBUG = 'actions-on-google:*';

let Assistant = require('actions-on-google').ApiAiAssistant;
let express = require('express');
let bodyParser = require('body-parser');
let request_lib = require('request'); // for sending the http requests to Numbers API
let app = express();
let assert = require('assert');

app.set('port', (process.env.PORT || 8080));
app.use(bodyParser.json({type: 'application/json'}));
// name of the actions -- correspond to the names I defined in the API.AI console
const PROVIDE_FACT = "provide_fact";
const PLAY_AGAIN_YES = "play_again_yes";
const PLAY_AGAIN_NO = "play_again_no";
const DEFAULT_WELCOME = "input.welcome";
const CONTEXT_PLAY_AGAIN = "again_yes_no"; 
// other useful contstants
const NUMBER_ARGUMENT = "number";
const PREFIX_HAPPY = "Sure. Did you know that "; 
const DATE_ARGUMENT = "date";
const YEAR_ARGUMENT = "date-period";
// API.AI already allows for robust processing of days/years. Thus, I deferred recognition of days/years to 
// @sys.date/@sys.date-period native entities. I added an entity @fact-type that only contains 'math'. 
// Thus, we can only expect fact-type to be math-related.
const MATH_ARGUMENT = "fact-type";
const FACT_TYPES = [DATE_ARGUMENT, YEAR_ARGUMENT, MATH_ARGUMENT];
const NUMBERS_API_BASE_URL = "http://numbersapi.com";

app.post('/', function(request, response) {
    const assistant = new Assistant({request: request, response: response});
    
    /* 
     * Useful to test my call back functions.   
    function testSendRequest() {
        console.log("Test...");
        var url = "http://numbersapi.com/7/math";        
        sendRequest(url, callback);
    } 
    
    function callback(res) {
        console.log("Result from sendRequest is " + res);
    }*/

    /**
     * Callback used to perform the logic after Node finishes the API request.
     */
    function callback(fact) {
        // important to set the context before invoking assistant.tell
        assistant.setContext(CONTEXT_PLAY_AGAIN);
        assistant.tell(PREFIX_HAPPY + fact + "Would you like to try another number?");
    }

    /**
     * An action that provides a fact based on the given number by the user. 
     */
    function provideFact(assistant) {
        var number;
        var url = NUMBERS_API_BASE_URL;
        var type;

        for (var i = 0; i < FACT_TYPES.length; i++) {
            if (assistant.getArgument(FACT_TYPES[i]) != null) {
                type = FACT_TYPES[i];
                break;
            }
        }
        
        assert(typeof(type) != "undefined", 'fact type is null');
        
        if (type == MATH_ARGUMENT) {
            number = assistant.getArgument(MATH_ARGUMENT);
        } else {
            number = extractNumber(assistant.getArgument(type));
        }
       
        assert(number, 'number is null');
        console.log("number = " + number);

        url += "/" + number + "/" + type; 
        sendRequest(url, callback); // defaults to trivia
    }
    

    /**
     * Helper function that extracts the number from the given argument using regular expression.
     */
    function extractNumber(arg) {
        var numb = arg.match(/\d/g);
        return numb.join("");
    }

    /**
     * Helper function to send the GET request to Numbers API
     */
    function sendRequest(url, callback) {
        console.log("Sending GET to " + url);
        request_lib.get(url, function(error, response, body) {
            if (!error && response.statusCode == 200) { 
                console.log("Fact is " + body);
                callback(body);
            } else {
                console.log("Error=" + error);
            }
        });
    }

    /**
     * Action for the welcome. It can be equivalently defined in the API.AI console as well.
     */
    function welcome(assistant) {
        var reply = "Welcome to Number Facts! What number is on your mind?";
        assistant.tell(reply);
    }

    /**
     * Action that gets invoked when user wants to ask another fact (i.e. play again).
     */
    function playAgainYes() {
        assistant.tell("Great! What's number on your mind?");
    }

    /**
     * Action that gets invoked when user doesn't want to ask another fact (i.e. don't play again).
     */
    function playAgainNo() {
        assistant.tell("Oh well...Everything good has to come to an end sometime. Good bye!");
    }

    //testSendRequest();
    let actionMap = new Map();
    actionMap.set(PROVIDE_FACT, provideFact);
    actionMap.set(DEFAULT_WELCOME, welcome); 
    actionMap.set(PLAY_AGAIN_YES, playAgainYes);
    actionMap.set(PLAY_AGAIN_NO, playAgainNo);  
    assistant.handleRequest(actionMap);
});

var server = app.listen(app.get('port'), function() {
    console.log('App listening on port %s', server.address().port);
    console.log('Press Ctrl+C to quit.');
});
