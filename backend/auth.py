'''
Flask + MongoDB - User Registration and Login - Explainer Video
https://www.youtube.com/watch?v=3DMMPA3uxBo
'''

from datetime import datetime
from bson.objectid import ObjectId

from flask import Flask, jsonify, request, json
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


@app.route('/users/register', methods=['POST'])
def register():
    '''Register a new user.'''
    users = mongo.db.users
    name = request.get_json()['name']
    email = request.get_json()['email']
    password = bcrypt.generate_password_hash(request.get_json()['password']).decode('utf-8')
    created = datetime.utcnow()

    user_id = users.insert_one({
        'name': name,
        'email': email,
        'password': password,
        'created': created,
    })

    new_user = users.find_one({'_id': user_id})
    result = {'email': f"{new_user['email']} registered"}

    return jsonify({'result': result})

@app.route('/users/login', methods=['POST'])
def login():
    '''Log in an existing user.'''
    users = mongo.db.users
    email = request.get_json()['email']
    password = request.get_json()['password']
    result = ''

    found_user = users.find_one({'email': email})

    if found_user:
        if bcrypt.check_password_hash(found_user['password'], password):
            access_token = create_access_token(identity={
                'name': found_user['name'],
                'email': found_user['email']
            })
            result = jsonify({'token': access_token})
        else:
            result = jsonify({'error': 'Invalid email and password'})
    else:
        result = jsonify({'result': 'No user found'})
    return result

if __name__ == '__main__':
    app.run(debug=True)
