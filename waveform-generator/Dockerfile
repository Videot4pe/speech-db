FROM node:17

RUN apt-get install FFmpeg

WORKDIR /app

COPY package.json ./
COPY . .

RUN yarn

CMD ["yarn", "start"]
