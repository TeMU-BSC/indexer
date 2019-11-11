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

ARTICLE_ID = "_id"

DESCRIPTORS = "descriptors"
ADDED = "added"
ADDED_BY_ID = "by"
ADDED_ON = "on"


def modifyDecriptors(jsonObj, descriptors_list):
    """{
        "decsCode": "101",
        "removedBy": "A99",
        "removedOn": 1573038300,
        "articleId": "biblio-985342"
    }"""

    decsCode = jsonObj["decsCode"]
    removed_by = jsonObj["removedBy"]

    for descriptor in descriptors_list:
        if descriptor["id"] == decsCode:
            for added in descriptor[ADDED]:
                if added[ADDED_BY_ID] == removed_by:
                    descriptor[ADDED].remove(added)

    return descriptors_list


@APP.route('/articles', methods=['GET'])
def get():
    """The method with get request, it returns articles depeneding on the request. 

    """
    args = request.args

    print(args)
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
                    "tittle" : article["ti_es"],
                    "abstractText": article["ab_es"],
                    DESCRIPTORS: descriptor_list_to_send}

        articles_list_output.append(tmp_dict)

    articles_list_sorted = sorted(
        articles_list_output, key=lambda k: (k[ARTICLE_ID]))
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

    return jsonify(articles_list_output[start_record_to_send: start_record_to_send + total_records_to_send])


@APP.route('/modify', methods=['PUT'])
def put():
    """ The method server for a petitison of put. It receives 

    :return: [description]
    :rtype: [type]
    """

    json_obj = request.json
    article_id = json_obj["articleId"]

    mongoObj = COLLECTION.find_one({"_id": article_id})

    descriptors_list = mongoObj.get(DESCRIPTORS)
    pprint.pprint(descriptors_list)

    new_descriptors_list = modifyDecriptors(json_obj, descriptors_list)

    COLLECTION.update_one({ARTICLE_ID: article_id},
                          {"$set": {DESCRIPTORS: new_descriptors_list}}
                          )

    return "done"

    # return jsonify({'message': 'Hello from modify'})


if __name__ == '__main__':
    # APP.run(debug=False, host='0.0.0.0', port='5100')
    APP.run(debug=True, host='0.0.0.0')
