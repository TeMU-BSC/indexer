"""[summary]
"""
from typing import List
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
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
ABSTRACT = "ab_es"
DESCRIPTORS = "descriptors"
ADDED = "added"
ADDED_BY_ID = "by"
ADDED_ON = "on"


def getDescriptorObj_decsList(jsonObj) -> (str, List[dict], List[str]):
    """Ex of json object sent by user. "descriptors" contain a list of objects. This object in mongoDB's collection will same format as it.
        {
        "_id": "biblio-1001075",
        "descriptors": [
            {
                "id": "11",
                "added": [
                    {
                        "by": "A1",
                        "on": "2019-11-02T08:02:36"
                    }
                ]
            }
        }
    """

    article_id = jsonObj[ARTICLE_ID]
    user_added_by = jsonObj[DESCRIPTORS][0][ADDED][0]

    mongo_obj = COLLECTION.find_one({ARTICLE_ID: article_id})

    mongo_descriptors = mongo_obj.get(DESCRIPTORS)
    jSon_descriptors = jsonObj[DESCRIPTORS]

    if not mongo_descriptors:
        return jSon_descriptors

    for descriptor in jSon_descriptors:
        """Example of each descriptor from json object.
            "descriptors": [
                    {
                    "id": "11",
                    "added": [
                                {
                                    "by": "A1",
                                    "on": "2019-11-02T08:02:36"
                                }
                            ]
                    },
                     {
                    "id": "12",
                    "added": [
                                {
                                    "by": "A1",
                                    "on": "2019-11-02T08:02:36"
                                }
                            ]
                    }
                ]
        """
        # Getting descriptor id from main json object, that have been sent by user to save.
        user_descriptor_id = descriptor["id"]
        """ EX:
                "id": "122"
        """
        user_added_obj = descriptor[ADDED]  # Getting added object' list from main json object, that have been sent by user to save.
        """ EX:
                "added": [
                            {
                                "by": "A1",
                                "on": "2019-11-02T08:02:36"
                            },
                            {
                                "by": "A1",
                                "on": "2019-11-02T08:02:36"
                            }
                        ]
        """
        for mongo_descriptor in mongo_descriptors:  # Loop to get each descriptor object from the list of sescriptors.
            # descriptor id from mongo DB descriptors of each descriptor.
            mongo_descriptor_id = mongo_descriptor.get("id")
            """ EX:
                    "id": "122"
            """
            if user_descriptor_id == mongo_descriptor_id:
                mongo_added_list = mongo_descriptor[ADDED]
                """ EX:
                        "added": [
                                    {
                                        "by": "A1",
                                        "on": "2019-11-02T08:02:36"
                                    },
                                    {
                                        "by": "A2",
                                        "on": "2019-11-02T08:05:36"
                                    }
                                ]
                """
                # for mongo_addedObj in mongo_added_list:
                #     mongo_added_by = mongo_addedObj.get(ADDED_BY_ID)
                #     if mongo_added_by == user_added_by:
                #         mongo_added_by[ADDED_ON] = use

            mongo_descriptor.append(descriptor)


@APP.route('/articles', methods=['GET'])
def get() -> List[dict]:
    """The method with get request, it returns articles depeneding on the request. 

    """
    args = request.args

    print(args)

    articles_list_output = []
    # data = request.get_json()
    # print(request.values)

    found_articles_cursor = COLLECTION.find()
    for article in found_articles_cursor:
        tmp_dict = {ARTICLE_ID: article[ARTICLE_ID],
                    DESCRIPTORS: article.get(DESCRIPTORS)}

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
    if total_records_to_send:
        try:
            total_records_to_send = int(total_records_to_send)
        except:
            total_records_to_send = total_records_len
    else:
        total_records_to_send = total_records_len

    # return jsonify({'results': articles_list_output[start_record_to_send: start_record_to_send + total_records_to_send]})
    return jsonify(articles_list_output[start_record_to_send: start_record_to_send + total_records_to_send])


@APP.route('/modify', methods=['PUT'])
def put():
    """ The method server for a petitison of put. It receives 

    :return: [description]
    :rtype: [type]
    """
    json_obj = request.json
    article_id = json_obj[ARTICLE_ID]

    descriptors_obj = getDescriptorObj_decsList(json_obj)

    COLLECTION.update_one({ARTICLE_ID: article_id},
                          {"$set": {DESCRIPTORS: descriptors_obj}}
                          )

    return jsonify(descriptors_obj)

    # return jsonify({'message': 'Hello from modify'})


if __name__ == '__main__':
    # APP.run(debug=False, host='0.0.0.0', port='5100')
    APP.run(debug=True, host='0.0.0.0')
