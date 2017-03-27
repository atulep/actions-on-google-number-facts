# Number Facts using Actions SDK
This directory contains files neccessary for setting up Number Facts with Actions SDK.

# Setup Instructions
Most of the steps here are the same as in [Actions on Google](https://github.com/actions-on-google) official GitHub page.
1. Deploy this action to your preferred hosting environment (I recomment ```ngrok```).
2. Update the endpoint URL inside of ```action.json```
  * You can use ```json_modify.py``` script to do that
3. Preview the action using the ```gactions```: ```./gactions preview -action_package=action.json -invocation_name="number facts"```
4. Run ```./gactions simulate``` and type ```talk to number facts``` after getting a prompt from the ```gactions```.

# License
See ../LICENSE
