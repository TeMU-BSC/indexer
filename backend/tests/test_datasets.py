'''
Author: alejandro.asensio@bsc.es

In this module there are some sanity check tests against the extracted datasets.
'''

import json

import pytest

import helpers


PREFIX = 'mesinesp'

# load datasets
with open('/home/alejandro/Documents/mesinesp/MESINESP_ORIGINAL_TRAINING.json') as f:
    training_original = json.load(f).get('articles')

with open('/home/alejandro/Documents/mesinesp/MESINESP_PREPROCESSED_TRAINING.json') as f:
    training_preprocessed = json.load(f).get('articles')

with open('/home/alejandro/Documents/mesinesp/mesinesp-development-set-official-union.json') as f:
    development_official = json.load(f).get('articles')

with open('/home/alejandro/Documents/mesinesp/mesinesp-development-set-core-descriptors-intersection.json') as f:
    development_coredescriptors = json.load(f).get('articles')

with open('/home/alejandro/Documents/mesinesp/mesinesp-test-set-without-annotations.json') as f:
    test_without_annotations = json.load(f).get('articles')

# with open('/home/alejandro/Documents/mesinesp/mesinesp-test-set-with-annotations.json') as f:
#     test_with_annotations = json.load(f).get('articles')

with open('/home/alejandro/Documents/mesinesp/mesinesp-background-set.json') as f:
    # background = json.load(f).get('articles')
    background = json.load(f)

with open('/home/alejandro/Documents/mesinesp/mesinesp-background-subset-2019.json') as f:
    # background_2019 = json.load(f).get('articles')
    background_2019 = json.load(f)


def test_training_set():
    # original
    # expected fail on prefixed ids
    prefixed_ids = [document.get('id').startswith(PREFIX)
                    for document in training_original]
    assert not all(prefixed_ids)

    # preprocessed
    # expected fail on prefixed ids
    prefixed_ids = [document.get('id').startswith(PREFIX)
                    for document in training_preprocessed]
    assert not all(prefixed_ids)


def _test_development_set():
    # official
    # coredescriptors
    pass


def test_test_set():
    # with annotations
    # with open('/home/alejandro/Documents/mesinesp/mesinesp-test-set-with-annotations.json') as f:
    #     documents = json.load(f).get('articles')

    # without annotations
    assert helpers.has_no_duplicates(test_without_annotations)

    checking_datasets = [training_original, training_preprocessed,
                         development_official, development_coredescriptors]
    assert helpers.is_not_present_in(
        test_without_annotations, checking_datasets)


def test_background_set():
    # literature (ibecs/lilacs)
    # isciii-fis
    # reec

    # all
    # assert helpers.has_no_duplicates(background)

    # checking_datasets = [training_original, training_preprocessed,
    #                      development_official, development_coredescriptors,
    #                      test_without_annotations]
    # assert helpers.is_not_present_in(
    #     background, checking_datasets)
    
    # 2019
    # assert helpers.has_no_duplicates(background_2019)

    checking_datasets = [training_original, training_preprocessed,
                         development_official, development_coredescriptors,
                         test_without_annotations]
    assert helpers.is_not_present_in(
        background_2019, checking_datasets)


def _test_evaluation_set():
    # evaluation = test without annotations + all background -> shuffled
    pass
