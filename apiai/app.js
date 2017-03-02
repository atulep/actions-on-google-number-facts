'use strict'

process.env.DEBUG = 'actions-on-google:*';

let Assistant = require('actions-on-google').ApiAiAssistant;
let express = require('express');
let bodyParser = require('body-parser');
let request_lib = require('request'); // for sending the http requests to Numbers API
let assert = require('assert');

let app = express();

app.set('port', (process.env.PORT || 8080));
app.use(bodyParser.json({type: 'application/json'}));
// name of the actions -- correspond to the names I defined in the API.AI console
const PROVIDE_FACT = "provide_fact";
const PLAY_AGAIN_YES = "play_again_yes";
const PLAY_AGAIN_NO = "play_again_no";
const DEFAULT_WELCOME = "input.welcome";
const CONTEXT_PLAY_AGAIN = "again_yes_no"; 
const NUMBER_ARGUMENT = "number";
const DATE_ARGUMENT = "date";
const YEAR_ARGUMENT = "date-period";
const DEFAULT_FALLBACK = "input.unknown";
// API.AI already allows for robust processing of days/years. Thus, I deferred recognition of days/years to 
// @sys.date/@sys.date-period native entities. I added an entity @fact-type that only contains 'math'. 
// Thus, we can only expect fact-type to be math-related.
const MATH_ARGUMENT = "fact-type";
// other useful contstants
const PREFIX_HAPPY = "Sure. Did you know that ";
const DEFAULT_TYPE = "trivia";
// map the fact types returned from API.AI to the ones expected at Numbers API
const FACT_TYPES = {};
// need to put the variables into dictionary by hand. 
// see http://stackoverflow.com/questions/10640159/key-for-javascript-dictionary-is-not-stored-as-value-but-as-variable-name
FACT_TYPES[DATE_ARGUMENT] = 'date';
FACT_TYPES[YEAR_ARGUMENT] = 'year'; 
FACT_TYPES[MATH_ARGUMENT] = 'math';
FACT_TYPES[DEFAULT_TYPE] = 'trivia';
const NUMBERS_API_BASE_URL = "http://numbersapi.com";
const HELP_MESSAGE = "I didn't get that. You can ask me about any number. You can also ask me about " +
                                                                     FACT_TYPES[DATE_ARGUMENT] + ", " + 
                                                                 FACT_TYPES[YEAR_ARGUMENT] + ", and " + 
                                                                            FACT_TYPES[MATH_ARGUMENT] + 
                                                                     " that this number represents. " + 
                                                 "For example, you can say: 'Tell me about 777', or " +
                                                                       "'Tell me some math about 777'."; 

app.post('/', function(request, response) {
  const assistant = new Assistant({request: request, response: response});


  /**
   * Callback used to perform the logic after Node finishes the API request.
   */
  function callback(fact) {
    // important to set the context before invoking assistant.tell
    assistant.setContext(CONTEXT_PLAY_AGAIN);
    assistant.ask(PREFIX_HAPPY + fact + " Would you like to try another number?");
  }


  /**
   * An action that provides a fact based on the given number and type of fact. 
   */
  function provideFact(assistant) {
    var number;
    var url = NUMBERS_API_BASE_URL;
    var type;

    for (var fact_type in FACT_TYPES) {
      console.log('fact_type=' + fact_type);
      if (assistant.getArgument(fact_type) != null) {
        type = fact_type;
        break;
      }
    }

    if (type == null) type = DEFAULT_TYPE;
    assert(typeof(type) != "undefined", 'fact type is undefined');

    console.log("type=" + type);

    if (type == MATH_ARGUMENT || type == DEFAULT_TYPE) {
      number = assistant.getArgument(NUMBER_ARGUMENT);
    } else {
      console.log("Arg=" + assistant.getArgument(type));
      number = extractNumber(assistant.getArgument(type), type);
    }

    assert(number, 'number is null');
    console.log("number = " + number);

    url += "/" + number + "/" + FACT_TYPES[type]; 
    sendRequest(url, callback);
  }


  /**
   * Helper function that extracts the number from the given argument using regular expression.
   */
  function extractNumber(arg, type) {
    // according to the API.AI documentation the @sys.date-period entity will return the date in a 
    // ISO-8601 format. I.e. 2014-01-01/2014-12-31. The year is the first one in the return value, so
    // my regular expression will match the numbers before the '-'. Similarly, I will need to account for the
    // case when type is @sys.date, which will have the day as the last digits before the '-'.
    var pattern = type == DATE_ARGUMENT ? /[\d]+$/ : /[\d]+/;
    //var numb = arg.match(/[\d]+/);
    var numb = arg.match(pattern);
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
    // ask vs. tell -> expects reply vs. doesn't expect reply
    assistant.ask(reply);
  }


  /**
   * Action that gets invoked when user wants to ask another fact (i.e. play again).
   */
  function playAgainYes() {
    assistant.ask("Great! What's number on your mind?");
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
    assistant.tell("Oh well...Everything good has to come to an end sometime. Good bye!");
  }

  //testSendRequest();
  let actionMap = new Map();
  actionMap.set(PROVIDE_FACT, provideFact);
  actionMap.set(DEFAULT_WELCOME, welcome); 
  actionMap.set(PLAY_AGAIN_YES, playAgainYes);
  actionMap.set(PLAY_AGAIN_NO, playAgainNo); 
  actionMap.set(DEFAULT_FALLBACK, fallback); 
  assistant.handleRequest(actionMap);
});

var server = app.listen(app.get('port'), function() {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});
