FROM node:20.3.0-alpine

RUN mkdir /app

RUN apk add curl

COPY ./dist /app

RUN npm i -g serve

CMD serve -p 80 /app/

