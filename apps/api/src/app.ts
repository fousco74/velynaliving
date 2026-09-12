import express, { type ErrorRequestHandler, type RequestHandler } from "express";
import cors from "cors";
import { CURRENCY } from "@velyna/shared";
import { env } from "./config/env.js";
import { houseRouter } from "./routes/house.js";
import { productRouter } from "./routes/product.js";
import { orderRouter } from "./routes/order.js";

const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: "Ressource introuvable." });
};

const onError: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = typeof err?.status === "number" ? err.status : 500;

  if (status >= 500) console.error(err);

  res.status(status).json({
    error: status >= 500 ? "Erreur interne du serveur." : err.message,
    ...(status >= 500 && env.NODE_ENV === "development" && { detail: String(err) }),
  });
};

export const createApp = () => {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json({ limit: "100kb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", currency: CURRENCY });
  });

  app.use("/houses", houseRouter);
  app.use("/products", productRouter);
  app.use("/orders", orderRouter);

  app.use(notFound);
  app.use(onError);

  return app;
};
