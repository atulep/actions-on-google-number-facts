# Number Facts
I followed the principles listed at [Actions on Google](https://developers.google.com/actions/design/principles) developer guide.

## Design
* Pick the right use cases
* Create a persona
* Write dialogs
  * Keep it short
  * Take turns
  * Don't read minds
* Test
* Build and Iterate

### Pick the right use cases
This is somewhat trivial for the application of this kind.
1. User hears some number and wants to know something special about it.
2. User is curious about what has happened on a today's date.

All of those use cases pertain user's curiosity.

### Create a persona
I want Number Facts to be **witty, funny, and informative**. I want it to **support/encourage user's curiosity**. Since user will want to talk to my agent, when they're curious about the number, the agent should be enthusiastic about the facts it tells to the user.

### Write dialogs
* Invocation Phrases/Discovery Patterns
* Happy Path
* Conversation Repair
 * Unexpected ending of the conversation (i.e. quit in the middle)

#### Invocation Phrases/Discovery Patterns
The greeting below is the general (i.e. default) greeting.

|Greeting Normal|
|--------|
|User: Hey Google, let me talk to Number Facts!|
|Google Assistant: Sure, here's Number Facts!|
|Number Facts: Hi there! Welcome to Number Facts! What number's on your mind?|

However, a user may want to hear about the specific type of fact about the number. Thus, user will say some specific information, which we can utilize to provide a better user experience. The two greetings below are examples of deep link invocation. Read more about deep link invocation [here](https://developers.google.com/actions/develop/apiai/invocation-and-discovery).

|Greeting With Number|
|--------|
|User: Hey Google, what is something cool about 7?|
|Google Assistant: Sure, here's Number Facts to help you!|
|Number Facts: Hi there! This is Number Facts! 7 is the number of main stars in the constellations of the Big Dipper and Orion. 7 is so awesome.|

|Greeting With a Date|
|--------|
|User: Hey Google, what is something about today?|
|Google Assistant: Sure, here's Number Facts to help you!|
|Number Facts: Hi there! This is Number Facts speaking. Today is the day when [response from fulfillment]|

#### Happy Path
Assume that agent was already discovered.

|Happy Path|
|--------|
|Number Facts: Hi there! Welcome to Number Facts! What number's on your mind?|
|User: 7|
|Number Facts: Sure enough! Did you know that 7 is the number of main stars in the constellations of the Big Dipper and Orion. Pretty cool, isn't it?! |

|Happy Path with specification of the type of fact (date)|
|--------|
|Number Facts: Hi there! Welcome to Number Facts! What number's on your mind?|
|User: I'd like to hear some awesome fact about what happened on day number 27|
|Number Facts: Sure enough! 27th of September is Google's birthday.|

|Happy Path with specification of the type of fact (year)|
|--------|
|Number Facts: Hi there! Welcome to Number Facts! What number's on your mind?|
|User: I'd like to hear some awesome fact about what happened in year of 27.|
|Number Facts: Sure enough! 27 is the year when ...|

|Happy Path with specification of the type of fact (math)|
|--------|
|Number Facts: Hi there! Welcome to Number Facts! What number's on your mind?|
|User: I'd like to hear some math behind 27|
|Number Facts: Sure enough! 27 is a perfect cube.|

#### Ask to play more
|Play More? Yes!|
|--------|
|_Assume the greeting and some conversation happened_|
|Number Facts: Would you like to try another number?|
|User: Sure!|
|Number Facts: _repeat the happy path scenario_|

|Play More? No!|
|--------|
|_Assume the greeting and some conversation happened_|
|Number Facts: Would you like to try another number?|
|User: No|
|Number Facts: Sounds good! Remember, you rock!|
Notice, how I am trying to reflect the persona I created in the beginning in the dialogs (i.e. funny).

#### Conversation Repair
|Repair from the outside of game context|
|--------|
|Number Facts: Hi there! Welcome to Number Facts! What number's on your mind?|
|User: I'd like to know what's for breakfast?|
|Number Facts: It's an NP hard question, sir.|

|User changes their mind|
|--------|
|Number Facts: Hi there! Welcome to Number Facts! What number's on your mind?|
|User: Hm, actually, nevermind.|
|Number Facts: As you wish, boss.|

In general, we'd want to have something witty to say every time a person will say something outside of game context. There are only a few of conversation repair scenarios because the agent doesn't support the lengthy conversation style. Thus, there is less chance for a user to break the conversation.
