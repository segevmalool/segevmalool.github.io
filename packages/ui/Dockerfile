FROM node:current-alpine3.14

RUN mkdir /app

COPY ./dist /app

RUN npm i -g serve

CMD serve -p 8080 /app/

