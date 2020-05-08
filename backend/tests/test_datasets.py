'''
Author: alejandro.asensio@bsc.es

In this module there are some sanity check tests against the extracted datasets.
'''

import json
import os

import pytest

import helpers


PREFIX = 'mesinesp'
DIR = '/home/alejandro/Documents/mesinesp/corregidos'

# load datasets
with open('/home/alejandro/Documents/mesinesp/published/MESINESP_ORIGINAL_TRAINING.json') as f:
    training_original = json.load(f).get('articles')

with open('/home/alejandro/Documents/mesinesp/published/MESINESP_PREPROCESSED_TRAINING.json') as f:
    training_preprocessed = json.load(f).get('articles')

with open(os.path.join(DIR, 'mesinesp-development-set-official-union.json')) as f:
    development_official = json.load(f).get('articles')

with open(os.path.join(DIR, 'mesinesp-development-set-core-descriptors-intersection.json')) as f:
    development_coredescriptors = json.load(f).get('articles')

with open(os.path.join(DIR, 'mesinesp-test-set-without-annotations.json')) as f:
    test_without_annotations = json.load(f).get('articles')

with open(os.path.join(DIR, 'mesinesp-test-set-with-annotations.json')) as f:
    test_with_annotations = json.load(f).get('articles')

with open(os.path.join(DIR, 'mesinesp-background-set-PENDING_APPROVAL.json')) as f:
    background = json.load(f).get('articles')


# def test_training_set():
#     # original
#     # expected fail on prefixed ids
#     prefixed_ids = [document.get('id').startswith(PREFIX)
#                     for document in training_original]
#     assert not all(prefixed_ids)

#     # preprocessed
#     # expected fail on prefixed ids
#     prefixed_ids = [document.get('id').startswith(PREFIX)
#                     for document in training_preprocessed]
#     assert not all(prefixed_ids)


def test_development_set():
    # official
    assert helpers.has_no_duplicates(development_official)
    assert helpers.is_not_present_in(development_official, [
        training_original,
        training_preprocessed,
    ])

    # coredescriptors
    assert helpers.has_no_duplicates(development_coredescriptors)
    assert helpers.is_not_present_in(development_coredescriptors, [
        training_original,
        training_preprocessed,
    ])


def test_test_set():
    # with annotations
    assert helpers.has_no_duplicates(test_with_annotations)
    assert helpers.is_not_present_in(test_with_annotations, [
        training_original,
        training_preprocessed,
        development_official,
        development_coredescriptors
    ])

    # without annotations
    assert helpers.has_no_annotations(test_without_annotations)
    assert helpers.has_no_duplicates(test_without_annotations)
    assert helpers.is_not_present_in(test_without_annotations, [
        training_original,
        training_preprocessed,
        development_official,
        development_coredescriptors
    ])


def test_background_set():
    assert helpers.has_no_duplicates(background)
    assert helpers.is_not_present_in(background, [
        training_original,
        training_preprocessed,
        development_official,
        development_coredescriptors,
        test_without_annotations,
        test_with_annotations,
    ])


def _test_evaluation_set():
    # evaluation = test without annotations + all background -> shuffled
    pass
