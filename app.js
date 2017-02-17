'use strict'

process.env.DEBUG = 'actions-on-google:*';

let Assistant = require('actions-on-google').ApiAiAssistant;
let express = require('express');
let bodyParser = require('body-parser');

let app = express();
app.set('port', (process.env.PORT || 8080));
app.use(bodyParser.json({type: 'application/json'}));


const TMP = "test";

app.post('/', function(request, response) {
    const assistant = new Assistant({request: request, response: response});
    
    function doTmp() {
        console.log("Hello World!");
    }

    let actionMap = new Map();
    actionMap.set(TMP, doTmp);
    assistant.handleRequest(actionMap);
});

var server = app.listen(app.get('port'), function() {
    console.log('App listening on port %s', server.address().port);
    console.log('Press Ctrl+C to quit.');
});
