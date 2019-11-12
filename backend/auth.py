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
app.config['MONGO_DBNAME'] = 'myNewDatabase'
app.config['MONGO_URI'] = 'mongodb://localhost:27017/myNewDatabase'
app.config['JWT_SECRET_KEY'] = 'secret'
mongo = PyMongo(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app)


@app.route('/users/register/one', methods=['POST'])
def register():
    '''Register a new user.'''
    users = mongo.db.users
    user_to_insert = {
        'id': request.json['id'],
        'name': request.json['name'],
        'email': request.json['email'],
        'password': bcrypt.generate_password_hash(request.json['password']).decode('utf-8'),
        'created': datetime.utcnow(),
    }
    insert_one_result = users.insert_one(user_to_insert)
    return jsonify({'result': str(insert_one_result.inserted_id)})


@app.route('/users/register/many', methods=['POST'])
def register_many():
    '''Register many users.'''
    users = mongo.db.users

    users_to_insert = []
    for user in request.json:
        user_to_insert = {
            'id': user['id'],
            'name': user['name'],
            'email': user['email'],
            'password': bcrypt.generate_password_hash(user['password']).decode('utf-8'),
            'created': datetime.utcnow(),
        }
        users_to_insert.append(user_to_insert)

    insert_many_result = users.insert_many(users_to_insert)

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
                # 'registered': found_user['_id'].generation_time
            })
            result = jsonify({'token': access_token})
        else:
            result = jsonify({'error': 'Invalid email and password'})
    else:
        result = jsonify({'result': 'No user found'})
    return result

if __name__ == '__main__':
    app.run(debug=True)
