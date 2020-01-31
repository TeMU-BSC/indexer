'''
Backend REST API to handle connections to MongoDB for the MESINESP task.

Author: alejandro.asensio@bsc.es
'''

from bson.objectid import ObjectId
from datetime import datetime
from itertools import combinations
from os import environ
from statistics import mean

from flask import Flask, jsonify, request
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_pymongo import PyMongo
from pymongo.errors import BulkWriteError, DuplicateKeyError

from app import app


app.config['MONGO_URI'] = environ.get('MONGO_URI')
bcrypt = Bcrypt(app)
mongo = PyMongo(app)
CORS(app)


@app.route('/hello')
def hello():
    return f"Hello from Flask by Alejandro. ENV={environ.get('ENV')} FLASK_ENV={environ.get('FLASK_ENV')} MONGO_URI={environ.get('MONGO_URI')}"


@app.route('/user/register', methods=['POST'])
def register_users():
    '''Register many users. Try to insert many new users, except BulkWriteError occurs.'''
    users = request.json
    try:
        result = mongo.db.users.insert_many(users)
        success = result.acknowledged
        message = None
        registered_users_cursor = mongo.db.users.find({'_id': {'$in': result.inserted_ids}}, {'_id': 0})
        registered_users = len([user for user in registered_users_cursor])
    except BulkWriteError as error:
        success = False
        message = error.details['writeErrors'][0]['errmsg']
        registered_users = 0
    return jsonify({'success': success, 'message': message, 'registeredUsers': registered_users})


@app.route('/user/login', methods=['POST'])
def login():
    '''Check if the given email and password match the ones for that user in database.'''
    user = request.json
    result = {'sucess': False, 'user': None, 'message': 'Invalid user and/or password'}
    found_user = mongo.db.users.find_one({'email': user['email'], 'password': user['password']}, {'_id': 0, 'password': 0})
    if found_user:
        result = {'sucess': True, 'user': found_user, 'message': None}
    return jsonify(result)


# [Encrypt approach]
@app.route('/user/login_encrypt', methods=['POST'])
def login_encrypt():
    '''Check if the given email and password match that user and its encrypted password in database.'''
    user = request.json
    result = {'sucess': False, 'user': None, 'message': 'User not found'}
    found_user = mongo.db.users.find_one({'email': user['email']}, {'_id': 0})
    if found_user:
        if bcrypt.check_password_hash(found_user['password'], user['password']):
            result = {'sucess': True, 'user': found_user, 'message': None}
        else:
            result['message'] = 'Invalid password'
    return jsonify(result)


@app.route('/assignment/add', methods=['POST'])
def assign_docs_to_users():
    '''Add some documents IDs to the user key in the 'assigned_documents' collection.'''
    users = request.json
    result = mongo.db.assignments.insert_many(users)
    return jsonify({'success': result.acknowledged})


@app.route('/assignment/get', methods=['POST'])
def get_assigned_docs():
    '''Find the assigned docs IDs to the current user, and then retrieving
    the needed doc data from the 'selected_importants' collection.'''
    user = request.json['user']
    found_user = mongo.db.assignments.find_one({'user': user})
    assigned_doc_ids = []
    if found_user:
        assigned_doc_ids = found_user.get('docs')

    # TODO REMOVE
    docs = mongo.db.selected_importants.find({'_id': {'$in': assigned_doc_ids}})

    # TODO ADD # Add extra clinical cases
    # selected_importants = [doc for doc in mongo.db.selected_importants.find({'_id': {'$in': assigned_doc_ids}})]
    # reec_clinical_cases = [doc for doc in mongo.db.reec_clinical_cases.find({'_id': {'$in': assigned_doc_ids}})]
    # docs = selected_importants.extend(reec_clinical_cases)

    result = []
    for doc in docs:
        # Find the decsCodes added by the current user
        annotations = mongo.db.annotations.find(
            {'doc': doc['_id'], 'user': request.json['user']}, {'_id': 0, 'decsCode': 1})
        decsCodes = [annotation['decsCode'] for annotation in annotations]
        # Check if this doc has been marked as completed (indexed/revised) by the current user
        completed = False
        user_completions = mongo.db.completions.find_one({'user': request.json['user']})
        if user_completions:
            completed = doc['_id'] in user_completions.get('docs')
        # Prepare the relevant info to be returned
        doc_relevant_info = {
            'id': doc['_id'],
            'title': doc['ti_es'],
            'abstract': doc['ab_es'],
            'decsCodes': decsCodes,
            'completed': completed
        }
        result.append(doc_relevant_info)
    return jsonify(result)


@app.route('/annotation/add', methods=['POST'])
def add_annotation():
    '''Add a newannotation to the 'annotations' collection. Use 'replace_one'
    instead of 'insert_one' to avoid repeated annotations by the same user
    logged at the same time in different browsers.'''
    annotation = request.json
    result = mongo.db.annotations.replace_one(annotation, annotation, upsert=True)
    return jsonify({'success': result.acknowledged})


@app.route('/annotation/remove', methods=['POST'])
def remove_annotation():
    '''Remove an existing annotation from the 'annotations' collection.'''
    annotation = request.json
    result = mongo.db.annotations.delete_one(annotation)
    return jsonify({'deletedCount': result.deleted_count})


@app.route('/completion/add', methods=['POST'])
def mark_doc_as_completed():
    '''Add a new doc into the 'docs' key in the 'completions' collection.'''
    completion = request.json
    result = mongo.db.completions.update_one(
        {'user': request.json['user']},
        {'$push': {'docs': request.json['doc']}},
        upsert=True
    )
    return jsonify({'success': result.acknowledged})


@app.route('/completion/remove', methods=['POST'])
def mark_doc_as_uncompleted():
    '''Remove an existing doc from the 'docs' key in the 'completions' collection.'''
    completion = request.json
    result = mongo.db.completions.update_one(
        {'user': completion['user']},
        {'$pull': {'docs': completion['doc']}}
    )
    return jsonify({'success': result.acknowledged})


@app.route('/validation/add', methods=['POST'])
def mark_doc_as_validated():
    '''Add a new doc into the 'docs' key in the 'validations' collection.'''
    validation = request.json
    result = mongo.db.validations.update_one(
        {'user': request.json['user']},
        {'$push': {'docs': request.json['doc']}},
        upsert=True
    )
    return jsonify({'success': result.acknowledged})


@app.route('/validation/remove', methods=['POST'])
def mark_doc_as_unvalidated():
    '''Remove an existing doc from the 'docs' key in the 'validations' collection.'''
    validation = request.json
    result = mongo.db.validations.update_one(
        {'user': validation['user']},
        {'$pull': {'docs': validation['doc']}}
    )
    return jsonify({'success': result.acknowledged})


@app.route('/results', methods=['GET'])
def get_results():
    '''Return the annotations and its metrics, per doc and per user.
    Structure of annotations per doc:
    [
        {
            'doc': 'doc1',
            'annotators': [
                {
                    'user': 'user1',
                    'decsCodes': ['decs1', 'decs2', 'decs3', ...]
                }, ...
            ]
        }, ...
    ]
    '''
    # Get the data from mongo
    total_completions = [completion for completion in mongo.db.completions.find({}, {'_id': 0})]
    total_annotations = [annotation for annotation in mongo.db.annotations.find({}, {'_id': 0})]

    # Get the completed docs set
    docs_ids_nested = [completion.get('docs') for completion in total_completions]
    docs_ids_flatten = [doc for user_docs in docs_ids_nested for doc in user_docs]
    completed_docs_ids_set = set(docs_ids_flatten)

    # Init storing variables
    annotations = {'perDoc': list(), 'perUser': list()}
    metrics = {'perDoc': list(), 'perUser': list()}

    # Annotations per doc
    for doc in completed_docs_ids_set:
        doc_users = [completion.get('user') for completion in total_completions if doc in completion.get('docs')]
        users = list()
        for user in doc_users:
            decs_codes = [annotation.get('decsCode') for annotation in total_annotations if user == annotation.get('user') and doc == annotation.get('doc')]
            user = {'user': user, 'decsCodes': decs_codes}
            users.append(user)
        doc_annotations = {'doc': doc, 'annotations': users}
        # annotations['perDoc'].append(doc_annotations)
        if len(users) >= 2:
            annotations['perDoc'].append(doc_annotations)

    # Metrics per doc
    for doc in annotations.get('perDoc'):
        doc_annotations = doc.get('annotations')
        decs_codes_list = [ann.get('decsCodes') for ann in doc_annotations]
        # Make combinations and the mean of them in case there are more than 2 annotators per document
        partials = list()
        for comb in combinations(decs_codes_list, 2):
            first = comb[0]
            second = comb[1]
            intersection = set(first).intersection(second)
            union = set(first).union(second)
            partial = len(intersection) / len(union)
            partials.append(partial)
        doc_metrics = {'doc': doc.get('doc'), 'annotatorCount': len(doc_annotations), 'metric': mean(partials)}
        metrics['perDoc'].append(doc_metrics)

    # Annotations per user
    for completion in total_completions:
        user = completion.get('user')
        docs = list()
        for completed_doc in completion.get('docs'):
            decs_codes = [annotation.get('decsCode') for annotation in total_annotations if annotation.get('user') == user and annotation.get('doc') == completed_doc]
            doc = {'doc': completed_doc, 'decsCodes': decs_codes}
            docs.append(doc)
        user_annotations = {'user': user, 'annotations': docs}
        annotations['perUser'].append(user_annotations)

    # Metrics per user

    # Load all docs annotated per each user
    annotators = [id for id in mongo.db.users.find({'role': 'annotator'}, {'_id': 0})]
    print(annotators)
    # for id in user_ids:
    #     print(list(mongo.db.annotations.find({'user': id}, {'_id': 0})))



    # For each combination of users, find the docs annotated by they both
    # set(docs_of_first).intersection(docs_of_second)

    # For each common doc, calculate the correlation of decs

    # Finally, the metric for a user is the weighted mean of the correlations with the rest of users


    result = {
        '_totalCompletedDocumentCount': len(docs_ids_flatten),
        '_distinctCompletedDocumentCount': len(completed_docs_ids_set),
        '_comparedCompletedDocumentCount': len(docs_ids_flatten) - len(completed_docs_ids_set),
        'annotations': annotations,
        'metrics': metrics
    }
    return jsonify(result)


@app.route('/users', methods=['GET'])
def get_users():
    return jsonify([user for user in mongo.db.users.find({}, {'_id': 0})])
