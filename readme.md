# Indexer web tool

Assign controlled labels to different types of documents, mainly in Spanish language.

Supported labels:

- [DeCS](https://decs.bvsalud.org/es/) (Descriptores en Ciencias de la Salud), analog Spanish version of English MeSH terms
- [HPO](https://hpo.jax.org/) (Human Phenotype Ontology) _(future feature)_

Supported types of documents:

- Scientific articles from [IBECS](https://ibecs.isciii.es/) (Índice Bibliográfico Español en Ciencias de la Salud)
- Scientific articles from [LILACS](https://lilacs.bvsalud.org/) (Literatura Latinoamericana y del Caribe en Ciencias de la Salud)
- Clinical studies from [REec](https://reec.aemps.es/) (Registro Español de estudios clínicos)
- Health research projects from [Portal FIS](https://portalfis.isciii.es/) (Fondo de Investigación en Salud)
- Patents in Spanish from [Google Patents](https://patents.google.com/)

## Applications

The main objective of indexing documents is to obtain a gold-standard set (i.e. annotated by humans) that maps the text within each document to some of those controlled labels.

## Implementation

The technologies that build this tool are:

- [MongoDB](https://www.mongodb.com/) for database
- [Flask](https://flask.palletsprojects.com/en/1.1.x/) for backend
- [Angular](https://angular.io/) for frontend
- [NGINX](https://www.nginx.com/) for server and proxy
- [Docker Compose](https://docs.docker.com/compose/) for development and production deployment

## Development

```bash
# terminal 1
docker run --name indexer_mongo --rm -p 27018:27017 -v "$(realpath ./database/mongodb)":/data/db mongo:4.4.3-bionic

# terminal 2
cd backend
python3.8 -m venv venv
source venv/bin/activate
pip install flask flask-paginate flask-pymongo lorem-text
export FLASK_APP=run
export FLASK_ENV=development
export MONGO_URI=mongodb://localhost:27018/indexer
flask run

# terminal 3
cd frontend
npm install
npm run dev
```

## Production

```bash
docker-compose up --build -d
```
