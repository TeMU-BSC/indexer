# Indexer web tool

Assign controlled labels to different types of documents, mainly in Spanish language.

Supported labels:

* [DeCS](https://decs.bvsalud.org/es/) (Descriptores en Ciencias de la Salud), analog Spanish version of English MeSH terms
* [HPO](https://hpo.jax.org/) (Human Phenotype Ontology) _(future feature)_

Supported types of documents:

* Scientific articles from [IBECS](https://ibecs.isciii.es/) (Índice Bibliográfico Español en Ciencias de la Salud)
* Scientific articles from [LILACS](https://lilacs.bvsalud.org/) (Literatura Latinoamericana y del Caribe en Ciencias de la Salud)
* Clinical studies from [REec](https://reec.aemps.es/) (Registro Español de estudios clínicos)
* Health research projects from [Portal FIS](https://portalfis.isciii.es/) (Fondo de Investigación en Salud)
* Patents in Spanish from [Google Patents](https://patents.google.com/)

## Applications

The main objective of indexing documents is to obtain a gold-standard set (i.e. annotated by humans) that maps the text within each document to some of those controlled labels.

## Implementation

The technologies that build this tool are:

* [MongoDB](https://www.mongodb.com/) for database
* [Flask](https://flask.palletsprojects.com/en/1.1.x/) for backend
* [Angular](https://angular.io/) for frontend
* [NGINX](https://www.nginx.com/) for server and proxy
* [Docker Compose](https://docs.docker.com/compose/) for development and production deployment

## Usage

``` bash
$ git clone https://github.com/TeMU-BSC/indexer.git
$ cd indexer
```

### Development

``` bash
$ docker-compose up
```

### Production

``` bash
$ docker-compose -f docker-compose.prod.yml up --build -d
```
