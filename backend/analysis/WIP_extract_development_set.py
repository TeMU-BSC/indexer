from typing import List

from flask import jsonify

from app.api import mongo, mongo_datasets

def reorder_keys(document: dict, desired_order_list: List[str]):
    '''Return the given `document` with its keys reordered following the given
    `desired_order_list`.'''
    return {k: document[k] for k in desired_order_list}



def extract_development_set(strategy: str) -> List[dict]:
    '''Extract randomly 750 documents and its validated DeCS codes, regarding
    the strategy (all|union|intersection).'''
    # select the doc ids for development set
    annotator_ids = get_annotators()
    validations = list(mongo.db.validations.find({'user': {'$in': annotator_ids}}, {'_id': 0}))
    validated_docs = [doc for validation in validations for doc in validation.get('docs')]
    double_validated_docs = [doc_id for doc_id, count in Counter(validated_docs).items() if count == 2]

    # get the decs codes for each document
    double_validated_annotations = list(mongo.db.annotations_validated.find({'doc': {'$in': double_validated_docs}}, {'_id': 0}))
    annotations = defaultdict(list)
    for annotation in double_validated_annotations:
        annotations[annotation.get('doc')].append(annotation.get('decsCode'))

    # prepare the codes depending on the strategy
    chosen_annotations = list()
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

    # get the texts ignoring the ones with short abstracts and anonymize the doc_ids 
    all_docs = get_documents(COLLECTIONS)
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

    return jsonify(development_set)
