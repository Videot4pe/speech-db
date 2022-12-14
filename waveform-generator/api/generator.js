"use strict";

const service = require("../services/generator.js");

module.exports = {
  create({ url, callbackUrl }) {
    service.emitter.emit("process", { url, callbackUrl });
    return { status: "ok" };
  },
};
