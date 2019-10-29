"""[summary]
"""
from flask import Flask
from flask import jsonify
from flask import request
from flask_pymongo import PyMongo

#MongoDB constants variable
DB_NAME = 'BvSalud'
MONOG_URI = 'mongodb://localhost:27017/'+ DB_NAME


#APP Flask
APP = Flask(__name__)
APP.config['MONGO_DBNAME'] = DB_NAME
APP.config['MONGO_URI'] = MONOG_URI
MONGO = PyMongo(APP)



ABSTRACT = "ab_es"
DECSCODES = "decsCodes"
DECSCODES_ANNOTATOR = "decsCodes_Annotator"


@APP.route('/articles', methods=['GET'])
def get():
    """The method with get request, it returns articles depeneding on the request. 

    """
    args = request.args

    print(args)

    articles_list_output = []
    # data = request.get_json()
    # print(request.values)
    found_articles_cursor = MONGO.db.selected_importants.find()
    for article in found_articles_cursor:
        tmp_dict = {"id":article["_id"],
                    "abstractText":article.get(ABSTRACT),
                    "decsCodes":article.get(DECSCODES),
                    "decsCodes_Annotator":article.get(DECSCODES_ANNOTATOR)}

        articles_list_output.append(tmp_dict)

    articles_list_sorted = sorted(articles_list_output, key = lambda k:(k['id']))
    total_records_len = len(articles_list_sorted)

    start_record_to_send = args.get('start');
    total_records_to_send = args.get('total');

    if start_record_to_send: #If in the request send me arguments with start position, other wise it will be 0
        try:
            start_record_to_send = int(start_record_to_send)
        except:
            start_record_to_send = 0
    else:
        start_record_to_send = 0

    if total_records_to_send: #If in the request send me total records lenth after start position, other wise it will be total length of articles (in this cas
        try:
            total_records_to_send = int(total_records_to_send)
        except:
            total_records_to_send = total_records_len
    else:
        total_records_to_send = total_records_len


    return jsonify({'results':articles_list_output[start_record_to_send : start_record_to_send + total_records_to_send]})


@APP.route('/modify', methods=['PUT'])
def update_article():
    json_obj = request.json


    return jsonify({'done':json_obj})
    
    # id = json_obj['id']http://84.88.188.74:5000/modify
    
    # MONGO.db.selected_importants.update_one({"_id":id},
    # {'$set':
    # {"decsCodes":json_obj["decsCodes"],
    # "decsCodes_Annotator":json_obj["decsCodes_Annotator"]}
    # })



if __name__ == '__main__':
    APP.run(debug=True,host='0.0.0.0')

