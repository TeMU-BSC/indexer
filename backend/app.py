'''
Flask + MongoDB - User Registration and Login - Explainer Video
https://www.youtube.com/watch?v=3DMMPA3uxBo
'''

from datetime import datetime
# from bson.objectid import ObjectId

from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_jwt_extended import (create_access_token)


app = Flask(__name__)
app.config['MONGO_URI'] = 'mongodb://mesinesp:mesinesp@84.88.52.79:27017/BvSalud'
app.config['JWT_SECRET_KEY'] = 'secret'
mongo = PyMongo(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app)


@app.route('/users/register/one', methods=['POST'])
def register():
    '''Register a new user.'''
    # TODO: check id and name to not add repeated users

    users = mongo.db.users
    user_to_insert = {
        'id': request.json['id'],
        'name': request.json['name'],
        'email': request.json['email'],
        'password': bcrypt.generate_password_hash(request.json['password']).decode('utf-8'),
        'role': request.json['role'],
    }
    insert_one_result = users.insert_one(user_to_insert)
    return jsonify({'result': str(insert_one_result.inserted_id)})


@app.route('/users/register/many', methods=['POST'])
def register_many():
    '''Register many users.'''
    # TODO: check id and name to not add repeated users

    users = request.json
    
    # Encrypt the passwords
    users_to_insert = []
    for user in users:
        user['password'] = bcrypt.generate_password_hash(user['password']).decode('utf-8')
        users_to_insert.append(user)

    insert_many_result = mongo.db.users.insert_many(users_to_insert)

    result = [str(inserted_id) for inserted_id in insert_many_result.inserted_ids]
    return jsonify({'result': result})


@app.route('/users/login', methods=['POST'])
def login():
    '''Log in an existing user.'''
    users = mongo.db.users
    email = request.json['email']
    password = request.json['password']
    result = ''

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
    return result


@app.route('/articles/all', methods=['GET'])
def get_all_articles():
    '''Return all the articles from the 'selected_importants' collection.'''
    user_articles = mongo.db.users.find_one( { 'id': request.json['userId'] }, { '_id': 0, 'articlesIds': 1 } )
    user_articles_ids = user_articles['articlesIds']

    articles = list(mongo.db.selected_importants.find({'_id': { '$in': user_articles_ids } }))

    result = []
    for article in articles:
        # Find the descriptors added by the current user
        descriptors_cursor = mongo.db.descriptors.find({'articleId': article['_id'], 'userId': request.json['userId']}, { '_id': 0, 'decsCode': 1 })
        descriptors = [descriptor['decsCode'] for descriptor in descriptors_cursor]

        # Prepare the relevant info from each article
        article_relevant_info = {
            'id': article['_id'],
            'title': article['ti_es'],
            'abstract': article['ab_es'],
            'descriptors': descriptors,
        }
        result.append(article_relevant_info)

    return jsonify(result)


@app.route('/articles/one', methods=['POST'])
def get_one_article():
    '''Return the relevant data from the queried article from the 'selected_importants' collection,
    as well as its descriptors from the 'descriptors' collection.'''
    article = mongo.db.selected_importants.find_one({'_id': request.json['articleId']})
    descriptors_cursor = mongo.db.descriptors.find(request.json, { '_id': 0, 'decsCode': 1 })
    descriptors = [descriptor['decsCode'] for descriptor in descriptors_cursor]
    result = {
        'id': article['_id'],
        'title': article['ti_es'],
        'abstract': article['ab_es'],
        'descriptors': descriptors,
    }
    return jsonify(result)


@app.route('/descriptors/add', methods=['POST'])
def add_descriptor():
    '''Add a descriptor to the 'descriptors' collection.'''
    descriptor = request.json
    result = mongo.db.descriptors.insert_one(descriptor)
    return jsonify('result')


@app.route('/descriptors/remove', methods=['POST'])
def remove_descriptor():
    '''Remove a descriptor from the 'descriptors' collection.'''
    descriptor = request.json
    result = mongo.db.descriptors.delete_one(descriptor)

    # print(help(result))

    return jsonify(result.deleted_count)


if __name__ == '__main__':
    app.run(debug=True)
