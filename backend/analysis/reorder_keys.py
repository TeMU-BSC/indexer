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

with open('/home/alejandro/Documents/mesinesp/mesinesp-development-set-official-union.json') as f:
    offical = json.load(f).get('articles')
with open('/home/alejandro/Documents/mesinesp/mesinesp-development-set-core-descriptors-intersection.json') as f:
    core = json.load(f).get('articles')

offical_reordered = list()
for doc in offical:
    offical_reordered.append({k: doc[k] for k in desired_order_list})
core_reordered = list()
for doc in core:
    core_reordered.append({k: doc[k] for k in desired_order_list})

with open('/home/alejandro/Documents/mesinesp/fix/dev-official-ordered-tmp.json', 'w') as f:
    json.dump(offical_reordered, f)
with open('/home/alejandro/Documents/mesinesp/fix/dev-core-ordered-tmp.json', 'w') as f:
    json.dump(core_reordered, f)

# system requirement
# sudo apt install jq

# bash_command = '''
# cat /home/alejandro/Documents/mesinesp/fix/dev-official-ordered-tmp.json | jq -c '.[]' | sed '1s/^/{"articles": [/; $s/$/]}/; $!s/$/,/' && \
# '''
# process = subprocess.Popen(bash_command.split(), stdout=subprocess.PIPE)
# output, error = process.communicate()
# print(output)

# cat /home/alejandro/Documents/mesinesp/fix/dev-core-ordered-tmp.json | jq -c '.[]' | sed '1s/^/{"articles": [/; $s/$/]}/; $!s/$/,/'