sudo apt install jq
cat file.json | jq -c -S '.[]' | sed '1s/^/{"articles":[\n/; $s/$/\n]}/; $!s/$/,/'
