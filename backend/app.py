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

ABSTRACT = "ab_es"
DECSCODES = "decsCodes"
DESCRIPTORS = "descriptors"
DESCRIPTORS_OBJ = "descriptors_obj"
ADDED_BY_ID = "addedBy"


def getDescriptorObj_decsList(jsonObj) -> (str, List[dict], List[str]):

    added_by_id_id = jsonObj[ADDED_BY_ID]
    descriptors_dict_list = jsonObj[DESCRIPTORS]

    decsCodes = []
    for descriptor in descriptors_dict_list:
        decsCodes.append(descriptor['id'])

    return added_by_id_id, descriptors_dict_list, decsCodes


@APP.route('/articles', methods=['GET'])
def get() -> List[dict] :
    """The method with get request, it returns articles depeneding on the request. 

    """
    args = request.args

    print(args)

    articles_list_output = []
    # data = request.get_json()
    # print(request.values)
    found_articles_cursor = COLLECTION.find()
    for article in found_articles_cursor:
        tmp_dict = {"id": article["_id"],
                    "abstractText": article.get(ABSTRACT),
                    DECSCODES: article.get(DECSCODES),
                    DESCRIPTORS: article.get(DESCRIPTORS)}

        articles_list_output.append(tmp_dict)

    articles_list_sorted = sorted(
        articles_list_output, key=lambda k: (k['id']))
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
    # json_obj = request.json
    # article_id = json_obj['id']

    # added_by, descriptors_obj, decsCodes = getDescriptorObj_decsList(json_obj)

    # key_to_set = str(DESCRIPTORS_OBJ + '.' + added_by)

    # COLLECTION.update_one({"_id": article_id},
    #                       {"$set": {key_to_set: descriptors_obj},
    #                        "$addToSet": {DECSCODES:{"$each":decsCodes}}
    #                       })

    # return {key_to_set:descriptors_obj}

    return jsonify({'message': 'Hello from modify'})


if __name__ == '__main__':
    # APP.run(debug=False, host='0.0.0.0', port='5100')
    APP.run(debug=True, host='0.0.0.0')
