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
# from flask_jwt_extended import JWTManager
# from flask_jwt_extended import (create_access_token)
from flask_pymongo import PyMongo
from pymongo.errors import BulkWriteError, DuplicateKeyError

from app import app


app.config['MONGO_URI'] = environ.get('MONGO_URI')
# app.config['JWT_SECRET_KEY'] = environ.get('JWT_SECRET_KEY')
# app.config.from_envvar('FLASK_ENV')

bcrypt = Bcrypt(app)
mongo = PyMongo(app)
# jwt = JWTManager(app)
CORS(app)


@app.route('/hello')
def hello():
    return f'Hello from Flask by Alejandro. ENV={environ.get("ENV")} FLASK_ENV={environ.get("FLASK_ENV")}'


@app.route('/user/register/one', methods=['POST'])
def register_one_user():
    '''Register a new user.'''
    user = request.json

    # Encrypt the password
    user['password'] = bcrypt.generate_password_hash(
        request.json['password']).decode('utf-8')

    # Option 1: Try to insert a new user, except DuplicateKeyError occurs.
    try:
        result = mongo.db.users.replace_one(user, user, upsert=True)
        success = result.acknowledged
        error_message = None
        registered_user = mongo.db.users.find_one(
            {'_id': result.inserted_id}, {'_id': 0})
    except DuplicateKeyError as error:
        success = False
        # error_message_original = error.details['writeErrors'][0]['errmsg']
        error_message = f'''There is already an existing user with the id "{user['id']}"'''
        registered_user = None
    return jsonify({'success': success, 'errorMessage': error_message, 'registeredUser': registered_user})

    # Option 2: Update an existing user if exists, insert a new user otherwise.
    # result = mongo.db.users.insert_one(user)
    # return jsonify({'success': result.acknowledged})


@app.route('/user/register/many', methods=['POST'])
def register_many_users():
    '''Register many users.'''
    users = request.json

    # [Encrypt approach]
    # users_with_excrypted_passwords = []
    # for user in users:
    #     user['password'] = bcrypt.generate_password_hash(user['password']).decode('utf-8')
    #     users_with_excrypted_passwords.append(user)

    # Try to insert many new users, except BulkWriteError occurs.
    try:
        # result = mongo.db.users.insert_many(users_with_excrypted_passwords)
        result = mongo.db.users.insert_many(users)
        # result = mongo.db.users.update_many(users, {'$set': users}, upsert=True)
        success = result.acknowledged
        error_message = None
        registered_users_cursor = mongo.db.users.find(
            {'_id': {'$in': result.inserted_ids}}, {'_id': 0})
        registered_users = len([user for user in registered_users_cursor])
    except BulkWriteError as error:
        success = False
        error_message = error.details['writeErrors'][0]['errmsg']
        registered_users = 0
    return jsonify({'success': success, 'errorMessage': error_message, 'registeredUsers': registered_users})


@app.route('/user/login', methods=['POST'])
def login():
    '''Check if the given email and password match the ones for that user in database.'''
    user = request.json
    found_user = mongo.db.users.find_one({'email': user['email']}, {'_id': 0})

    result = {'invalidCredentials': 'No user found'}
    if found_user:
        # [Encrypt approach]
        # if bcrypt.check_password_hash(found_user['password'], user['password']):
        #     # [Token approach]    
        #     access_token = create_access_token(identity=dict(found_user))
        #     result = jsonify({'token': access_token})
        #     # Plain user approach
        #     result = {'user': found_user}
        # else:
        #     result['invalidCredentials'] = 'Invalid password'

        # More than one user with the same email with different passwords (superannotators) approach
        # for found_user in found_users:
        #     if user['password'] == found_user['password']:
        #         result = {'user': found_user}
        #     else:
        #         result['invalidCredentials'] = 'Invalid password'

        if found_user['password'] == user['password']:
            result = {'user': found_user}
        else:
            result['invalidCredentials'] = 'Invalid password'
    return jsonify(result)


@app.route('/document/assign/many', methods=['POST'])
def assign_docs_to_users():
    '''Add some documents IDs to the user key in the 'assigned_documents' collection.'''
    result = mongo.db.assignments.insert_many(request.json)
    return jsonify({'success': result.acknowledged})

    # users = [assignment.get('user') for assignment in request.json]
    # docs = [assignment.get('docs') for assignment in request.json]
    # result = mongo.db.assignments.update_many(
    #     {'user': {'$in': users}},
    #     {'docs': ...},
    #     upsert=True
    # )
    # return jsonify({'success': result.acknowledged, 'modifiedCount': result.modifiedCount})


@app.route('/document/assigned', methods=['POST'])
def get_assigned_docs():
    '''Find the assigned docs IDs to the current user, and then retrieving
    the doc data from the 'selected_importants' collection.'''
    assigned_doc_ids = mongo.db.assignments.find_one({'user': request.json['user']}).get('docs')
    docs = mongo.db.selected_importants.find({'_id': {'$in': assigned_doc_ids}})

    result = []
    for doc in docs:
        # Find the decsCodes added by the current user
        descriptors = mongo.db.descriptors.find(
            {'doc': doc['_id'], 'user': request.json['user']}, {'_id': 0, 'decsCode': 1})
        decsCodes = [descriptor['decsCode'] for descriptor in descriptors]

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


@app.route('/document/completed', methods=['POST'])
def mark_doc_as_completed():
    '''Add a new doc into the 'assigned' or 'revised' key in the 'completions' collection.'''
    result = mongo.db.completions.update_one(
        {'user': request.json['user']},
        {'$push': {'docs': request.json['doc']}},
        upsert=True
    )
    return jsonify({'success': result.acknowledged})


@app.route('/document/pending', methods=['POST'])
def mark_doc_as_pending():
    '''Remove an existing doc from the 'completedDocs' array of the current
    user in the 'assigned_documents' collection.'''
    result = mongo.db.completions.update_one(
        {'user': request.json['user']},
        {'$pull': {'docs': request.json['doc']}}
    )
    return jsonify({'success': result.acknowledged})


@app.route('/descriptor/add', methods=['POST'])
def add_descriptor():
    '''Add a descriptor to the 'descriptors' collection.'''
    descriptor = request.json
    # Use 'replace_one' instead of 'insert_one' to avoid repeated descriptors
    # by the same user logged at the same time in different browsers.
    result = mongo.db.descriptors.replace_one(descriptor, descriptor, upsert=True)
    return jsonify({'success': result.acknowledged})


@app.route('/descriptor/remove', methods=['POST'])
def remove_descriptor():
    '''Remove a descriptor from the 'descriptors' collection.'''
    descriptor = request.json
    result = mongo.db.descriptors.delete_one(descriptor)
    return jsonify({'deletedCount': result.deleted_count})
