FROM node:17

RUN sudo apt install FFmpeg

WORKDIR /app

COPY package.json ./
COPY . .

RUN yarn

CMD ["yarn", "start"]
