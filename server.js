import Fastify from "fastify";
import fastifyView from "@fastify/view";
import fastifyStatic from "@fastify/static";

import path from "path";
import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

import { findAvailability } from "./data/index.js";

const app = Fastify({
  logger: false,
});


import { Liquid } from "liquidjs";
const engine = new Liquid({
  root: path.join(__dirname, "templates"),
  extname: ".liquid",
});

app.register(fastifyView, {
  engine: {
    liquid: engine,
  },
});

app.register(fastifyStatic, {
  root: path.join(__dirname, 'assets'),
  prefix: '/assets/', // optional: default '/'
});

// Declare a route
app.get("/", async (request, reply) => {
  const { last_updated, delta, data } = await findAvailability();
  return reply.view("./templates/index.liquid", { last_updated, delta, data });
});

// Run the server!
const start = async () => {
  try {
    await app.listen({ port: 4000 });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
start();
