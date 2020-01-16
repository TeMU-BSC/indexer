'''
Backend REST API to handle connections to MongoDB for the MESINESP task.

Author: alejandro.asensio@bsc.es
'''

from bson.objectid import ObjectId
from datetime import datetime
from os import environ

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
    return f'Hello from Flask by Alejandro. ENV={environ.get("ENV")} FLASK_ENV={environ.get("FLASK_ENV")}'


@app.route('/user/register/many', methods=['POST'])
def register_many_users():
    '''Register many users.'''
    users = request.json

    # Try to insert many new users, except BulkWriteError occurs.
    try:
        result = mongo.db.users.insert_many(users)
        # result = mongo.db.users.update_many(users, {'$set': users}, upsert=True)
        success = result.acknowledged
        message = None
        registered_users_cursor = mongo.db.users.find({'_id': {'$in': result.inserted_ids}}, {'_id': 0})
        registered_users = len([user for user in registered_users_cursor])
    except BulkWriteError as error:
        success = False
        message = error.details['writeErrors'][0]['errmsg']
        registered_users = 0
    return jsonify({'success': success, 'message': error_message, 'registeredUsers': registered_users})


@app.route('/user/login', methods=['POST'])
def login():
    '''Check if the given email and password match the ones for that user in database.'''
    user = request.json
    # found_user = mongo.db.users.find_one({'email': user['email']}, {'_id': 0})
    found_user = mongo.db.users.find_one({'email': user['email'], 'password': user['password']}, {'_id': 0})
    if found_user:
        # [Encrypt approach]
        # if bcrypt.check_password_hash(found_user['password'], user['password']):
        #     # Plain user approach
        #     result = {'user': found_user}
        # else:
        #     result['error'] = 'Invalid password'

        result = {'user': found_user}
    else:
        result = {'error': 'Invalid user and/or password'}
    return jsonify(result)


@app.route('/document/assign/many', methods=['POST'])
def assign_docs_to_users():
    '''Add some documents IDs to the user key in the 'assigned_documents' collection.'''
    result = mongo.db.assignments.insert_many(request.json)
    return jsonify({'success': result.acknowledged})


@app.route('/document/assigned', methods=['POST'])
def get_assigned_docs():
    '''Find the assigned docs IDs to the current user, and then retrieving
    the doc data from the 'selected_importants' collection.'''
    found_user = mongo.db.assignments.find_one({'user': request.json['user']})

    assigned_doc_ids = []
    if found_user:
        assigned_doc_ids = found_user.get('docs')

    docs = mongo.db.selected_importants.find({'_id': {'$in': assigned_doc_ids}})

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
    # return jsonify({'docsCount': len(result), 'docs': result})


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
def mark_doc_as_pending():
    '''Remove an existing doc from the 'docs' key in the 'completions' collection.'''
    completion = request.json
    result = mongo.db.completions.update_one(
        {'user': completion['user']},
        {'$pull': {'docs': completion['doc']}}
    )
    return jsonify({'success': result.acknowledged})


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
