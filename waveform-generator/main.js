"use strict";

// Require the framework and instantiate it
const generator = require("./api/generator.js");
const fastify = require("fastify")({ logger: true });
const errorCodes = require("fastify").errorCodes;

fastify.post("/generate", async (request, reply) => {
  console.log("\n\nGENERATE\n\n");

  const { body } = request;
  generator.create(body);
});

fastify.get("/generate/heartbeat", async (request, reply) => {
  return { status: "ok" };
});

fastify.setErrorHandler(function (error, request, reply) {
  if (error instanceof errorCodes.FST_ERR_BAD_STATUS_CODE) {
    this.log.error(error);
    reply.status(500).send({ ok: false });
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: 5006 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
