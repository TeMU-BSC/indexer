from typing import List
from flask import Flask, jsonify, request, json
from flask_pymongo import PyMongo
from flask_mongoengine import MongoEngine
from flask_cors import CORS
# import pymongo

# MongoDB constants variable
DB_NAME = 'BvSalud'
# MONGO_URI = 'mongodb://localhost:27017/' + DB_NAME
MONGO_URI = 'mongodb://webDecs:mesinesp@bsccnio01.bsc.es:27017/' + DB_NAME

# app flask
APP = Flask(__name__)
APP.config['JWT_SECRET_KEY'] = 'secret' # ????????????????
APP.config['MONGO_URI'] = MONGO_URI
mongo = PyMongo(APP)

CORS(APP)

# Constants of attributes of article form mongoDB
ARTICLE_ID = "_id"
DESCRIPTORS = "descriptors"
ADDED = "added"
ADDED_BY_ID = "by"
ADDED_ON = "on"
DECS_ID = "id"


def remove_from_Decriptors(jsonObj: dict, descriptors_list: List[dict]):
    """ The method removes descriptor's added object from the list added. (added list: It contains id of annotator and time of indexed)
        It receives json object set by user and descriptors_list of DATA BASE, as parameters.
        After it returns the modified list of descriptor, as new list. So it can save into DATA BASE directly.

    :param jsonObj: Json object that contains information to remove a descriptor.
    :type jsonObj: dict
    :param descriptors_list: List of descriptors that gonna be modified. 
    :type descriptors_list: list
    :return: Modified list of descriptors.
    :rtype: List[dict]   

    .. highlight:: python

        # A example of json format file sent by user.
       jsonObj = {
            "decsCode": "101",
            "removedBy": "A99",
            "removedOn": 1573038300,
            "articleId": "biblio-985342"
            }
    """

    decsCode = jsonObj["decsCode"]  # decsCode from json object, sent by user.

    # annotator Id from json object,  sent by user.
    removed_by = jsonObj["removedBy"]
    is_removed = False

    # Loop to run each descriptor from descriptors list. Than it can check one by one.
    for descriptor in descriptors_list:
        if is_removed:   #If the descriptor has been removed, it will get out from the loop.
            break
        if descriptor[DECS_ID] == decsCode: #If user's decs Id match with decs Id from the descriptors list from DATA BASE.
            for added in descriptor[ADDED]:  #Loop of added list to run each added object. 
                if is_removed:  #If the descriptor has been removed, it will get out from the loop.
                    break
                if added[ADDED_BY_ID] == removed_by: # If annotator ID, who sent to remove the descriptor, is matched in the list, so
                                                     # it will remove this added object form the list.
                    descriptor[ADDED].remove(added)
                    is_removed = True   #Changing value of is_removed to True. 

                    if len(descriptor[ADDED]) == 0: #If descriptor's added list is empty, it will remove the descriptor.
                        descriptors_list.remove(descriptor)


    return descriptors_list


def add_to_Decriptors(jsonObj: dict, descriptors_list: List[dict]):
    
    """ The method add new descriptor into the list of descriptors from DATA BASE. 
        If the descriptor is already exist, than it will just add annotator ID and time.
        But if exist both, descriptor and annotator, so it will just update the time.
        After it return the modified list of descriptors as new list. Tha can overwrite into DATA BASE.
    
    :param jsonObj: Json object that contains information to add a descriptor.
    :type jsonObj: dict
    :param descriptors_list: List of descriptors that gonna be modified. 
    :type descriptors_list: list
    :return: Modified list of descriptors.
    :rtype: List[dict]   
    
    .. highlight:: python

        # A example of json format file sent by user.
        jsonObj = {
            "decsCode": "101",
            "addedBy": "A99",
            "addedOn": 1573038300,
            "articleId": "biblio-985342"
            }
    """

    decsCode = jsonObj["decsCode"]  #descriptor code
    addedBy = jsonObj["addedBy"]    # Annotator ID
    addedOn = jsonObj["addedOn"]    # Time when had been inserted by annotator.

    # Initialize a variable with boolean value "False". It serves to get out from the Loop,
    # when descriptor is added, because the value will be change by True.
    is_added = False    

    if descriptors_list:    #If descriptors list of DATA BASE is not empty, than run a loop for each descriptor. 
                            #Otherwise It will add descriptor directly, creating a list.
        for descriptor in descriptors_list: # Run each descriptor to check if is already exists.

            if descriptor[DECS_ID] == decsCode: # If exists descriptor, sent by user, So it runs a loop to check annotator ID.   
                for added in descriptor[ADDED]:
                    if added[ADDED_BY_ID] == addedBy: # If annotator id is already exists, it will overwrite (update) the time. 
                        added[ADDED_ON] = addedOn
                        is_added = True # variable is added is True now. 
                        break #getting out from the loop.

                if not is_added: # If variable is_added is false, than it will add add a json object with annotator ID and Time. 
                    descriptor[ADDED].append({ADDED_BY_ID:addedBy,ADDED_ON: addedOn})
                    is_added = True
                    break #getting out from the loop.

        if not is_added: # If variable is_added is false, than it will add json object of descriptor ID 
                         # and a list of another json object  with annotator ID and Time.
            descriptors_list.append({
                DECS_ID: decsCode,
                ADDED: [{
                    ADDED_BY_ID: addedBy,
                    ADDED_ON: addedOn
                }]
            })
    else: # If the descriptor is empty or none, Than it creates a descriptor list of json object of ""descriptor ID" and 
                         #a nested list of another json object  with ""annotator ID and Time"".
        descriptors_list = [{
            DECS_ID: decsCode,
            ADDED: [{
                ADDED_BY_ID: addedBy,
                ADDED_ON: addedOn
            }]
        }]

    return descriptors_list # modified descriptors list.


@APP.route('/articles', methods=['GET'])
def articles():
    """ Flask app's method. It works when user send a request with method get. 
        It can receive arguments like http://#.#.#.#:5000/articles?start=2&total=10. In this case it will sent articles from postion 2 to 12 (total 10).
        If it doesn't receives any argument, it returns all articles.

        .. Info::
            - start: Number of starting position of document.
            - total: Total number of documents.

    :return: A list of json Objects with information about articles like article ID, abstract text, title and descriptors.
    :rtype: List[dict]
    """
    args = request.args #Save arguments to a variable called args.

    # annotatorId = ?  

    articles_list_output = []
    articles_cursor = mongo.db.selected_importants.find()

    for article in articles_cursor: #Loop to run each article and extract specific information.

        # Uncomment all steps below, if you want to add a list of descriptor by annotator ID. 
        # Uncomment also annotatorId above.  

        # descriptor_list_to_send = []
        # descriptor_list = article.get(DESCRIPTORS)

        # if descriptor_list:
        #     descriptor_list_to_send = [descriptor["id"] for descriptor in descriptor_list
        #                                for added in descriptor[ADDED]
        #                                if added[ADDED_BY_ID] == annotatorId]

        # A dictionary of article Id and tittle. 
        tmp_dict = {"articleId": article[ARTICLE_ID],
                    "title": article["ti_es"],
                    #"abstractText": article["ab_es"],
                    #DESCRIPTORS: descriptor_list_to_send
                    }

        articles_list_output.append(tmp_dict)   # Add each temporal dictionary to the list of articles to send.
    
    #Sort list by articleID. It conform that articles are in same order always.
    articles_list_sorted = sorted(articles_list_output, key=lambda k: (k["articleId"])) 
    
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


    return jsonify(articles_list_output[start_record_to_send: start_record_to_send + total_records_to_send])


@APP.route('/one_article', methods=['GET'])
def one_article():
    """The method with get request, it returns One articles depeneding on the request. 

    """
    json_obj = request.json
    article_id = json_obj["articleId"]
    annotatorId =  json_obj["annotatorId"]

    article = mongo.db.selected_importants.find_one({ARTICLE_ID: article_id})

    descriptor_list = article.get(DESCRIPTORS)
    descriptor_list_to_send = []
    if descriptor_list:
        descriptor_list_to_send = [descriptor["id"] for descriptor in descriptor_list
                                       for added in descriptor[ADDED]
                                       if added[ADDED_BY_ID] == annotatorId]

    tmp_dict = {"articleId": article[ARTICLE_ID],
                "title": article["ti_es"],
                "abstractText": article["ab_es"],
                DESCRIPTORS: descriptor_list_to_send}

    return tmp_dict

@APP.route('/descriptors/remove', methods=['DELETE'])
def remove_descriptor():
    """ The method server for a petitison of put. It receives 

    :return: [description]
    :rtype: [type]
    """

    json_obj = request.json
    article_id = json_obj["articleId"]

    mongoObj = mongo.db.selected_importants.find_one({ARTICLE_ID: article_id})

    descriptors_list = mongoObj.get(DESCRIPTORS)

    new_descriptors_list = remove_from_Decriptors(jsonObj=json_obj, descriptors_list=descriptors_list)

    mongo.db.selected_importants.update_one({ARTICLE_ID: article_id},
                          {"$set": {DESCRIPTORS: new_descriptors_list}}
                          )

    return "Ok"

    # return jsonify({'message': 'Hello from modify'})


@APP.route('/descriptors/add', methods=['PUT'])
def add_descriptor():

    json_obj = request.json
    article_id = json_obj["articleId"]

    mongoObj = mongo.db.selected_importants.find_one({ARTICLE_ID: article_id})

    descriptors_list = mongoObj.get(DESCRIPTORS)

    new_descriptors_list = add_to_Decriptors(jsonObj=json_obj,descriptors_list= descriptors_list)

    mongo.db.selected_importants.update_one({ARTICLE_ID: article_id},
                          {"$set": {DESCRIPTORS: new_descriptors_list}}
                          )

    return "Ok"


if __name__ == '__main__':
    #prueba()
    APP.run(debug=True, host='0.0.0.0', port='5000')
    #APP.run(debug=True, host='0.0.0.0')
