# FROM node:lts-alpine
# WORKDIR /app
# COPY package.json ./
# RUN npm install
# RUN npm install -g @angular/cli
# COPY . .
# EXPOSE 4200
# CMD ng serve --host 0.0.0.0

FROM node:12-alpine
WORKDIR /app
ADD . /app
RUN npm install
RUN npm install -g @angular/cli

# https://stackoverflow.com/a/50333128
RUN npm install --save-dev @angular-devkit/build-angular