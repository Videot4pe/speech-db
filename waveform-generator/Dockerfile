FROM node:17

WORKDIR /app

COPY package.json ./
COPY . .

RUN yarn

CMD ["yarn", "start"]
