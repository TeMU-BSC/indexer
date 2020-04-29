# DeCS Indexer

This web app allows to annotate scientific papers by the "Descriptores en Ciencias de la Salud" (DeCS),
which are an analog Spanish version of the "Medical Semantic Headings" (MeSH) terms.

The objective is to build a gold-standard model with several indexed documents by those DeCS codes.


## Implementation
This fullstack web project has been build with Angular for the frontend, Flask for the backend,
MongoDB for the database, NGinx for the server/proxy and Docker / Docker Compose for the deployment.

Docker Compose is also used for development, so it speeds up and automates the connections between services.


## Development

```bash
$ git clone https://github.com/TeMU-BSC/decs-indexer.git
$ cd decs-indexer
$ docker-compose up
```


## Dataset extraction

To extract a specific dataset from MongoDB previously stored as a collection, run the following command:

> In the next commands, replace `DATASET` by one of these values: `train`, `development`, `test`, `background`.


### Option A: the long and explanatory way

```bash
$ mongoexport --host=bsccnio01.bsc.es --db=BvSalud --collection=DATASET --out=DATASET.json --jsonArray
```

Note that `mongoexport` into json format doesn't allow to exclude any filed, so to remove the `_id` field
that is added by MongoDB internally, we can use a `sed` pipe:

```bash
$ sed -i '/"_id":/s/"_id":[^,]*,//g' DATASET.json
```

We should match the JSON format that was provided with the train set in first place: `{"articles": [ ... ]}`. To achieve that, run the following:

```bash
$ sed -i '1s/^/{"articles": /; $s/$/}/' DATASET.json
```

In the end, we have a file with one single line beacause the `--jsonArray` option concatenates all documents separated by comma and enclosed by square brackets.


### Option B: the short and efficient way

In the resulting JSON file, having one document per line would be very convenient so we can count documents using the `wc -l` command. To achieve that, we can run the following _oneliner_:

```bash
$ mongoexport --db=BvSalud --collection=DATASET | sed '/"_id":/s/"_id":[^,]*,//g; $!s/$/,/; 1s/^/{"articles": [/; $s/$/]}/' > DATASET.json
```

Explanation of the multiple `sed` commands used in one execution (separated by `; `):

- Remove the `_id` filed from every line: `/"_id":/s/"_id":[^,]*,//g`
- Add a comma at the end of every line except the last line: `$!s/$/,/`
- Add the prefix `{"articles": [` at the beginning of the first line: `1s/^/{"articles": [/`
- Add the final `]}` at the end of the last line: `$s/$/]}/`

Now, documents can be counted easily like this:

```bash
$ wc -l < DATASET.json
```
