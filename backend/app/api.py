'''
This is the REST API for the Indexer web tool.

This backend is built with Flask and connects to a given MongoDB instance.

Authors: alejandro.asensio@bsc.es & darryl.estrada@bsc.es
'''

# Standard library.
from bson import ObjectId
from collections import Counter, defaultdict
import copy
import csv
from datetime import datetime
from itertools import combinations
import json
import os
import random
import re
import sys
from statistics import mean

# Third parties.
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_paginate import Pagination, get_page_args
from flask_pymongo import PyMongo
from bson.json_util import dumps
from pymongo.errors import BulkWriteError, DuplicateKeyError

# Private modules.
from .utilities import iso_format
from .mock import generate_mock_items
from app import app


app.config['JSON_AS_ASCII'] = False
app.config['JSON_SORT_KEYS'] = False
app.config['MONGO_URI'] = os.environ.get('MONGO_URI')
CORS(app)
mongo = PyMongo(app)


@app.route('/')
def index():
    print('Hello from indexer flask API.')
    return jsonify(status='up')


@app.route('/generate-mock', methods=['POST'])
def generate_mock():
    user_count = request.json.get('user_count')
    document_count = request.json.get('document_count')
    term_count = request.json.get('term_count')
    mock_users = generate_mock_items('user', user_count)
    mock_documents = generate_mock_items('document', document_count)
    mock_terms = generate_mock_items('term', term_count)
    for user in mock_users:
        identifiers = [document.get('identifier') for document in mock_documents]
        user['assigned_document_identifiers'] = identifiers
    print(json.dumps(mock_users, indent=2))
    print(json.dumps(mock_documents, indent=2))
    print(json.dumps(mock_terms, indent=2))
    return jsonify(
        mock_users=mock_users,
        mock_documents=mock_documents,
        mock_terms=mock_terms,
    )


@app.route('/login', methods=['POST'])
def login():
    collection = 'users'
    email = request.json.get('email')
    password = request.json.get('password')
    user = mongo.db[collection].find_one({'email': email, 'password': password}, {'_id': 0})
    return jsonify(user)


@app.route('/doc/<identifier>', methods=['GET'])
def get_doc(identifier):
    doc = mongo.db.documents.find_one({'identifier': identifier}, {'_id': 0})
    return jsonify(doc)


@app.route('/docs/<email>', methods=['GET'])
def get_assigned_documents_to_user(email):
    user = mongo.db.users.find_one({'email': email})
    identifiers = user.get('assigned_document_identifiers')
    try:
        limit = int(request.args.get('page_size'))
    except:
        limit = 0
    try:
        skip = int(request.args.get('page_index')) * limit
    except:
        skip = 0
    found_documents = mongo.db.documents.find({'identifier': {'$in': identifiers}}, {'_id': 0})  
    documents = list(found_documents.skip(skip).limit(limit))
    completed_document_ids = mongo.db.completions.distinct('document_identifiers', {'user_email': email})
    total_document_count = found_documents.count()
    for document in documents:
        term_codes = mongo.db.annotations.distinct('term_code', {'document_identifier': document.get('identifier'), 'user_email': email})
        terms = mongo.db.terms.find({'code': {'$in': term_codes}})
        terms_with_str_ids = list()
        for term in terms:
            term['_id'] = str(term['_id'])
            terms_with_str_ids.append(term)
        document['terms'] = terms_with_str_ids
        document['completed'] = document.get('identifier') in completed_document_ids
    return jsonify(documents=documents, total_document_count=total_document_count)


@app.route('/docs/validate/<email>', methods=['GET'])
def get_assigned_users(email):
    validated_document_ids = mongo.db.completeValidations.distinct('document_identifiers', {'user_email': email})
    pipeline =  [
        {
            "$match":{
                    "email": email
                    }
        },
        {
                "$unwind": '$assigned_users'
        },
        {
           "$unwind": '$assigned_users.assigned_document_identifiers'
        },
        {
            "$lookup": {
                "from": 'documents',
                "localField": 'assigned_users.assigned_document_identifiers',
                "foreignField":'identifier',
                "as": 'document',
            }
        },
        {
            "$unwind": '$document'
        },
        {
            "$project":{
                "user_email": '$assigned_users.email',
                "identifier": '$document.identifier',
                "title":'$document.title',
                "abstract":'$document.abstract',
                "year":'$document.year',
                "source":'$document.source',
                "type":'$document.type'
            }
        },
        {
            "$lookup":{
                "from": "annotations",
                "let": {"uemail": '$user_email' , "ider": "$identifier" },
                "pipeline": [
                    {
                        "$match": {
                            "$expr":{
                                "$and":[
                                    {"$eq": ["$document_identifier","$$ider"]},
                                    {"$eq": ["$user_email","$$uemail"]},
                                ]      
                            }
                        }
                    },
                { "$project": { "term_code": 1, "_id": 0 } },
                {
                    "$lookup":{
                        "from":"terms",
                        "localField": "term_code",
                        "foreignField": "code",
                        "as": "term"
                    }
                },{"$unwind": "$term"},{ "$project": { "term": 1, "_id": 0 } }
                ],
                "as":"terms"
            }
        },{
            "$project":{'_id':0}
        },
        
            {"$project":{
          "user_email": '$user_email',
          "identifier": '$identifier',
          "title":'$title',
          "abstract":'$abstract',
          "year":'$year',
          "source":'$source',
          "type":'$type',
          "terms": '$terms.term'
      }}
        ]
    docs = list(mongo.db.users.aggregate(pipeline))
    for doc in docs:
        terms_str = list()
        for term in doc['terms']:
             term['_id'] = str(term['_id'])
             terms_str.append(term)
        doc['terms'] = terms_str
        doc['validated'] =  doc.get('identifier')+"-"+doc.get('user_email') in validated_document_ids
    # for user in users:
    #     user_email = user.get('email')
    #     user_completions = mongo.db.completions.find_one({'user_email': user_email})
    #     user_documents = user.get('assigned_document_identifiers')
    #     if user_completions:
    #         completed_document_ids = user_completions.get('document_identifiers')
    #         found_documents = mongo.db.documents.find({"$and":[{'identifier': {'$in': completed_document_ids}},{ 'identifier': {'$in': user_documents}}] }, {'_id': 0})
    #         documents = list(found_documents)
    #         for document in documents:
    #             document['user_email'] = user_email
    #             term_codes = mongo.db.annotations.distinct('term_code', {'document_identifier': document.get('identifier'), 'user_email': user_email})
    #             terms = mongo.db.terms.find({'code': {'$in': term_codes}})
    #             terms_with_str_ids = list()
    #             for term in terms:
    #                 term['_id'] = str(term['_id'])
    #                 terms_with_str_ids.append(term)
    #             document['terms'] = terms_with_str_ids
    #             document['validated'] = document.get('identifier')+"-"+user_email in validated_document_ids
    #             all_documents.append(document)
    #             response = "all good"
    #     else:
    #         response = "No se encontro"
    return jsonify(documents=docs)
    
@app.route('/test/db', methods=['GET'])
def testdb():
    email  = "johan@gmail.com"
    validator_user = mongo.db.users.find_one({'email': email })
    users = validator_user.get('assigned_users')
    msg =  dumps(validator_user)
    all_documents = list()
    completed_document_ids = list()
    validated_document_ids = mongo.db.completeValidations.distinct('document_identifiers', {'user_email': email})
    pipeline =  [
        {
            "$match":{
                    "email": email
                    }
        },
        {
                "$unwind": '$assigned_users'
        },
        {
           "$unwind": '$assigned_users.assigned_document_identifiers'
        },
        {
            "$lookup": {
                "from": 'documents',
                "localField": 'assigned_users.assigned_document_identifiers',
                "foreignField":'identifier',
                "as": 'document',
            }
        },
        {
            "$unwind": '$document'
        },
        {
            "$project":{
                "user_email": '$assigned_users.email',
                "identifier": '$document.identifier',
                "title":'$document.title',
                "abstract":'$document.abstract',
                "year":'$document.year',
                "source":'$document.source',
                "type":'$document.type'
            }
        },
        {
            "$lookup":{
                "from": "annotations",
                "let": {"uemail": '$user_email' , "ider": "$identifier" },
                "pipeline": [
                    {
                        "$match": {
                            "$expr":{
                                "$and":[
                                    {"$eq": ["$document_identifier","$$ider"]},
                                    {"$eq": ["$user_email","$$uemail"]},
                                ]      
                            }
                        }
                    },
                { "$project": { "term_code": 1, "_id": 0 } },
                {
                    "$lookup":{
                        "from":"terms",
                        "localField": "term_code",
                        "foreignField": "code",
                        "as": "term"
                    }
                },{"$unwind": "$term"},{ "$project": { "term": 1, "_id": 0 } }
                ],
                "as":"terms"
            }
        },{
            "$project":{'_id':0}
        },
        
            {"$project":{
          "user_email": '$user_email',
          "identifier": '$identifier',
          "title":'$title',
          "abstract":'$abstract',
          "year":'$year',
          "source":'$source',
          "type":'$type',
          "terms": '$terms.term'
      }}
        ]
    docs = list(mongo.db.users.aggregate(pipeline))
    for doc in docs:
        terms_str = list()
        for term in doc['terms']:
             term['_id'] = str(term['_id'])
             terms_str.append(term)
        doc['terms'] = terms_str
        doc['validated'] =  doc.get('identifier')+"-"+doc.get('user_email') in validated_document_ids

    return jsonify(message=docs)
    


@app.route('/mark-doc-as/<status>', methods=['POST'])
def mark_doc_as(status):
    '''Add a new doc into the 'docs' key in the 'completions' collection.'''
    doc_to_mark = request.json
    result = None
    if status == 'completed':
        result = mongo.db.completions.update_one(
            {'user_email': doc_to_mark['user_email']},
            {'$push': {'document_identifiers': request.json['document_identifier']}},
            upsert=True
        )
    if status == 'uncompleted':
        result = mongo.db.completions.update_one(
            {'user_email': doc_to_mark['user_email']},
            {'$pull': {'document_identifiers': doc_to_mark['document_identifier']}}
        )
    if status == 'validated':
        result = mongo.db.completeValidations.update_one(
            {'user_email': doc_to_mark['user_email']},
            {'$push': {'document_identifiers': request.json['document_identifier']}},
            upsert=True
        )
    if status == 'unvalidated':
        result = mongo.db.validations.update_one(
            {'user_email': doc_to_mark['user_email']},
            {'$pull': {'document_identifiers': doc_to_mark['document_identifier']}}
        )
    return jsonify({'success': result.acknowledged})

@app.route('/validationTime/finished', methods=['POST'])
def mark_validationTime():
    validationTime = request.json
    collection = 'validationTimes'
    result = mongo.db[collection].update_one({'identifier': validationTime['identifier']},
    {'$set': {'validated_time': validationTime['validated_time']}}
    )
    print(result.acknowledged)
    return jsonify({'success': result.acknowledged})




@app.route('/validation/firsttime',methods=['POST'])
def verify_firstTime():
    collection = 'validations'
    success = True
    annotator_email = request.json.get('user_email')
    document = request.json.get('document_identifier')
    validator_email = request.json.get('validator_email')
    already_loaded = False
    found1 = mongo.db[collection].find_one({'document_identifier':document,'user_email':annotator_email,'validator_email':validator_email})
    if(found1):
        success = False
    return jsonify(firsttime = success)

@app.route('/validationTime/firsttime',methods=['POST'])
def verify_firstTimeValidation():
    collection = 'validationTimes'
    success = True
    identifier = request.json.get('identifier')
    found1 = mongo.db[collection].find_one({'identifier':identifier})
    if(found1):
        success = False
    return jsonify(firsttime = success)


@app.route('/validation', methods=['POST'])
def create_validation():
    collection = 'validations'
    success = False
    already_loaded = False
    
    if isinstance(request.json, dict):
        document = request.json
        identifier = request.json.get('identifier')
        found = mongo.db[collection].find_one({'identifier': identifier})
        if not (found):
            insertion_result = mongo.db[collection].insert_one(document)
            success = insertion_result.acknowledged
    elif isinstance(request.json, list):
        documents = request.json
        insert_many_result = mongo.db[collection].insert_many(documents)
        success = insert_many_result.acknowledged
    if success:
        message = 'Validation inserted successfully'
    else:
        message = 'something went wrong'
    return jsonify(success=success, message=message, already_loaded = already_loaded)


@app.route('/validation/terms', methods=['POST'])
def get_validation():
    collection = 'validations'
    success = False
    annotator_email = request.json.get('user_email')
    document = request.json.get('document_identifier')
    validator_email = request.json.get('validator_email')
    term_codes =  mongo.db[collection].distinct('term_code', {'document_identifier': document, 'user_email': annotator_email, 'validator_email': validator_email})
    terms = mongo.db.terms.find({'code': {'$in': term_codes}})
    document = {}
    terms_with_str_ids = list()
    for term in terms:
        term['_id'] = str(term['_id'])
        terms_with_str_ids.append(term)
    document['terms'] = terms_with_str_ids
    return jsonify(success=document)







# CRUD (Create, Read, Update, Delete) routes for items `user`, `document`, `term`, `annotation`.



@app.route('/<item>', methods=['POST'])
def create(item):
    collection = f'{item}s'
    success = False
    if isinstance(request.json, dict):
        document = request.json
        insertion_result = mongo.db[collection].insert_one(document)
        success = insertion_result.acknowledged
    elif isinstance(request.json, list):
        documents = request.json
        insert_many_result = mongo.db[collection].insert_many(documents)
        success = insert_many_result.acknowledged
    if success:
        message = f'{item}s inserted successfully'
    else:
        message = 'something went wrong'
    return jsonify(success=success, message=message)


@app.route('/<item>', methods=['GET'])
def read(item):
    collection = f'{item}s'
    query_filter = request.json
    is_multiple = request.args.get('multiple') == 'true'
    if is_multiple:
        limit = int(request.args.get('limit')) if request.args.get('limit') else 0
        documents = list(mongo.db[collection].find(query_filter, limit=limit))
        for document in documents:
            document['generation_time'] = iso_format(document['_id'])
            document['_id'] = str(document['_id'])
        response = documents
    else:
        document = mongo.db[collection].find_one(query_filter)
        if document:
            document['generation_time'] = iso_format(document['_id'])
            document['_id'] = str(document['_id'])
        response = document
    return jsonify(response)


@app.route('/<item>/<_id>', methods=['PUT'])
def update_one(item, _id):
    collection = f'{item}s'
    update_for_item = request.json
    updating_result = mongo.db[collection].update_one({'_id': ObjectId(_id)}, {'$set': update_for_item})
    return jsonify(success=updating_result.acknowledged)


@app.route('/<item>', methods=['DELETE'])
def delete_many(item):
    collection = f'{item}s'
    documents = request.json
    identifiers = [document.get('identifier') for document in documents]
    success = False
    if isinstance(request.json, list):
        deletion_result = mongo.db[collection].delete_many({'identifier': {'$in': identifiers}})
        success = deletion_result.acknowledged
    if success:
        message = f'{item}s deleted successfully'
    else:
        message = 'something went wrong'
    return jsonify(success=deletion_result.acknowledged, message=message)
