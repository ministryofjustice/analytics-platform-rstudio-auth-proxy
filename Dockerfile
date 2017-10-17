FROM node:6.11-alpine

WORKDIR /app

ADD package.json ./
ADD package-lock.json ./
RUN npm install

ADD app app/

CMD ["npm", "start"]
