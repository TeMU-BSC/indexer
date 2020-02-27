'''
Backend REST API to handle connections to MongoDB for the MESINESP task.

Author: alejandro.asensio@bsc.es
'''

from bson.objectid import ObjectId
from datetime import datetime
from itertools import combinations
from os import environ
from pprint import pprint
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


@app.route('/users', methods=['GET'])
def get_users():
    return jsonify([user for user in mongo.db.users.find({}, {'_id': 0})])


@app.route('/assignment/add', methods=['POST'])
def assign_docs_to_users():
    '''Add some documents IDs to the user key in the 'assignments' collection.'''
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
        decs_codes = mongo.db.annotations.distinct('decsCode', {'doc': doc['_id'], 'user': user})
        # Get the validated decs codes
        validated_decs_codes = mongo.db.annotationsValidated.distinct('decsCode', {'user': user, 'doc': doc['_id']})
        # Check if this doc has been marked as completed by the current user
        completed = False
        user_completions = mongo.db.completions.find_one({'user': user})
        if user_completions:
            completed = doc['_id'] in user_completions.get('docs')
        # Check if this doc has been marked as validated by the current user
        validated = False
        user_validations = mongo.db.validations.find_one({'user': user})
        if user_validations:
            validated = doc['_id'] in user_validations.get('docs')
        # Prepare the relevant info to be returned
        doc_relevant_info = {
            'id': doc['_id'],
            'title': doc['ti_es'],
            'abstract': doc['ab_es'],
            'decsCodes': decs_codes,
            'validatedDecsCodes': validated_decs_codes,
            'completed': completed,
            'validated': validated
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


@app.route('/annotations_validated/add', methods=['POST'])
def add_validated_annotations():
    '''Add some annotations validated by the user after comparing with suggestions from other users.'''
    validated_annotations = request.json
    result = mongo.db.annotationsValidated.insert_many(validated_annotations)
    return jsonify({'success': result.acknowledged})


@app.route('/annotations_validated/get', methods=['POST'])
def get_validated_annotations():
    '''Get the validated annotations by a given user for a given document.'''
    obj = request.json
    validated_decs_codes = mongo.db.annotationsValidated.distinct('decsCode', {'user': obj['user'], 'doc': obj['doc']})
    return jsonify({'validatedDecsCodes': list(validated_decs_codes)})


@app.route('/suggestions', methods=['POST'])
def get_suggestions():
    '''Get the decs codes for a specific document from other annotators that
    have marked as completed that same document.'''
    completion = request.json
    other_users = mongo.db.completions.distinct('user', {'docs': completion['doc'], 'user': {'$ne': completion['user']}})
    suggestions = mongo.db.annotations.distinct('decsCode', {'doc': completion['doc'], 'user': {'$in': other_users}})
    return jsonify({'suggestions': list(suggestions)})


@app.route('/mark_doc_as/<status>', methods=['POST'])
def mark_doc_as(status):
    '''Add a new doc into the 'docs' key in the 'completions' collection.'''
    doc_to_mark = request.json
    result = None
    if status == 'completed':
        result = mongo.db.completions.update_one(
            {'user': doc_to_mark['user']},
            {'$push': {'docs': request.json['doc']}},
            upsert=True
        )
    if status == 'uncompleted':
        result = mongo.db.completions.update_one(
            {'user': doc_to_mark['user']},
            {'$pull': {'docs': doc_to_mark['doc']}}
        )
    if status == 'validated':
        result = mongo.db.validations.update_one(
            {'user': doc_to_mark['user']},
            {'$push': {'docs': request.json['doc']}},
            upsert=True
        )
    if status == 'unvalidated':
        result = mongo.db.validations.update_one(
            {'user': doc_to_mark['user']},
            {'$pull': {'docs': doc_to_mark['doc']}}
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
    annotator_ids = list(mongo.db.users.distinct('id', {'role': 'annotator'}))
    total_completions = list(mongo.db.completions.find({'user': {'$in': annotator_ids}}, {'_id': 0}))
    total_annotations = list(mongo.db.annotations.find({'user': {'$in': annotator_ids}}, {'_id': 0}))
    total_validations = list(mongo.db.validations.find({'user': {'$in': annotator_ids}}, {'_id': 0}))

    # Get the completed docs set
    docs_ids_nested = [completion.get('docs') for completion in total_completions]
    docs_ids_flatten = [doc for user_docs in docs_ids_nested for doc in user_docs]
    completed_docs_ids_set = set(docs_ids_flatten)

    # Init storing variables
    annotations = {'perDoc': list(), 'perUser': list()}
    metrics = {'perDoc': list(), 'perUserPair': list(), 'perUser': list()}

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
        decs_codes_list = [ann.get('decsCodes') for ann in doc.get('annotations')]
        # Make combinations and the mean of them in case there are more than 2 annotators per document
        partials = list()
        for comb in combinations(decs_codes_list, 2):
            first_decs = comb[0]
            second_decs = comb[1]
            intersection = set(first_decs).intersection(second_decs)
            union = set(first_decs).union(second_decs)
            partial = len(intersection) / len(union)
            partials.append(partial)
        doc_metric = {'doc': doc.get('doc'), 'annotatorCount': len(doc.get('annotations')), 'correlation': mean(partials)}
        metrics['perDoc'].append(doc_metric)

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

    # Metrics per user pair

    # Find the common docs annotated by each pair of users
    for pair in combinations(annotator_ids, 2):
        first_annotator_id = pair[0]
        second_annotator_id = pair[1]
        first_annotations = [annotation for ann in annotations.get('perUser') if ann.get('user') == first_annotator_id for annotation in ann.get('annotations')]
        second_annotations = [annotation for ann in annotations.get('perUser') if ann.get('user') == second_annotator_id for annotation in ann.get('annotations')]
        first_docs = [ann.get('doc') for ann in first_annotations]
        second_docs = [ann.get('doc') for ann in second_annotations]
        common_docs = set(first_docs).intersection(second_docs)

        # Calculate the correlation of DeCS codes for each common doc between that pair of users
        docs_metrics = list()
        for doc in common_docs:
            for ann in first_annotations:
                if ann.get('doc') == doc:
                    first_decs = ann.get('decsCodes')
            for ann in second_annotations:
                if ann.get('doc') == doc:
                    second_decs = ann.get('decsCodes')
            intersection = set(first_decs).intersection(second_decs)
            union = set(first_decs).union(second_decs)
            correlation = len(intersection) / len(union)
            # print(first_annotator_id, second_annotator_id, doc, f'{len(intersection)} / {len(union)} = {correlation}')
            docs_metrics.append({'doc': doc, 'correlation': correlation})

        correlations = [metric.get('correlation') for metric in docs_metrics]
        score = 0
        if correlations:
            score = mean(correlations)
        metrics['perUserPair'].append({'annotatorPair': list(pair), 'metrics': docs_metrics, 'averageScore': score})
    
    # Finally, for each annotator, calculate its weighted mean of the correlations with the rest of annotators
    for id in annotator_ids:
        scores = list()
        amounts = list()
        for pair_metric in metrics.get('perUserPair'):
            if id in pair_metric.get('annotatorPair'):
                scores.append(pair_metric.get('averageScore'))
                amounts.append(len(pair_metric.get('metrics')))
        try:
            weighted_average = sum(x * y for x, y in zip(scores, amounts)) / sum(amounts)
        except ZeroDivisionError:
            weighted_average = 0
        metrics['perUser'].append({'user': id, 'annotatorScore': weighted_average})

    result = {
        '_totalCompletedDocumentCount': len(docs_ids_flatten),
        '_distinctCompletedDocumentCount': len(completed_docs_ids_set),
        '_comparedCompletedDocumentCount': len(docs_ids_flatten) - len(completed_docs_ids_set),
        'annotations': annotations,
        'metrics': metrics
    }
    return jsonify(result)
