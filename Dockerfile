FROM node:8.9.4-alpine

WORKDIR /app

ADD package.json ./
ADD package-lock.json ./
RUN npm install

ADD app app/

CMD ["npm", "start"]
