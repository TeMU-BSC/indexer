from collections import Counter
from itertools import combinations
from statistics import mean

from app.api import mongo, mongo_datasets, get_annotators


# CONSTANTS
COLLECTIONS = [
    mongo.db.selected_importants,
    mongo_datasets.db.isciii,
    mongo_datasets.db.reec,
]
SEED_INITIAL_VALUE = 777
DEVELOPMENT_SET_LENGTH = 750
ABSTRACT_MINIMUM_LENGTH = 200


def indexing_results_first_phase():
    '''Phase 1: Indexings'''
    # # Get the data from mongo
    # annotator_ids = get_annotators()
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

    # return



def validation_results_second_phase():
    '''Calculate metrics about annotators, annotations, validations, average
    DeCS codes per document and average document-annotation-per-user elapsed
    times.
    '''
    # PHASE 2: VALIDATION

    # Get the data from mongo
    annotator_ids = get_annotators()
    total_validations = list(mongo.db.validations.find({'user': {'$in': annotator_ids}}, {'_id': 0}))
    total_annotations = list(mongo.db.annotations_validated.find({'user': {'$in': annotator_ids}}, {'_id': 0}))
    validated_total_codes = mongo.db.annotations_validated.count_documents({})

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

    anns = list(mongo.db.annotations_validated.find({}))
    docs = mongo.db.annotations_validated.distinct('doc')
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
    human_annotator_ids = mongo.db.users.distinct('id', {'role': 'annotator', 'id': {'$ne': 'A0'}})
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

    return results

