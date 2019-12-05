'''
Flask + MongoDB - User Registration and Login - Explainer Video
https://www.youtube.com/watch?v=3DMMPA3uxBo
'''

from datetime import datetime
from bson.objectid import ObjectId

from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_jwt_extended import (create_access_token)
from pymongo.errors import BulkWriteError, DuplicateKeyError


app = Flask(__name__)
app.config['MONGO_URI'] = 'mongodb://mesinesp:mesinesp@84.88.52.79:27017/BvSalud'
app.config['JWT_SECRET_KEY'] = 'secret'
mongo = PyMongo(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app)


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


@app.route('/article/all', methods=['POST'])
def get_all_articles():
    '''Return all the assigned articles to the current user, retrieving data
    from the 'selected_importants' collection.'''
    user = mongo.db.users.find_one({'id': request.json['id']}, {
                                   '_id': 0, 'assignedArticles': 1, 'completedArticles': 1})
    assigned_articles_ids = user['assignedArticles']
    articles = mongo.db.selected_importants.find(
        {'_id': {'$in': assigned_articles_ids}})
    completed_articles = user['completedArticles']

    result = []
    for article in articles:
        # Find the decsCodes added by the current user
        descriptors = mongo.db.descriptors.find(
            {'articleId': article['_id'], 'userId': request.json['id']}, {'_id': 0, 'decsCode': 1})
        decsCodes = [descriptor['decsCode'] for descriptor in descriptors]

        # Check if this article has been 'marked as completed' by the current user
        completed = article['_id'] in completed_articles

        # Prepare the relevant info to be returned
        article_relevant_info = {
            'id': article['_id'],
            'title': article['ti_es'],
            'abstract': article['ab_es'],
            'decsCodes': decsCodes,
            'completed': completed
        }
        result.append(article_relevant_info)

    return jsonify(result)


# @app.route('/articles/one', methods=['GET'])
# def get_one_article():
#     '''Return the relevant data from the queried article from the 'selected_importants' collection,
#     as well as its descriptors from the 'descriptors' collection.'''
#     article = mongo.db.selected_importants.find_one({'_id': request.json['articleId']})
#     descriptors = mongo.db.descriptors.find(request.json, {'_id': 0, 'decsCode': 1})
#     decsCodes = [descriptor['decsCode'] for descriptor in descriptors]
#     result = {
#         'id': article['_id'],
#         'title': article['ti_es'],
#         'abstract': article['ab_es'],
#         'decsCodes': decsCodes,
#     }
#     return jsonify(result)


@app.route('/article/complete/add', methods=['POST'])
def mark_article_as_completed():
    '''Add a new articleId in the 'completedArticles' key on the current user
    document in the 'users' collection.'''
    result = mongo.db.users.update_one(
        {'id': request.json['userId']},
        {'$push': {'completedArticles': request.json['articleId']}}
    )
    return jsonify({'success': result.acknowledged})


@app.route('/article/complete/remove', methods=['POST'])
def mark_article_as_uncompleted():
    '''Remove an existing articleId in the 'completedArticles' key on the
    current user document in the 'users' collection.'''
    result = mongo.db.users.update_one(
        {'id': request.json['userId']},
        {'$pull': {'completedArticles': request.json['articleId']}}
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


if __name__ == '__main__':
    app.run(debug=True)
