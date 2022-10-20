"use strict";

const https = require("https");
const fs = require("fs");
const axios = require("axios");
const spawn = require("child_process").spawn;
const mime = require("mime");
const EventEmitter = require("node:events");
const fastify = require("fastify")({ logger: true });

const emitter = new EventEmitter();

const generateImage = async ({ filePath, outputPath, callbackUrl }) => {
  var cmd = "ffmpeg";

  var args = [
    "-i",
    filePath,
    "-filter_complex",
    "color=c=#F0EBCE[color];aformat=channel_layouts=mono,showwavespic=s=4000x720:colors=#632626[wave];[color][wave]scale2ref[bg][fg];[bg][fg]overlay=format=auto",
    "-frames:v",
    "1",
    outputPath,
  ];

  const proc = await spawn(cmd, args);

  proc.on("close", function () {
    emitter.emit("send", { filePath, outputPath, callbackUrl });
  });

  proc.on("exit", () => {
    if (proc.exitCode !== 0) {
      fastify.log.error(new Error(`Process exited with code ${proc.exitCode}`));
    }
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
  const filemime = mime.getType(outputPath);

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };
  await axios.post(
    callbackUrl,
    { image: `data:${filemime};base64,${image}` },
    {
      headers: headers,
    }
  );
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
