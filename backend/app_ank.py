'''
Flask + MongoDB - User Registration and Login - Explainer Video
https://www.youtube.com/watch?v=3DMMPA3uxBo
'''


from datetime import datetime
from bson.objectid import ObjectId
from typing import List

from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_jwt_extended import (create_access_token)
from pymongo.errors import BulkWriteError, DuplicateKeyError


print("init");
app = Flask(__name__)
app.config['MONGO_URI'] = 'mongodb://mesinesp:mesinesp@84.88.52.79:27017/BvSalud'
app.config['JWT_SECRET_KEY'] = 'secret'
mongo = PyMongo(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app)



def register_users(users: List[dict]):
    # Encrypt all the passwords
    
    for user in users:
        user['password'] = bcrypt.generate_password_hash(user['password']).decode('utf-8')
            
    # Try to insert many new users, except BulkWriteError occurs.
    try:
        result = mongo.db.users.insert_many(users)
        registered_users_cursor = mongo.db.users.find({'_id': {'$in': result.inserted_ids}}, {'_id': 0})
        registered_users = [user for user in registered_users_cursor]
        return jsonify({'registeredUsers': len(registered_users)})
    except BulkWriteError as error:
        error_message = error.details['writeErrors'][0]['errmsg']
        # write_errors = details['writeErrors']
        # error_message = write_errors['errmsg']
        return jsonify({'errorMessage': error_message})


def loginUser(email, password):
    result = ''
    users = mongo.db.users
    found_user = users.find_one({'email': email})

    if found_user:
        if bcrypt.check_password_hash(found_user['password'], password):
            access_token = create_access_token(identity={
                'id': str(found_user['id']),
                'name': found_user['name'],
                'email': found_user['email'],
                'registered': found_user['_id'].generation_time.timestamp()
            })
            result = jsonify({'token': access_token})
        else:
            result = jsonify({'error': 'Invalid email and password'})
    else:
        result = jsonify({'result': 'No user found'})


def getRecordsPosition(args, totalRcords):   

    start_record_to_send = args.get('start')    #Save start postition of articles. It may none or any value.
    total_records_to_send = args.get('total')   #Save total number of articles to send. It may none or any value.

    if start_record_to_send:  # If in the request send me arguments with start position, other wise it will be 0
        try:    
            start_record_to_send = int(start_record_to_send)
        except:
            start_record_to_send = 0
    else:
        start_record_to_send = 0

    # If in the request send me total records lenth after start position, other wise it will be total length of articles (in this cas
    if not total_records_to_send:
        try:
            total_records_to_send = int(total_records_to_send)
        except:
            total_records_to_send = totalRcords
    else:
        try:
            total_records_to_send = int(total_records_to_send)
        except:
            total_records_to_send = totalRcords

    return start_record_to_send, int(start_record_to_send + totalRcords)


def getArticles(args,jsonBody):
    '''Return all the articles from the 'selected_importants' collection.'''
    user_articles = mongo.db.users.find_one({'id': jsonBody['userId']}, {'_id': 0, 'articlesIds': 1})
    user_articles_ids = user_articles['articlesIds']

    

    articles = mongo.db.selected_importants.find({})

    start_pos, end_pos = getRecordsPosition(args ,len(user_articles_ids)) # Getting start and position for articles
    print(start_pos, "------------", end_pos)

    result = []
    for article in articles[start_pos: end_pos]:
        # Find the decsCodes added by the current user
        # descriptors = mongo.db.descriptors.find({'articleId': article['_id'], 'userId': jsonBody['userId']}, {'_id': 0, 'decsCode': 1})
        # decsCodes = [descriptor['decsCode'] for descriptor in descriptors]

        # Prepare the relevant info from each article
        article_relevant_info = {
            'id': article['_id'],
            'title': article['ti_es'],
            'abstract': article['ab_es'],
            # 'decsCodes': decsCodes,
        }
        result.append(article_relevant_info)

    return jsonify(result)


def getArticle(jsonBody):
    '''Return the relevant data from the queried article from the 'selected_importants' collection,
    as well as its descriptors from the 'descriptors' collection.'''
    article = mongo.db.selected_importants.find_one({'_id': jsonBody['articleId']})
    descriptors = mongo.db.descriptors.find(jsonBody, {'_id': 0, 'decsCode': 1})
    decsCodes = [descriptor['decsCode'] for descriptor in descriptors]
    result = {
        'id': article['_id'],
        'title': article['ti_es'],
        'abstract': article['ab_es'],
        'decsCodes': decsCodes,
    }
    return jsonify(result)

@app.route('/users/register/one', methods=['POST'])
def register_one_user():
    '''Register a new user.'''
    user = request.json
    result = register_users([user])
    return result


@app.route('/users/register/many', methods=['POST'])
def register_many_users():
    '''Register many users.'''
    users = request.json
    result = register_users(users)

@app.route('/users/login', methods=['POST'])
def login():
    '''Log in an existing user.'''
    
    result = loginUser(request.json['email'],request.json['password'])
    return result


@app.route('/articles/all', methods=['GET'])
def get_all_articles():

    args = request.args #Save arguments to a variable called args.
    return getArticles(args, request.json['userId'])


@app.route('/articles/one', methods=['POST'])
def get_one_article():
    return getArticle(request.json['userId'])


@app.route('/descriptors/add', methods=['POST'])
def add_descriptor():
    '''Add a descriptor to the 'descriptors' collection.'''
    descriptor = request.json
    result = mongo.db.descriptors.insert_one(descriptor)
    return ({'success': result.acknowledged})


@app.route('/descriptors/remove', methods=['POST'])
def remove_descriptor():
    '''Remove a descriptor from the 'descriptors' collection.'''
    descriptor = request.json
    result = mongo.db.descriptors.delete_one(descriptor)
    return (result.deleted_count)


if __name__ == '__main__':
    app.run(debug=True)
