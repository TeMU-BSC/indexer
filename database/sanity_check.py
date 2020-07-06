'''
author: https://github.com/aasensios

This script checks if all documents in the extracted development and test (gold standard) sets,
regarding its title and abstract pair, are present in the source documents file.
'''

import json

source_documents_file = '/home/alejandro/Documents/mesinesp/v2/source_documents.json'
development_file = '/home/alejandro/Documents/mesinesp/v2/mesinesp-development-set-official-union.json'
gold_standard_file = '/home/alejandro/Documents/mesinesp/v2/test_set_with_annotations_v2.json'

with open(source_documents_file) as f:
    source = json.load(f).get('articles')
source_hash_list = [(document.get('title'), document.get('abstractText')) for document in source]

with open(development_file) as f:
    development_set = json.load(f).get('articles')
development_hash_list = [(document.get('title'), document.get('abstractText')) for document in development_set]
not_found = [pair for pair in development_hash_list if pair not in source_hash_list]
print(f'errors in development set: {len(not_found)}')

with open(gold_standard_file) as f:
    gold_standard_set = json.load(f).get('articles')
gold_standard_hash_list = [(document.get('title'), document.get('abstractText')) for document in gold_standard_set]
not_found = [pair for pair in gold_standard_hash_list if pair not in source_hash_list]
print(f'errors in gold_standard set: {len(not_found)}')
