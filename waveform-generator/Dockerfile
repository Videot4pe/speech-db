FROM node:17

RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get install -y ffmpeg

WORKDIR /app

COPY package.json ./
COPY . .

RUN yarn

CMD ["yarn", "start"]
