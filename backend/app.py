"""[summary]
"""
from typing import List
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
import json
import pprint
# import pymongo

# MongoDB constants variable
DB_NAME = 'BvSalud'
MONGO_URI = 'mongodb://localhost:27017/'
# MONGO_URI = 'mongodb://84.88.52.79:27017/'
COLLECTION_NAME = 'selected_importants'

CLIENT = MongoClient(MONGO_URI)
DB = CLIENT[DB_NAME]
COLLECTION = DB[COLLECTION_NAME]

# APP Flask
APP = Flask(__name__)
CORS(APP)

# Constants of attributes of article form mongoDB
ARTICLE_ID = "_id"
DESCRIPTORS = "descriptors"
ADDED = "added"
ADDED_BY_ID = "by"
ADDED_ON = "on"
DECS_ID = "id"


def remove_from_Decriptors(jsonObj, descriptors_list):
    """ The method removes descriptor's added object from the list added. (added list: It contains id of annotator and time of indexed)
        It receives json object set by user and descriptors_list of DATA BASE, as parameters.
        After it returns the modified list of descriptor, as new list. So it can save into DATA BASE directly.

    :param jsonObj: A dict sent by user with information to delete a added object from the list.
    :type jsonObj: dict
    :return: Modified list of descriptors. The list may contain dict object inside.
    :rType: list[]

    .. highlight:: python

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

    # Loop to run each descriptor from descriptors list. Than it can check one by one.
    for descriptor in descriptors_list:

        if descriptor[DECS_ID] == decsCode: #If user's decs Id match with decs Id from the descriptors list from DATA BASE.
            for addedOne in descriptor[ADDED]:  #Loop f
                if addedOne[ADDED_BY_ID] == removed_by:
                    descriptor[ADDED].remove(addedOne)

                if len(descriptor[ADDED]) == 0:
                    descriptors_list.remove(descriptor)

    return descriptors_list


def add_to_Decriptors(jsonObj, descriptors_list):
    """{
        "decsCode": "101",
        "addedBy": "A99",
        "addedOn": 1573038300,
        "articleId": "biblio-985342"
        }"""

    decsCode = jsonObj["decsCode"]
    addedBy = jsonObj["addedBy"]
    addedOn = jsonObj["addedOn"]

    is_added = False

    if descriptors_list:
        for descriptor in descriptors_list:
            if descriptor[DECS_ID] == decsCode:
                descriptor[ADDED].append(
                    {ADDED_BY_ID: addedBy, ADDED_ON: addedOn})
                is_added = True
                break

        if not is_added:
            descriptors_list.append({
                DECS_ID: decsCode,
                ADDED: [{
                    ADDED_BY_ID: addedBy,
                    ADDED_ON: addedOn
                }]
            })
    else:
        descriptors_list = [{
            DECS_ID: decsCode,
            ADDED: [{
                ADDED_BY_ID: addedBy,
                ADDED_ON: addedOn
            }]
        }]

    return descriptors_list


@APP.route('/articles', methods=['GET'])
def articles():
    """The method with get request, it returns articles depeneding on the request. 

    """
    args = request.args

    annotatorId = "A1"

    articles_list_output = []
    found_articles_cursor = COLLECTION.find()

    for article in found_articles_cursor:
        descriptor_list_to_send = []

        descriptor_list = article.get(DESCRIPTORS)

        if descriptor_list:
            descriptor_list_to_send = [descriptor["id"] for descriptor in descriptor_list
                                       for added in descriptor[ADDED]
                                       if added[ADDED_BY_ID] == annotatorId]

        tmp_dict = {"articleId": article[ARTICLE_ID],
                    "tittle": article["ti_es"],
                    "abstractText": article["ab_es"],
                    DESCRIPTORS: descriptor_list_to_send}

        articles_list_output.append(tmp_dict)

    articles_list_sorted = sorted(articles_list_output, key=lambda k: (k["articleId"]))

    total_records_len = len(articles_list_sorted)

    start_record_to_send = args.get('start')
    total_records_to_send = args.get('total')

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
    args = request.args

    article_id = "biblio-985342"
    annotatorId = "A1"

    article = COLLECTION.find_one({ARTICLE_ID: article_id})

    descriptor_list = article.get(DESCRIPTORS)
    descriptor_list_to_send = []
    if descriptor_list:
        descriptor_list_to_send = [descriptor["id"] for descriptor in descriptor_list
                                       for added in descriptor[ADDED]
                                       if added[ADDED_BY_ID] == annotatorId]

    tmp_dict = {"articleId": article[ARTICLE_ID],
                "tittle": article["ti_es"],
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
    articleARTICLE_ID = json_obj["articleId"]

    mongoObj = COLLECTION.find_one({ARTICLE_ID: articleARTICLE_ID})

    descriptors_list = mongoObj.get(DESCRIPTORS)

    new_descriptors_list = remove_from_Decriptors(json_obj, descriptors_list)

    COLLECTION.update_one({ARTICLE_ID: articleARTICLE_ID},
                          {"$set": {DESCRIPTORS: new_descriptors_list}}
                          )

    return "done"

    # return jsonify({'message': 'Hello from modify'})


@APP.route('/descriptors/add', methods=['PUT'])
def add_descriptor():

    json_obj = request.json
    articleARTICLE_ID = json_obj["articleId"]

    mongoObj = COLLECTION.find_one({ARTICLE_ID: articleARTICLE_ID})

    descriptors_list = mongoObj.get(DESCRIPTORS)

    new_descriptors_list = add_to_Decriptors(json_obj, descriptors_list)

    COLLECTION.update_one({ARTICLE_ID: articleARTICLE_ID},
                          {"$set": {DESCRIPTORS: new_descriptors_list}}
                          )

    return "done"


if __name__ == '__main__':
    # APP.run(debug=False, host='0.0.0.0', port='5100')
    APP.run(debug=True, host='0.0.0.0')
