FROM node:17

RUN apt install ffmpeg

WORKDIR /app

COPY package.json ./
COPY . .

RUN yarn

CMD ["yarn", "start"]
