from flask import Flask, jsonify, request
from init import mongo, bcrypt
from flask_jwt_extended import create_access_token


class userLogin ():
    def __init__(self, email, password, userId):
        self.__userID = userId
        self.__email = email
        self.__password = password
        self.__login_state = self.login()
        if self.__login_state:
            self.articlesIDs = self.articlesIds()
            self.articles = self.articles()


    def getLoginState(self):
        return self.__login_state

    def getArticles(self, start_record_to_send = 0, total_records_to_send = None):



        
        total_records_len = len(self.articlesIDs)
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


        return jsonify(articles_list_output[start_record_to_send: start_record_to_send + total_records_to_send])

    def login(self):
        '''Log in an existing user.'''
        users = mongo.db.users
        result = None

        found_user = users.find_one({'email': self.email})

        if found_user:
            if bcrypt.check_password_hash(found_user['password'],self.password):
                access_token = create_access_token(identity={
                    'id': str(found_user['id']),
                    'name': found_user['name'],
                    'email': found_user['email'],
                    'registered': found_user['_id'].generation_time.timestamp()
                })
                result = jsonify({'token': access_token})
            else:
                result = jsonify({'token':None, 'error': 'Invalid password'})
        else:
            result = jsonify({'token':None, 'error': 'Invalid email'})
        return result

    def articlesIds(self):   
        '''Return all the articles from the 'selected_importants' collection.'''
        user_articles = mongo.db.users.find_one({'id': self.userID}, {'_id': 0, 'articlesIds': 1})
        user_articles_ids = user_articles['articlesIds']
        return user_articles_ids

    def articles(self):
        articles = mongo.db.selected_importants.find({'_id': {'$in': self.articlesIds}})
        result = []
        for article in articles:
            # Find the decsCodes added by the current user
            descriptors = mongo.db.descriptors.find({'articleId': article['_id'], 'userId': self.__userID}, {'_id': 0, 'decsCode': 1})
            decsCodes = [descriptor['decsCode'] for descriptor in descriptors]

        # Prepare the relevant info from each article
        article_relevant_info = {
            'id': article['_id'],
            'title': article['ti_es'],
            'abstract': article['ab_es'],
            'decsCodes': decsCodes,
        }
        result.append(article_relevant_info)



user = userLogin("ank", "sdf","sdfs")
print(user.getLoginState())
