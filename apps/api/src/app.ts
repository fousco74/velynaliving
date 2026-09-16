import express, { type ErrorRequestHandler, type RequestHandler } from "express";
import cors from "cors";
import { CURRENCY } from "@velyna/shared";
import { env } from "./config/env.js";
import { houseRouter } from "./routes/house.js";
import { productRouter } from "./routes/product.js";
import { orderRouter } from "./routes/order.js";
import { journalRouter } from "./routes/journal.js";
import { UPLOAD_DIR } from "./lib/uploads.js";
import { authRouter } from "./routes/auth.js";
import { adminRouter } from "./routes/admin.js";

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

  // Derrière un reverse proxy, `req.ip` doit être l'IP du client et non celle
  // du proxy — sinon le limiteur de connexion compte tout le monde ensemble.
  if (env.TRUST_PROXY > 0) app.set("trust proxy", env.TRUST_PROXY);

  // credentials: true — sans cela le cookie de session httpOnly ne franchit
  // pas la frontière web (3002) → api (4001). L'origine reste sur liste blanche.
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "100kb" }));

  /**
   * Images téléversées. Le nom porte un suffixe aléatoire, donc une URL
   * désigne toujours le même octet : on peut la mettre en cache sans limite.
   * `express.static` refuse les remontées de chemin (`../`).
   */
  app.use(
    "/uploads",
    express.static(UPLOAD_DIR, {
      maxAge: "1y",
      immutable: true,
      index: false,
      dotfiles: "ignore",
    }),
  );

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", currency: CURRENCY });
  });

  app.use("/auth", authRouter);
  app.use("/admin", adminRouter);
  app.use("/houses", houseRouter);
  app.use("/products", productRouter);
  app.use("/orders", orderRouter);
  app.use("/journal", journalRouter);

  app.use(notFound);
  app.use(onError);

  return app;
};
