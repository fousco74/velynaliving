import express from "express";
import { promoCheckQuerySchema } from "@velyna/shared";
import { prisma } from "../db.js";
import { rateLimit } from "../lib/rate-limit.js";
import { resolvePromo } from "../lib/promo.js";

export const promoCodeRouter = express.Router();

// Un code est court et parfois devinable (NOEL26) : on freine l'énumération.
const checkLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: "Trop d'essais de code promo. Réessayez dans quelques minutes.",
});

/**
 * Vérification d'un code depuis le panier.
 *
 * Lecture seule, donc en GET : aucune écriture publique de plus. Le sous-total
 * envoyé par le navigateur ne sert qu'à prévenir le client d'un minimum non
 * atteint — `POST /orders` revérifie tout avec les vrais prix.
 */
promoCodeRouter.get("/:code", checkLimit, async (req, res) => {
  const parsed = promoCheckQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({ error: "Paramètres invalides.", issues: parsed.error.issues });
  }

  const result = await resolvePromo(prisma, String(req.params.code), { subTotal: parsed.data.subTotal });

  if ("error" in result) return res.status(404).json({ error: result.error });

  const { code, label, type, value, minSubTotal } = result.promo;
  res.json({ data: { code, label, type, value, minSubTotal } });
});
