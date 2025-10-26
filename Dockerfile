FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 2042

CMD ["yarn", "start:dev"]
