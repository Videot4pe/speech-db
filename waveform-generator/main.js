"use strict";

// Require the framework and instantiate it
const generator = require("./api/generator.js");
const fastify = require("fastify")({ logger: true });

fastify.post("/api/generate", async (request, reply) => {
  const { body } = request;
  generator.create(body);
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
