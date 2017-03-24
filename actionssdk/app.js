'use strict'

process.env.DEBUG = 'actions-on-google:*';

let ActionsSdkAssistant = require('actions-on-google').ActionsSdkAssistant;
let express = require('express');
let bodyParser = require('body-parser');
let request_lib = require('request'); // for sending the http requests to Numbers API
let assert = require('assert');

let app = express();

app.set('port', (process.env.PORT || 8080));
app.use(bodyParser.json({type: 'application/json'}));

const NUMBER_ARGUMENT = "number";
const PREFIX_HAPPY = "Sure. Did you know that ";
// type of the fact to be used for the Numbers API. API can accept several other types, such as date and math.
const DEFAULT_TYPE = "trivia";
const NUMBERS_API_BASE_URL = "http://numbersapi.com";
const HELP_MESSAGE = "I didn't get that. You can ask me about any number. For example, you can say: 'Tell me about 777'";

app.post('/', function(request, response) {
  const assistant = new ActionsSdkAssistant({request: request, response: response});


  /**
   * Callback used to perform the logic after Node finishes the API request.
   */
  function callback(fact) {
    // important to set the context before invoking assistant.tell
    assistant.ask(PREFIX_HAPPY + fact + " Would you like to try another number?");
  }

  /**
   * An action that provides a fact based on the given number and type of fact. 
   *
   * In a "real" application, one would want to do Natural Language Processing to parse the raw input from the user. Actions SDK
   * only allows two types of intents (MAIN and TEXT). All of the in-dialog interactions get mapped to TEXT intent. 
   * 
   * Here are some libraries that you may use to do NLP: https://www.npmjs.com/browse/keyword/nlp
   */
  function provideFact(assistant) {
    var number;
    var url = NUMBERS_API_BASE_URL;
    
    number = extractNumber(assistant.getRawInput());
    if (number == null) { 
      if (assistant.getRawInput().toLowerCase() === 'yes') {
        // user wants to play more
        playAgainYes();
      } else if (assistant.getRawInput().toLowerCase() === 'no') {
        // user doesn't want to play more
        playAgainNo();
      } else {
        fallback();
      }
      return;
    }
    assert(number, 'number is null');
    console.log("number = " + number);
    url += "/" + number + "/" + DEFAULT_TYPE; 
    sendRequest(url, callback);
  }


  /**
   * Helper function that extracts the number from the given argument using regular expression.
   */
  function extractNumber(arg) {
    var pattern = /[\d]+/;
    var numb = arg.match(pattern);
    return numb ? numb.join("") : null;
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
    const reply = assistant.buildInputPrompt(false, "Welcome to Number Facts! What number is on your mind?",
                                           ['Say any number', 'Pick a number']);
    // ask vs. tell -> expects reply vs. doesn't expect reply
    assistant.ask(reply);
  }


  /**
   * Action that gets invoked when user wants to ask another fact (i.e. play again).
   */
  function playAgainYes() {
    const response = assistant.buildInputPrompt(false, "Great! What's number on your mind?", ['Say any number', 'Pick a number']);
    assistant.ask(response);
  }


  /**
   * Action that gets invoked when API.AI can't recognize what user said.
   */
  function fallback() {
    assistant.tell(HELP_MESSAGE);
  }


  /**
   * Action that gets invoked when user doesn't want to ask another fact (i.e. don't play again).
   */
  function playAgainNo() {
    // You don't have to use buildInputPrompt!
    assistant.tell("Oh well...Everything good has to come to an end sometime. Good bye!");
  }

  let actionMap = new Map();
  // only 2 possible intents are possible. 
  // see http://stackoverflow.com/questions/41427697/expectedinputs-possible-intents-only-works-with-assistant-intent-action-text
  actionMap.set(assistant.StandardIntents.MAIN, welcome); 
  actionMap.set(assistant.StandardIntents.TEXT, provideFact);
  assistant.handleRequest(actionMap);
});

var server = app.listen(app.get('port'), function() {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});
