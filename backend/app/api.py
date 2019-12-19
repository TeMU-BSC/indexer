'''
Backend REST API to handle connections to MongoDB for the MESINESP task.

Author: alejandro.asensio@bsc.es
'''

from datetime import datetime
from bson.objectid import ObjectId

from flask import Flask, jsonify, request
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_jwt_extended import (create_access_token)
from flask_pymongo import PyMongo
from pymongo.errors import BulkWriteError, DuplicateKeyError

from app import app


# System
# app.config['MONGO_URI'] = 'mongodb://mesinesp:mesinesp@bsccnio01.bsc.es:27017/BvSalud'

# Docker
# app.config['MONGO_URI'] = 'mongodb://mesinesp:mesinesp@mongo:27017/BvSalud?authSource=admin'
app.config['MONGO_URI'] = 'mongodb://mongo:27017/BvSalud'

app.config['JWT_SECRET_KEY'] = 'secret'
mongo = PyMongo(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app)


@app.route('/hello')
def test():
    return "Hello from Flask by Alejandro."


@app.route('/user/register/one', methods=['POST'])
def register_one_user():
    '''Register a new user.'''
    user = request.json

    # Encrypt the password
    user['password'] = bcrypt.generate_password_hash(
        request.json['password']).decode('utf-8')

    # Option 1: Try to insert a new user, except DuplicateKeyError occurs.
    try:
        result = mongo.db.users.insert_one(user)
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

    # Encrypt all the passwords
    users_with_excrypted_passwords = []
    for user in users:
        user['password'] = bcrypt.generate_password_hash(
            user['password']).decode('utf-8')
        users_with_excrypted_passwords.append(user)

    # Try to insert many new users, except BulkWriteError occurs.
    try:
        result = mongo.db.users.insert_many(users_with_excrypted_passwords)
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
    '''Log in an existing user.'''
    user = request.json
    found_user = mongo.db.users.find_one({'email': user['email']}, {'_id': 0})

    # Option 1
    if found_user:
        if bcrypt.check_password_hash(found_user['password'], user['password']):
            # access_token = create_access_token(identity={
            #     'id': str(found_user['id']),
            #     'name': found_user['name'],
            #     'email': found_user['email'],
            #     'registered': found_user['_id'].generation_time.timestamp()
            # })
            access_token = create_access_token(identity=dict(found_user))
            result = jsonify({'token': access_token})
        else:
            result = jsonify({'error': 'Invalid email and password'})
    else:
        result = jsonify({'result': 'No user found'})
    return result

    # Option 2
    # if found_user and bcrypt.check_password_hash(found_user['password'], user['password']):
    #     found_user['token'] = create_access_token(found_user)
    # return jsonify(found_user)


@app.route('/document/assigned', methods=['POST'])
def get_assigned_docs():
    '''Find the assigned docs IDs to the current user, and then retrieving
    the doc data from the 'selected_importants' collection.'''
    assigned_doc_ids = mongo.db.assigned_documents.find_one(
        {'userId': request.json['id']}).get('docIds')
    completed_doc_ids = mongo.db.assigned_documents.find_one(
        {'userId': request.json['id']}).get('completedDocIds')
    docs = mongo.db.selected_importants.find(
        {'_id': {'$in': assigned_doc_ids}})

    result = []
    for doc in docs:
        # Find the decsCodes added by the current user
        descriptors = mongo.db.descriptors.find(
            {'docId': doc['_id'], 'userId': request.json['id']}, {'_id': 0, 'decsCode': 1})
        decsCodes = [descriptor['decsCode'] for descriptor in descriptors]

        # Check if this doc has been 'marked as completed' by the current user
        completed = False
        if completed_doc_ids:
            completed = doc['_id'] in completed_doc_ids

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


@app.route('/document/assign/many', methods=['POST'])
def assign_docs_to_users():
    '''Add some documents IDs to the userId key in the 'assigned_documents' collection.'''
    # userIds = [assignment['userId'] for assignment in request.json]
    # result = mongo.db.assigned_documents.insert_many(
    #     {'userId': {'$in': userIds}},
    #    # {'userId': request.json['userId'], 'docIds': request.json['docIds']},
    #     {'$set': {'x': 3}},
    #     upsert=True
    # )
    result = mongo.db.assigned_documents.insert_many(request.json)
    return jsonify({'success': result.acknowledged})


@app.route('/document/complete/add', methods=['POST'])
def mark_doc_as_completed():
    '''Add a new docId to the 'completedDocIds' array of the current user in
    the 'assigned_documents' collection.'''
    result = mongo.db.assigned_documents.update_one(
        {'userId': request.json['userId']},
        {'$push': {'completedDocIds': request.json['docId']}}
    )
    return jsonify({'success': result.acknowledged})


@app.route('/document/complete/remove', methods=['POST'])
def mark_doc_as_uncompleted():
    '''Remove an existing docId from the 'completedDocIds' array of the current
    user in the 'assigned_documents' collection.'''
    result = mongo.db.assigned_documents.update_one(
        {'userId': request.json['userId']},
        {'$pull': {'completedDocIds': request.json['docId']}}
    )
    return jsonify({'success': result.acknowledged})


@app.route('/descriptor/add', methods=['POST'])
def add_descriptor():
    '''Add a descriptor to the 'descriptors' collection.'''
    descriptor = request.json
    result = mongo.db.descriptors.insert_one(descriptor)
    return jsonify({'success': result.acknowledged})


@app.route('/descriptor/remove', methods=['POST'])
def remove_descriptor():
    '''Remove a descriptor from the 'descriptors' collection.'''
    descriptor = request.json
    result = mongo.db.descriptors.delete_one(descriptor)
    return jsonify({'deletedCount': result.deleted_count})
