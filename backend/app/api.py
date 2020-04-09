'''
Backend REST API to handle connections to MongoDB for the MESINESP task.

Author: alejandro.asensio@bsc.es
'''

from bson.objectid import ObjectId
from collections import Counter, defaultdict
import csv
from datetime import datetime
from itertools import combinations
import json
from os import environ
import random
import re
from statistics import mean

from flask import Flask, jsonify, request
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_pymongo import PyMongo
from pymongo.errors import BulkWriteError, DuplicateKeyError

from app import app

app.config['JSON_AS_ASCII'] = False
app.config['MONGO_URI'] = environ.get('MONGO_URI')
bcrypt = Bcrypt(app)
mongo = PyMongo(app)
CORS(app)

SEED_INITIAL_VALUE = 777
DEVELOPMENT_SET_LENGTH = 750
ABSTRACT_MINIMUM_LENGTH = 200

@app.route('/hello')
def hello():
    return f"Hello from Flask by Alejandro. ENV={environ.get('ENV')} FLASK_ENV={environ.get('FLASK_ENV')} MONGO_URI={environ.get('MONGO_URI')}"


@app.route('/user/register', methods=['POST'])
def register_users():
    '''Register many users. Try to insert many new users, except BulkWriteError occurs.'''
    users = request.json
    try:
        result = mongo.db.users.insert_many(users)
        success = result.acknowledged
        message = None
        registered_users_cursor = mongo.db.users.find({'_id': {'$in': result.inserted_ids}}, {'_id': 0})
        registered_users = len([user for user in registered_users_cursor])
    except BulkWriteError as error:
        success = False
        message = error.details['writeErrors'][0]['errmsg']
        registered_users = 0
    return jsonify({'success': success, 'message': message, 'registeredUsers': registered_users})


@app.route('/user/login', methods=['POST'])
def login():
    '''Check if the given email and password match the ones for that user in database.'''
    user = request.json
    result = {'sucess': False, 'user': None, 'message': 'Invalid user and/or password'}
    found_user = mongo.db.users.find_one({'email': user['email'], 'password': user['password']}, {'_id': 0, 'password': 0})
    if found_user:
        result = {'sucess': True, 'user': found_user, 'message': None}
    return jsonify(result)


# [Encrypt approach]
@app.route('/user/login_encrypt', methods=['POST'])
def login_encrypt():
    '''Check if the given email and password match that user and its encrypted password in database.'''
    user = request.json
    result = {'sucess': False, 'user': None, 'message': 'User not found'}
    found_user = mongo.db.users.find_one({'email': user['email']}, {'_id': 0})
    if found_user:
        if bcrypt.check_password_hash(found_user['password'], user['password']):
            result = {'sucess': True, 'user': found_user, 'message': None}
        else:
            result['message'] = 'Invalid password'
    return jsonify(result)


@app.route('/users', methods=['GET'])
def get_users():
    return jsonify([user for user in mongo.db.users.find({}, {'_id': 0})])


@app.route('/docs', methods=['GET'])
def get_docs():
    return jsonify([doc for doc in mongo.db.selected_importants.find({})])


@app.route('/doc/<id>', methods=['GET'])
def get_doc(id):
    '''Get the document by the given id.'''
    doc = mongo.db.selected_importants.find_one({'_id': id})
    return jsonify({'id': doc['_id'], 'title': doc['ti_es'], 'abstract': doc['ab_es']})


@app.route('/assignment/add', methods=['POST'])
def assign_docs_to_users():
    '''Add some documents IDs to the user key in the 'assignments' collection.'''
    assignments = request.json
    results = list()
    for assignment in assignments:
        for doc in assignment['docs']:
            result = mongo.db.assignments.update_one(
                {'user': assignment['user']},
                {'$push': {'docs': doc}},
                upsert=True
            )
            results.append(result.acknowledged)
    success = all(results)
    return jsonify({'success': success})



@app.route('/assignment/get', methods=['POST'])
def get_assigned_docs():
    '''Find the assigned docs IDs to the current user, and then retrieving
    the needed doc data from the 'selected_importants' collection.'''
    user = request.json['user']
    found_user = mongo.db.assignments.find_one({'user': user})
    assigned_doc_ids = []
    if found_user:
        assigned_doc_ids = found_user.get('docs')

    selected_importants = [doc for doc in mongo.db.selected_importants.find({'_id': {'$in': assigned_doc_ids}})]
    reec_clinical_cases = [doc for doc in mongo.db.reecClinicalCases.find({'_id': {'$in': assigned_doc_ids}})]
    isciii_projects = [doc for doc in mongo.db.isciiiProjects.find({'_id': {'$in': assigned_doc_ids}})]
    docs = selected_importants + reec_clinical_cases + isciii_projects

    result = []
    for doc in docs:
        # Find the decsCodes added by the current user
        decs_codes = mongo.db.annotations.distinct('decsCode', {'doc': doc['_id'], 'user': user})
        # Get the validated decs codes
        validated_decs_codes = mongo.db.annotationsValidated.distinct('decsCode', {'user': user, 'doc': doc['_id']})
        # Check if this doc has been marked as completed by the current user
        completed = False
        user_completions = mongo.db.completions.find_one({'user': user})
        if user_completions:
            completed = doc['_id'] in user_completions.get('docs')
        # Check if this doc has been marked as validated by the current user
        validated = False
        user_validations = mongo.db.validations.find_one({'user': user})
        if user_validations:
            validated = doc['_id'] in user_validations.get('docs')
        # Prepare the relevant info to be returned
        doc_relevant_info = {
            'id': doc['_id'],
            'title': doc['ti_es'],
            'abstract': doc['ab_es'],
            'decsCodes': decs_codes,
            'validatedDecsCodes': validated_decs_codes,
            'completed': completed,
            'validated': validated
        }
        result.append(doc_relevant_info)
    return jsonify(result)


@app.route('/annotation/add', methods=['POST'])
def add_annotation():
    '''Add a newannotation to the 'annotations' collection. Use 'replace_one'
    instead of 'insert_one' to avoid repeated annotations by the same user
    logged at the same time in different browsers.'''
    annotation = request.json
    result = mongo.db.annotations.replace_one(annotation, annotation, upsert=True)
    return jsonify({'success': result.acknowledged})


@app.route('/annotation/remove', methods=['POST'])
def remove_annotation():
    '''Remove an existing annotation from the 'annotations' collection.'''
    annotation = request.json
    result = mongo.db.annotations.delete_one(annotation)
    return jsonify({'deletedCount': result.deleted_count})


@app.route('/annotations_validated/add', methods=['POST'])
def add_validated_annotations():
    '''Add some annotations validated by the user after comparing with suggestions from other users.'''
    validated_annotations = request.json
    result = mongo.db.annotationsValidated.insert_many(validated_annotations)
    return jsonify({'success': result.acknowledged})


@app.route('/annotations_validated/get', methods=['POST'])
def get_validated_annotations():
    '''Get the validated annotations by a given user for a given document.'''
    obj = request.json
    validated_decs_codes = mongo.db.annotationsValidated.distinct('decsCode', {'user': obj['user'], 'doc': obj['doc']})
    return jsonify({'validatedDecsCodes': list(validated_decs_codes)})


@app.route('/suggestions', methods=['POST'])
def get_suggestions():
    '''Get the decs codes for a specific document from other annotators that
    have marked as completed that same document.'''
    post = request.json
    other_users = mongo.db.completions.distinct('user', {'docs': post['doc'], 'user': {'$ne': post['user']}})
    other_users.append('A0')
    suggestions = mongo.db.annotations.distinct('decsCode', {'doc': post['doc'], 'user': {'$in': other_users}})
    return jsonify({'suggestions': suggestions})

    # search machine suggestions on the fly
    # decs = [d for d in mongo.db.decs.find({}, {'_id': 0})]
    # doc = mongo.db.seleced_importants.find_one({'_id': post['doc']})
    # for d in decs:
    #     string_match = re.findall(d['termSpanish'], doc['ab_es'])
    #     synonyms = re.findall(r'(?<=\|)?[^|]+(?=\|)?', d['synonyms'])
    #     for s in synonyms:
    #         print(s)
    #         # save the term
    # # get machine_suggestions
    # all_suggestions = list(community_suggestions) + automatic_suggestions
    # return jsonify({'suggestions': all_suggestions})


@app.route('/load_machine_suggestions', methods=['POST'])
def load_machine_suggestions():
    '''Load suggestions generated by a script.'''
    post = request.json
    with open('data/suggestions_mesinesp.tsv') as csvfile:
        reader = csv.DictReader(csvfile, dialect=csv.excel_tab)
        for row in reader:
            annotation = {'user': post['user'], 'doc': row['doc_id'], 'decsCode': row['decs_code']}
            mongo.db.annotations.replace_one(annotation, annotation, upsert=True)
    return jsonify({'success': True})


@app.route('/mark_doc_as/<status>', methods=['POST'])
def mark_doc_as(status):
    '''Add a new doc into the 'docs' key in the 'completions' collection.'''
    doc_to_mark = request.json
    result = None
    if status == 'completed':
        result = mongo.db.completions.update_one(
            {'user': doc_to_mark['user']},
            {'$push': {'docs': request.json['doc']}},
            upsert=True
        )
    if status == 'uncompleted':
        result = mongo.db.completions.update_one(
            {'user': doc_to_mark['user']},
            {'$pull': {'docs': doc_to_mark['doc']}}
        )
    if status == 'validated':
        result = mongo.db.validations.update_one(
            {'user': doc_to_mark['user']},
            {'$push': {'docs': request.json['doc']}},
            upsert=True
        )
    if status == 'unvalidated':
        result = mongo.db.validations.update_one(
            {'user': doc_to_mark['user']},
            {'$pull': {'docs': doc_to_mark['doc']}}
        )
    return jsonify({'success': result.acknowledged})


@app.route('/results', methods=['GET'])
def get_results():
    '''Calculate many metrics about annotators, annotations, validations,
    average DeCS codes per document and average elapsed times.
    '''
    # # PHASE 1: ANNOTATION

    # # Get the data from mongo
    # annotator_ids = list(mongo.db.users.distinct('id', {'role': 'annotator'}))
    # total_completions = list(mongo.db.completions.find({'user': {'$in': annotator_ids}}, {'_id': 0}))
    # total_annotations = list(mongo.db.annotations.find({'user': {'$in': annotator_ids}}, {'_id': 0}))
    # completed_total_codes = mongo.db.annotations.count_documents({})

    # # Get the completed docs set
    # docs_ids_nested = [completion.get('docs') for completion in total_completions]
    # completed_docs_ids_flatten = [doc for user_docs in docs_ids_nested for doc in user_docs]
    # completed_docs_ids_set = set(completed_docs_ids_flatten)

    # # Init storing variables
    # completed_annotations = {'perDoc': list(), 'perUser': list()}
    # completed_metrics = {'perDoc': list(), 'perUserPair': list(), 'perUser': list()}

    # # Annotations per doc
    # for doc in completed_docs_ids_set:
    #     doc_users = [completion.get('user') for completion in total_completions if doc in completion.get('docs')]
    #     users = list()
    #     for user in doc_users:
    #         decs_codes = [annotation.get('decsCode') for annotation in total_annotations if user == annotation.get('user') and doc == annotation.get('doc')]
    #         user = {'user': user, 'decsCodes': decs_codes}
    #         users.append(user)
    #     doc_annotations = {'doc': doc, 'annotations': users}
    #     # annotations['perDoc'].append(doc_annotations)
    #     if len(users) >= 2:
    #         completed_annotations['perDoc'].append(doc_annotations)

    # # Metrics per doc
    # for doc in completed_annotations.get('perDoc'):
    #     decs_codes_list = [ann.get('decsCodes') for ann in doc.get('annotations')]
    #     # Make combinations and the mean of them in case there are more than 2 annotators per document
    #     partials = list()
    #     for comb in combinations(decs_codes_list, 2):
    #         first_decs = comb[0]
    #         second_decs = comb[1]
    #         intersection = set(first_decs).intersection(second_decs)
    #         union = set(first_decs).union(second_decs)
    #         partial = len(intersection) / len(union)
    #         partials.append(partial)
    #     doc_metric = {'doc': doc.get('doc'), 'annotatorCount': len(doc.get('annotations')), 'correlation': mean(partials)}
    #     completed_metrics['perDoc'].append(doc_metric)

    # # Annotations per user
    # for completion in total_completions:
    #     user = completion.get('user')
    #     docs = list()
    #     for completed_doc in completion.get('docs'):
    #         decs_codes = [annotation.get('decsCode') for annotation in total_annotations if annotation.get('user') == user and annotation.get('doc') == completed_doc]
    #         doc = {'doc': completed_doc, 'decsCodes': decs_codes}
    #         docs.append(doc)
    #     user_annotations = {'user': user, 'annotations': docs}
    #     completed_annotations['perUser'].append(user_annotations)

    # # Metrics per user pair

    # # Find the common docs annotated by each pair of users
    # for pair in combinations(annotator_ids, 2):
    #     first_annotator_id = pair[0]
    #     second_annotator_id = pair[1]
    #     first_annotations = [annotation for ann in completed_annotations.get('perUser') if ann.get('user') == first_annotator_id for annotation in ann.get('annotations')]
    #     second_annotations = [annotation for ann in completed_annotations.get('perUser') if ann.get('user') == second_annotator_id for annotation in ann.get('annotations')]
    #     first_docs = [ann.get('doc') for ann in first_annotations]
    #     second_docs = [ann.get('doc') for ann in second_annotations]
    #     common_docs = set(first_docs).intersection(second_docs)

    #     # Calculate the correlation of DeCS codes for each common doc between that pair of users
    #     docs_metrics = list()
    #     for doc in common_docs:
    #         for ann in first_annotations:
    #             if ann.get('doc') == doc:
    #                 first_decs = ann.get('decsCodes')
    #         for ann in second_annotations:
    #             if ann.get('doc') == doc:
    #                 second_decs = ann.get('decsCodes')
    #         intersection = set(first_decs).intersection(second_decs)
    #         union = set(first_decs).union(second_decs)
    #         correlation = len(intersection) / len(union)
    #         docs_metrics.append({'doc': doc, 'correlation': correlation})

    #     correlations = [metric.get('correlation') for metric in docs_metrics]
    #     score = 0
    #     if correlations:
    #         score = mean(correlations)
    #     completed_metrics['perUserPair'].append({'annotatorPair': list(pair), 'metrics': docs_metrics, 'averageScore': score})
    
    # # Finally, for each annotator, calculate its weighted mean of the correlations with the rest of annotators
    # for id in annotator_ids:
    #     scores = list()
    #     amounts = list()
    #     for pair_metric in completed_metrics.get('perUserPair'):
    #         if id in pair_metric.get('annotatorPair'):
    #             scores.append(pair_metric.get('averageScore'))
    #             amounts.append(len(pair_metric.get('metrics')))
    #     try:
    #         weighted_average = sum(x * y for x, y in zip(scores, amounts)) / sum(amounts)
    #     except ZeroDivisionError:
    #         weighted_average = 0
    #     completed_metrics['perUser'].append({'user': id, 'annotatorScore': weighted_average})
    
    # PHASE 2: VALIDATION

    # Get the data from mongo
    annotator_ids = list(mongo.db.users.distinct('id', {'role': 'annotator'}))
    total_validations = list(mongo.db.validations.find({'user': {'$in': annotator_ids}}, {'_id': 0}))
    total_annotations = list(mongo.db.annotationsValidated.find({'user': {'$in': annotator_ids}}, {'_id': 0}))
    validated_total_codes = mongo.db.annotationsValidated.count_documents({})

    # Get the completed docs set
    docs_ids_nested = [validation.get('docs') for validation in total_validations]
    validated_docs_ids_flatten = [doc for user_docs in docs_ids_nested for doc in user_docs]
    validated_docs_ids_set = set(validated_docs_ids_flatten)

    # Init storing variables
    validated_annotations = {'perDoc': list(), 'perUser': list()}
    validated_metrics = {'perDoc': list(), 'perUserPair': list(), 'perUser': list()}

    # Annotations per doc
    for doc in validated_docs_ids_set:
        doc_users = [validation.get('user') for validation in total_validations if doc in validation.get('docs')]
        users = list()
        for user in doc_users:
            decs_codes = [annotation.get('decsCode') for annotation in total_annotations if user == annotation.get('user') and doc == annotation.get('doc')]
            user = {'user': user, 'decsCodes': decs_codes}
            users.append(user)
        doc_annotations = {'doc': doc, 'annotations': users}
        # annotations['perDoc'].append(doc_annotations)
        if len(users) >= 2:
            validated_annotations['perDoc'].append(doc_annotations)

    # Metrics per doc
    for doc in validated_annotations.get('perDoc'):
        decs_codes_list = [ann.get('decsCodes') for ann in doc.get('annotations')]
        # Make combinations and the mean of them in case there are more than 2 annotators per document
        partials = list()
        for comb in combinations(decs_codes_list, 2):
            first_decs = comb[0]
            second_decs = comb[1]
            intersection = set(first_decs).intersection(second_decs)
            union = set(first_decs).union(second_decs)
            partial = len(intersection) / len(union)
            partials.append(partial)
        doc_metric = {'doc': doc.get('doc'), 'annotatorCount': len(doc.get('annotations')), 'correlation': mean(partials)}
        validated_metrics['perDoc'].append(doc_metric)

    # Annotations per user
    for validation in total_validations:
        user = validation.get('user')
        docs = list()
        for completed_doc in validation.get('docs'):
            decs_codes = [annotation.get('decsCode') for annotation in total_annotations if annotation.get('user') == user and annotation.get('doc') == completed_doc]
            doc = {'doc': completed_doc, 'decsCodes': decs_codes}
            docs.append(doc)
        user_annotations = {'user': user, 'annotations': docs}
        validated_annotations['perUser'].append(user_annotations)

    # Metrics per user pair

    # Find the common docs annotated by each pair of users
    for pair in combinations(annotator_ids, 2):
        first_annotator_id = pair[0]
        second_annotator_id = pair[1]
        first_annotations = [annotation for ann in validated_annotations.get('perUser') if ann.get('user') == first_annotator_id for annotation in ann.get('annotations')]
        second_annotations = [annotation for ann in validated_annotations.get('perUser') if ann.get('user') == second_annotator_id for annotation in ann.get('annotations')]
        first_docs = [ann.get('doc') for ann in first_annotations]
        second_docs = [ann.get('doc') for ann in second_annotations]
        common_docs = set(first_docs).intersection(second_docs)

        # Calculate the correlation of DeCS codes for each common doc between that pair of users
        docs_metrics = list()
        for doc in common_docs:
            for ann in first_annotations:
                if ann.get('doc') == doc:
                    first_decs = ann.get('decsCodes')
            for ann in second_annotations:
                if ann.get('doc') == doc:
                    second_decs = ann.get('decsCodes')
            intersection = set(first_decs).intersection(second_decs)
            union = set(first_decs).union(second_decs)
            correlation = len(intersection) / len(union)
            docs_metrics.append({'doc': doc, 'correlation': correlation})

        correlations = [metric.get('correlation') for metric in docs_metrics]
        score = 0
        if correlations:
            score = mean(correlations)
        validated_metrics['perUserPair'].append({'annotatorPair': list(pair), 'metrics': docs_metrics, 'averageScore': score})
    
    # Finally, for each annotator, calculate its weighted mean of the correlations with the rest of annotators
    for id in annotator_ids:
        scores = list()
        amounts = list()
        for pair_metric in validated_metrics.get('perUserPair'):
            if id in pair_metric.get('annotatorPair'):
                scores.append(pair_metric.get('averageScore'))
                amounts.append(len(pair_metric.get('metrics')))
        try:
            weighted_average = sum(x * y for x, y in zip(scores, amounts)) / sum(amounts)
        except ZeroDivisionError:
            weighted_average = 0
        validated_metrics['perUser'].append({'user': id, 'annotatorScore': weighted_average})
    
    # Average number of codes per document
    codes_by_higher_iaa = list()
    codes_by_intersection = list()
    codes_by_union = list()

    anns = list(mongo.db.annotationsValidated.find({}))
    docs = mongo.db.annotationsValidated.distinct('doc')
    users_with_higher_iaa = list()
    for doc in docs:
        doc_anns = [ann for ann in anns if ann['doc'] == doc]

        # separate by user
        users = list(set([doc_ann['user'] for doc_ann in doc_anns]))
        if len(users) == 1:
            continue
        u1 = users[0]
        u2 = users[1]
        u1_codes = list()
        u2_codes = list()
        for doc_ann in doc_anns:
            (u1_codes if doc_ann['user'] == u1 else u2_codes).append(doc_ann['decsCode'])
        for element in validated_metrics['perUser']:
            if element['user'] == u1:
                u1_iaa = element['annotatorScore']
            if element['user'] == u2:
                u2_iaa = element['annotatorScore']
        if u1_iaa >= u2_iaa:
            users_with_higher_iaa.append(u1)
            chosen_codes = u1_codes
        else:
            users_with_higher_iaa.append(u2)
            chosen_codes = u2_codes
        codes_by_higher_iaa.append(len(chosen_codes))
        codes_by_intersection.append(len(set(u1_codes).intersection(u2_codes)))
        codes_by_union.append(len(set(u1_codes).union(u2_codes)))
    user_representativeness = {k: v / len(users_with_higher_iaa) for k, v in Counter(users_with_higher_iaa).items()}

    # AVERAGE ELAPSED TIMES
    human_annotator_ids = list(mongo.db.users.distinct('id', {'role': 'annotator', 'id': {'$ne': 'A0'}}))
    sorted_annotations = list(mongo.db.annotations.find({}).sort([('_id', 1)]))
    times_stats = list()
    MINUTES_LIMIT = 60
    for user_id in human_annotator_ids:
        user_times = list()
        completed_docs = list(mongo.db.completions.find_one({'user': user_id})['docs'])
        user_annotations = [ann for ann in sorted_annotations if ann['user'] == user_id]
        first_time = user_annotations[0]['_id'].generation_time
        last_time = user_annotations[-1]['_id'].generation_time
        elapsed_days = (last_time - first_time).days
        for doc in completed_docs:
            doc_annotations = [ann for ann in sorted_annotations if ann['user'] == user_id and ann['doc'] == doc]
            first_ann_time = doc_annotations[0]['_id'].generation_time
            last_ann_time = doc_annotations[-1]['_id'].generation_time
            elapsed_ann_time = last_ann_time - first_ann_time
            elapsed_minutes = elapsed_ann_time.total_seconds() // 60  # datetime.timedelta instance
            if elapsed_minutes < MINUTES_LIMIT:
                user_times.append(int(elapsed_minutes))
        # print(user_id, user_times)
        avg_minutes_per_doc = mean(user_times)
        times_stats.append({
            'annotator': user_id,
            'numberOfCompletedDocs': len(completed_docs),
            'firstAnnotationOn': first_time,
            'lastAnnotationOn': last_time,
            'elapsedDays': elapsed_days,
            f'avgMinutesPerDocIgnoringPausesOfMoreThan{MINUTES_LIMIT}Minutes': avg_minutes_per_doc,
        })
    
    # RESULTS OBJECT
    results = {
        'codesCount': {
            'total': {
                # 'annotated': completed_total_codes,
                'validated': validated_total_codes,
            },
            'averagePerDocument': {
                'annotated': None,
                'validated': {
                    'byUserWithHigherIAA': mean(codes_by_higher_iaa),
                    'UserRepresentativenessByHigherIAA': user_representativeness,
                    'byIntersection': mean(codes_by_intersection),
                    'byUnion': mean(codes_by_union),
                }
            }
        },
        'documentCount': {
            # 'annotated': {
            #     'total': len(completed_docs_ids_flatten),
            #     'unique': len(completed_docs_ids_set),
            #     'once': len(completed_docs_ids_flatten) - len(completed_annotations['perDoc']),
            #     'twice': len(completed_annotations['perDoc']),
            # },
            'validated': {
                'total': len(validated_docs_ids_flatten),
                'unique': len(validated_docs_ids_set),
                'once': len(validated_docs_ids_flatten) - len(validated_annotations['perDoc']),
                'twice': len(validated_annotations['perDoc']),
            },
        },
        'data': {
            # 'annotated': {
            #     'annotations': completed_annotations,
            #     'metrics': completed_metrics
            # },
            'validated': {
                'annotations': validated_annotations,
                'metrics': validated_metrics
            }
        },
        'times': times_stats
    }
    return jsonify(results)


@app.route('/extract_development_set/<strategy>', methods=['GET'])
def extract_development_set(strategy):
    '''Extract randomly 750 docuemnts and its validated DeCS codes, regarding
    the strategy (union or intersection).'''
    # select the doc ids for development set
    annotator_ids = list(mongo.db.users.distinct('id', {'role': 'annotator'}))
    validations = list(mongo.db.validations.find({'user': {'$in': annotator_ids}}, {'_id': 0}))
    validated_docs = [doc for validation in validations for doc in validation.get('docs')]
    double_validated_docs = [doc_id for doc_id, count in Counter(validated_docs).items() if count == 2]

    # get the decs codes for each document
    double_validated_annotations = list(mongo.db.annotationsValidated.find({'doc': {'$in': double_validated_docs}}, {'_id': 0}))
    annotations = defaultdict(list)
    for annotation in double_validated_annotations:
        annotations[annotation.get('doc')].append(annotation.get('decsCode'))

    # prepare the codes depending on the strategy
    chosen_annotations = list()
    macro_common = 0
    macro_unique = 0
    micro_accumulate = list()
    for doc, codes in annotations.items():
        unique = set(codes)
        selected_codes = list()
        if strategy == 'all':
            selected_codes = codes
        if strategy == 'union':
            selected_codes = list(unique)
        if strategy == 'intersection':
            selected_codes = [code for code, count in Counter(codes).items() if count == 2]
        chosen_annotations.append({'doc': doc, 'codes': selected_codes})
        # calculate the agreement
        common = 0
        for count in Counter(codes).values():
            if count == 2:
                common += 1
                macro_common += 1
        micro_accumulate.append(common / len(unique))
        macro_unique += len(unique)

    # show the agreement on the flask console output
    macro = macro_common / macro_unique
    micro = mean(micro_accumulate)
    print('macro:', macro)
    print('micro:', micro)

    # get the texts ignoring the ones with short abstracts and anonymize the doc_ids 
    selected_importants = list(mongo.db.selected_importants.find({}))
    reec_clinical_cases = list(mongo.db.reecClinicalCases.find({}))
    isciii_projects = list(mongo.db.isciiiProjects.find({}))
    all_docs = selected_importants + reec_clinical_cases + isciii_projects
    random.seed(SEED_INITIAL_VALUE)
    development_set = list()
    for n in range(1, DEVELOPMENT_SET_LENGTH + 1):
        while True:    
            choice = random.choice(chosen_annotations)
            chosen_annotations.remove(choice)
            for doc in all_docs:
                if doc.get('_id') == choice.get('doc'):
                    title = doc.get('ti_es')
                    abstract = doc.get('ab_es')
                    journal = doc.get('ta')[0] if doc.get('ta') else None
                    db = doc.get('db')
                    year = doc.get('entry_date').year if doc.get('entry_date') else None
            if len(abstract) >= ABSTRACT_MINIMUM_LENGTH:
                break
        development_set.append({
            'id': f'mesinesp-dev-{n:0{len(str(DEVELOPMENT_SET_LENGTH))}}',
            'title': title,
            'abstractText': abstract,
            'journal': journal,
            'db': db,
            'year': year,
            'decsCodes': choice.get('codes')
        })

    return jsonify({'articles': development_set})
