import json
import subprocess


desired_order_list = [
    'id',
    'title',
    'abstractText',
    'journal',
    'db',
    'year',
    'decsCodes'
]

with open('/home/alejandro/Documents/mesinesp/mesinesp-test-set-without-annotations.json') as f:
    test_without = json.load(f).get('articles')
# with open('/home/alejandro/Documents/mesinesp/mesinesp-test-set-with-annotations.json') as f:
#     test_with = json.load(f).get('articles')

test_without_reordered = list()
for doc in test_without:
    test_without_reordered.append({k: doc[k] for k in desired_order_list})
# test_with_reordered = list()
# for doc in test_with:
#     test_with_reordered.append({k: doc[k] for k in desired_order_list})

with open('/home/alejandro/Documents/mesinesp/fix/test-without-ordered-tmp.json', 'w') as f:
    json.dump(test_without_reordered, f)
# with open('/home/alejandro/Documents/mesinesp/fix/test-with-ordered-tmp.json', 'w') as f:
#     json.dump(test_with_reordered, f)

# system requirement
# sudo apt install jq

# bash_command = '''
# cat /home/alejandro/Documents/mesinesp/fix/dev-official-ordered-tmp.json | jq -c '.[]' | sed '1s/^/{"articles": [/; $s/$/]}/; $!s/$/,/' && \
# '''
# process = subprocess.Popen(bash_command.split(), stdout=subprocess.PIPE)
# output, error = process.communicate()
# print(output)

# cat /home/alejandro/Documents/mesinesp/fix/dev-core-ordered-tmp.json | jq -c '.[]' | sed '1s/^/{"articles": [/; $s/$/]}/; $!s/$/,/'