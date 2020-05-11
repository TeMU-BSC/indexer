# https://stedolan.github.io/jq/
# https://stedolan.github.io/jq/manual/v1.6/

sudo apt install jq
cat file.json | jq -c -S '.[]' | sed '1s/^/{"articles":[\n/; $s/$/\n]}/; $!s/$/,/'
