# Number Facts with API.AI
This directory contains files necessary for setting up Number Facts with API.AI

# Setup Instructions
Most of the steps here are the same as in [Actions on Google](https://github.com/actions-on-google) official GitHub page.

1. Create a new [API.AI](https://api.ai)
2. Click on the project gear icon to see the project settings.
3. Select "Export and Import".
4. Select "Restore from zip". Follow the directions to restore.
5. Select the NumberFacts.zip file in this repo.
6. Deploy this app to your preferred hosting environment (I recommend ngrok for local development).
7. Set the "Fulfillment" webhook URL to the hosting URL.
8. Make sure all domains are turned off.
9. Enable Actions on Google in the Integrations.
10. Provide an invocation name for the action.
11. Authorize and preview the action in the [web simulator](https://developers.google.com/actions/tools/web-simulator).

# License
See ../LICENSE
