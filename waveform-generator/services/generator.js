"use strict";

const https = require("https"); // or 'https' for https:// URLs
const fs = require("fs");
const spawn = require("child_process").spawn;
const request = require("request");
const EventEmitter = require("node:events");

const emitter = new EventEmitter();

const generateImage = async ({ filePath, outputPath, callbackUrl }) => {
  var cmd = "ffmpeg";

  var args = [
    "-i",
    filePath,
    "-filter_complex",
    "color=c=blue[color];aformat=channel_layouts=mono,showwavespic=s=1280x720:colors=white[wave];[color][wave]scale2ref[bg][fg];[bg][fg]overlay=format=auto",
    "-frames:v",
    "1",
    outputPath,
  ];

  const proc = await spawn(cmd, args);

  proc.on("close", function () {
    emitter.emit("send", { filePath, outputPath, callbackUrl });
  });
};

const downloadFile = async ({ url, filePath, outputPath, callbackUrl }) => {
  return https.get(url, async (res) => {
    const stream = fs.createWriteStream(filePath);
    await res.pipe(stream);
    emitter.emit("generate", { filePath, outputPath, callbackUrl });
  });
};

const removeFile = async ({ filePath }) => {
  await fs.unlinkSync(filePath);
};

const sendFile = async ({ filePath, outputPath, callbackUrl }) => {
  const image = await fs.readFileSync(outputPath, { encoding: "base64" });

  await request.post(callbackUrl, image);
  emitter.emit("remove", { filePath });
  emitter.emit("remove", { filePath: outputPath });
};

const processFile = async ({ url, callbackUrl }) => {
  const formattedUrl = url.split("/").at(-1);
  const filePath = `./uploads/url-${formattedUrl}.mp3`;
  const outputPath = `./uploads/url-${formattedUrl}.png`;

  emitter.emit("download", { url, filePath, outputPath, callbackUrl });
};

emitter.on("process", processFile);
emitter.on("download", downloadFile);
emitter.on("generate", generateImage);
emitter.on("remove", removeFile);
emitter.on("send", sendFile);

module.exports = {
  emitter,
};
