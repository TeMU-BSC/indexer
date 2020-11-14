import random
import string

from lorem_text import lorem

sources = ['ibecs', 'lilacs', 'portal fis', 'reec', 'google patents']
types = ['article', 'health research project', 'clinical study', 'patent']


def id_generator(size=6, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))


def doc_generator():
    return dict(
        id=id_generator(),
        title=lorem.words(random.randint(7, 13)),
        abstract=lorem.paragraph(random.randint(1, 3)),
        source=random.choice(sources),
        type=random.choice(types),
    )
