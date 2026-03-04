import express from "express";
import morgan from "morgan";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

const app = express();

const LOCAL_ORIGIN_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

function parseAllowedOrigins(value) {
  const raw = String(value || "").trim();
  if (!raw || raw === "*") {
    return { wildcard: true, origins: [] };
  }

  const origins = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return { wildcard: origins.includes("*"), origins };
}

function resolveCorsOrigin(requestOrigin) {
  const { wildcard, origins } = parseAllowedOrigins(env.corsOrigin);

  if (!requestOrigin) {
    return wildcard ? "*" : origins[0] || "*";
  }

  if (LOCAL_ORIGIN_REGEX.test(requestOrigin)) {
    return requestOrigin;
  }

  if (wildcard || origins.includes(requestOrigin)) {
    return requestOrigin;
  }

  return "";
}

app.use((req, res, next) => {
  const corsOrigin = resolveCorsOrigin(req.headers.origin);
  if (corsOrigin) {
    res.header("Access-Control-Allow-Origin", corsOrigin);
    res.header("Vary", "Origin");
  }
  res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

app.use(express.json());
app.use(morgan("dev"));

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
