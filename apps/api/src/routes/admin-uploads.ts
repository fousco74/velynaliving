import express, { type RequestHandler } from "express";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { env } from "../config/env.js";
import {
  ACCEPTED_TYPES,
  MAX_UPLOAD_BYTES,
  UPLOAD_DIR,
  safeFileName,
  sniffImageType,
} from "../lib/uploads.js";

export const adminUploadsRouter = express.Router();

/**
 * Le corps est lu brut, sans multipart.
 *
 * Un `multipart/form-data` imposerait une dépendance (multer) pour un seul
 * fichier à la fois : le navigateur sait envoyer un `File` tel quel en corps
 * de requête, et `express.raw` suffit à le recevoir. Même esprit que le lecteur
 * de cookies maison dans middleware/auth.ts.
 */
const readImage = express.raw({
  type: Object.keys(ACCEPTED_TYPES),
  limit: MAX_UPLOAD_BYTES,
});

/** Traduit le refus d'express.raw en message lisible par l'administrateur. */
const parseImage: RequestHandler = (req, res, next) =>
  readImage(req, res, (err) => {
    if (err && (err as { type?: string }).type === "entity.too.large") {
      return res.status(413).json({
        error: `Image trop lourde : ${env.UPLOAD_MAX_MB} Mo maximum.`,
      });
    }

    next(err);
  });

adminUploadsRouter.post("/uploads", parseImage, async (req, res) => {
  const body = req.body as unknown;

  // Corps vide ou type non déclaré : express.raw n'a rien parsé.
  if (!Buffer.isBuffer(body) || body.length === 0) {
    return res.status(415).json({
      error: "Image attendue au format JPEG, PNG, WebP ou AVIF.",
    });
  }

  const type = sniffImageType(body);

  if (!type) {
    return res.status(415).json({
      error: "Ce fichier n'est pas une image JPEG, PNG, WebP ou AVIF.",
    });
  }

  const name = safeFileName(
    typeof req.query.name === "string" ? req.query.name : undefined,
    ACCEPTED_TYPES[type],
  );

  await writeFile(join(UPLOAD_DIR, name), body);

  // Le chemin renvoyé est celui qui sera stocké en base et validé par
  // `imagePathSchema` — jamais un chemin de disque.
  res.status(201).json({ data: { url: `/uploads/${name}`, bytes: body.length, type } });
});
