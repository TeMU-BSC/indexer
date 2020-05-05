# DeCS Indexer

This web app allows to annotate scientific papers by the "Descriptores en Ciencias de la Salud" (DeCS),
which are an analog Spanish version of the "Medical Semantic Headings" (MeSH) terms.

The objective is to build a gold-standard model with several indexed documents by those DeCS codes.


## Implementation
This fullstack web project has been build with Angular for the frontend, Flask for the backend,
MongoDB for the database, NGinx for the server/proxy and Docker / Docker Compose for the deployment.

Docker Compose is also used for development, so it speeds up and automates the connections between services.


## Development

```bash
$ git clone https://github.com/TeMU-BSC/decs-indexer.git
$ cd decs-indexer
$ docker-compose up
```
