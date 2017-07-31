FROM node:6.11-alpine

RUN mkdir /app
ADD package.json /app/
WORKDIR /app
RUN npm install
ADD . /app

CMD ["node", "bin/www"]
