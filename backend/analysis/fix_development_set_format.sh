sudo apt install jq
cat /home/alejandro/Documents/mesinesp/fix/dev-official-ordered.json | jq -c '.[]' | sed '1s/^/{"articles":[/; $s/$/]}/; $!s/$/,/'
