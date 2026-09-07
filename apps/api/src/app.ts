import { CURRENCY } from "@velyna/shared";

import express from "express";

export const createApp = () => {
  const app = express();

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", currency: CURRENCY });
  });

  return app;
};
