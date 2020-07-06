'''
author: https://github.com/aasensios

This script generates a json file that contains the real id, title, abstract and source database
for each document present in the development and test sets of the MESINESP task.
'''

import json
from pymongo import MongoClient

client = MongoClient('mongodb://bsccnio01.bsc.es:27017/')
bvsalud = client.BvSalud
datasets = client.datasets

source_collections = [
    bvsalud.selected_importants,
    datasets.reec,
    datasets.isciii,
]
development = list(bvsalud.development_set_union.find({}))
test = list(bvsalud.test_set_with_annotations_union.find({}))
extracted = development + test
titles = [document.get('title') for document in extracted]

articles = list()
for collection in source_collections:
    for document in collection.find({'ti_es': {'$in': titles}}):
        article = {
            'id': document.get('_id'),
            'title': document.get('ti_es'),
            'abstractText': document.get('ab_es'),
            'source': document.get('db').upper() if collection.name == 'selected_importants' else collection.name.upper(),
        }
        articles.append(article)
print(articles)

with open('source_documents_oneline.json', 'w') as f:
    json.dump(articles, f)

# MANUAL FORMATTING in a linux terminal with jq and sed:
# $ cat source_documents_oneline.json | jq -c -S '.[]' | sed '/"_id":/s/"_id":[^,]*,//g; 1s/^/{"articles":[\n/; $s/$/\n]}/; $!s/$/,/' > source_documents.json

# store the documents in mongodb
bvsalud.source_documents.drop()
result = bvsalud.source_documents.insert_many(articles)
print(f'inserted documents in mongodb: {len(result.inserted_ids)}')
