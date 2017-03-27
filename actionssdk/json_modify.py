#!/usr/local/bin/python3

# Updates the endpoint URL inside of the action.json file.
# Expects the json file to adhere to Actions on Google guidelines
# (see https://developers.google.com/actions/develop/sdk/actions).

import json
import sys

n = len(sys.argv)

USAGE = 'Usage: {} <path_to_json_file> <ngrok link>'.format(sys.argv[0])

if n != 3:
    print(USAGE)
    sys.exit(1)

file_name = sys.argv[1]
link = sys.argv[2]

with open(file_name) as json_data:
    js_file = json.load(json_data)
    for action in js_file['actions']:
        action['httpExecution']['url'] = link

with open(file_name, 'w') as new_file:
    assert js_file is not None
    json.dump(js_file, new_file, indent=2)

