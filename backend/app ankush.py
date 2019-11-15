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
from flask_jwt_extended import create_access_token
from pymongo.errors import BulkWriteError, DuplicateKeyError


app = Flask(__name__)
app.config['MONGO_URI'] = 'mongodb://LOCALHOST:27017/BvSalud'
app.config['JWT_SECRET_KEY'] = 'secret'
mongo = PyMongo(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app)

def getRecordsPosition(args):

    total_records_len = len(articles_list_sorted)

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
            total_records_to_send = total_records_len
    else:
        try:
            total_records_to_send = int(total_records_to_send)
        except:
            total_records_to_send = total_records_len

    return start_record_to_send, int(start_record_to_send + total_records_len)

@app.route('/users/register/one', methods=['POST'])
def register_one_user():
    '''Register a new user.'''
    user = request.json

    # Encrypt the user password
    user['password'] = bcrypt.generate_password_hash(request.json['password']).decode('utf-8')

    # Option 1: Try to insert a new user, except DuplicateKeyError occurs.
    # try:
    #     result = mongo.db.users.insert_one(user)
    #     success = result.acknowledged
    #     error_message = None
    #     registered_user = mongo.db.users.find_one({'_id': result.inserted_id}, {'_id': 0})
    # except DuplicateKeyError:
    #     success = False
    #     error_message = f'''There is already an existing user with the id "{user['id']}"'''
    #     registered_user = None
    # return jsonify({'success': success, 'errorMessage': error_message, 'registeredUser': registered_user})

    # Option 2: Update an existing user if exists, insert a new user otherwise.
    result = mongo.db.users.update_one({'id': user['id']}, {'$set': user}, upsert=True)
    registered_user = mongo.db.users.find_one({'_id': result.upserted_id}, {'_id': 0})
    return jsonify(result.raw_result)


@app.route('/users/register/many', methods=['POST'])
def register_many_users():
    '''Register many users.'''
    users = request.json

    # Encrypt all the passwords
    users_with_excrypted_passwords = []
    for user in users:
        user['password'] = bcrypt.generate_password_hash(user['password']).decode('utf-8')
        users_with_excrypted_passwords.append(user)
    
    # Try to insert many new users, except BulkWriteError occurs.
    try:
        result = mongo.db.users.insert_many(users_with_excrypted_passwords)
        registered_users_cursor = mongo.db.users.find({'_id': {'$in': result.inserted_ids}}, {'_id': 0})
        registered_users = [user for user in registered_users_cursor]
        return jsonify({'registeredUsers': len(registered_users)})
    except BulkWriteError as error:
        error_message = error.details['writeErrors'][0]['errmsg']
        # write_errors = details['writeErrors']
        # error_message = write_errors['errmsg']
        return jsonify({'errorMessage': error_message})


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

    args = request.args #Save arguments to a variable called args.

    '''Return all the articles from the 'selected_importants' collection.'''
    user_articles = mongo.db.users.find_one({'id': request.json['userId']}, {'_id': 0, 'articlesIds': 1})
    user_articles_ids = user_articles['articlesIds']

    

    articles = mongo.db.selected_importants.find({'_id': {'$in': user_articles_ids}})

    start_pos, end_pos =getRecordsPosition(args)
    print(start_pos, "------------", end_pos)

    result = []
    for article in articles[start_pos: end_pos]:
        # Find the decsCodes added by the current user
        descriptors = mongo.db.descriptors.find({'articleId': article['_id'], 'userId': request.json['userId']}, {'_id': 0, 'decsCode': 1})
        decsCodes = [descriptor['decsCode'] for descriptor in descriptors]

        # Prepare the relevant info from each article
        article_relevant_info = {
            'id': article['_id'],
            'title': article['ti_es'],
            'abstract': article['ab_es'],
            'decsCodes': decsCodes,
        }
        result.append(article_relevant_info)

    return jsonify(result)


@app.route('/articles/one', methods=['POST'])
def get_one_article():
    '''Return the relevant data from the queried article from the 'selected_importants' collection,
    as well as its descriptors from the 'descriptors' collection.'''
    article = mongo.db.selected_importants.find_one({'_id': request.json['articleId']})
    descriptors = mongo.db.descriptors.find(request.json, {'_id': 0, 'decsCode': 1})
    decsCodes = [descriptor['decsCode'] for descriptor in descriptors]
    result = {
        'id': article['_id'],
        'title': article['ti_es'],
        'abstract': article['ab_es'],
        'decsCodes': decsCodes,
    }
    return jsonify(result)


@app.route('/descriptors/add', methods=['POST'])
def add_descriptor():
    '''Add a descriptor to the 'descriptors' collection.'''
    descriptor = request.json
    result = mongo.db.descriptors.insert_one(descriptor)
    return jsonify({'success': result.acknowledged})


@app.route('/descriptors/remove', methods=['POST'])
def remove_descriptor():
    '''Remove a descriptor from the 'descriptors' collection.'''
    descriptor = request.json
    result = mongo.db.descriptors.delete_one(descriptor)
    return jsonify(result.deleted_count)

user = ""


from articles import userLogin
@app.route("/user/log")
def log():
    global user
    p = request.json["p"]
    e = request.json["e"]
    uid = request.json["id"]
    user = userLogin(uid,e,p)
    print(user)
    return str(user)


@app.route("/user/art")
def art():
    return user.email


if __name__ == '__main__':
    app.run(debug=True)
