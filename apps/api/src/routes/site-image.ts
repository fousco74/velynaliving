import express from "express";
import { resolveSiteImages } from "@velyna/shared";
import { prisma } from "../db.js";

export const siteImageRouter = express.Router();

/**
 * Visuels du site, remplacements appliqués.
 *
 * Public et en lecture seule : le front l'appelle à chaque rendu, y compris
 * pour l'en-tête. La réponse est toujours complète — la fusion avec les visuels
 * livrés se fait ici, pour qu'aucune page n'ait à connaître les valeurs par
 * défaut ni à gérer un trou.
 */
siteImageRouter.get("/", async (_req, res) => {
  const overrides = await prisma.siteImage.findMany({ select: { key: true, path: true } });

  res.json({ data: resolveSiteImages(overrides) });
});
