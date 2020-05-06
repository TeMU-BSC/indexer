'''
Author: alejandro.asensio@bsc.es

In this module there are some helper functions for the API and for the TESTS.
'''

from typing import List


def map_sources(dataset: List[dict], sources: List[dict]) -> List[dict]:
    '''Return the mappings between document identifiers in dataset and the
    source (if found) from which they came.'''
    pass


def has_no_duplicates(dataset: List[dict]) -> bool:
    '''Return true if there is no duplicate documents in dataset; return false
    otherwise.'''
    # compare both title and abstract
    titles = [document.get('title') for document in dataset]
    abstracts = [document.get('abstractText') for document in dataset]

    return len(dataset) == len(set(titles)) and len(dataset) == len(set(abstracts))


def is_not_present_in(dataset: List[dict],
                      checking_datasets: List[List[dict]]) -> bool:
    '''Return true if any document in dataset is not present in any of
    checking datasets; return false otherwise.'''
    # compare both title and abstract
    titles = [document.get('title') for document in dataset]
    abstracts = [document.get('abstractText') for document in dataset]

    not_presences = [cd for cd in checking_datasets if len(
        cd) == len(set(titles)) and len(cd) == len(set(abstracts))]
    
    return all(not_presences)

