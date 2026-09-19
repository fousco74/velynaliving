import express from "express";
import { SITE_IMAGE_SLOTS, isSiteImageKey, siteImageUpdateSchema } from "@velyna/shared";
import { prisma } from "../db.js";

export const adminSiteImagesRouter = express.Router();

/**
 * Le back-office édite des EMPLACEMENTS, pas des lignes : la liste part donc du
 * catalogue du code et vient y coller ce que la base contient. Un emplacement
 * jamais touché s'affiche avec son visuel d'origine, marqué comme tel.
 */
adminSiteImagesRouter.get("/site-images", async (_req, res) => {
  const overrides = await prisma.siteImage.findMany({
    select: { key: true, path: true, updatedAt: true },
  });

  const byKey = new Map(overrides.map((row) => [row.key, row]));

  res.json({
    data: SITE_IMAGE_SLOTS.map((slot) => {
      const override = byKey.get(slot.key);

      return {
        key: slot.key,
        group: slot.group,
        label: slot.label,
        hint: slot.hint,
        defaultPath: slot.defaultPath,
        path: override?.path ?? slot.defaultPath,
        custom: Boolean(override),
        updatedAt: override?.updatedAt ?? null,
      };
    }),
  });
});

adminSiteImagesRouter.put("/site-images/:key", async (req, res) => {
  const { key } = req.params;

  // Clé inconnue = emplacement qui n'existe pas dans le site : 404, et surtout
  // pas une ligne fantôme que personne n'affichera jamais.
  if (!isSiteImageKey(key)) {
    return res.status(404).json({ error: "Emplacement d'image inconnu." });
  }

  const parsed = siteImageUpdateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Image invalide.", issues: parsed.error.issues });
  }

  const { path } = parsed.data;

  const image = await prisma.siteImage.upsert({
    where: { key },
    create: { key, path },
    update: { path },
    select: { key: true, path: true, updatedAt: true },
  });

  res.json({ data: { ...image, custom: true } });
});

/** Retour au visuel livré avec le site : on supprime le remplacement. */
adminSiteImagesRouter.delete("/site-images/:key", async (req, res) => {
  const { key } = req.params;

  if (!isSiteImageKey(key)) {
    return res.status(404).json({ error: "Emplacement d'image inconnu." });
  }

  const { count } = await prisma.siteImage.deleteMany({ where: { key } });
  const slot = SITE_IMAGE_SLOTS.find((item) => item.key === key)!;

  res.json({ data: { key, path: slot.defaultPath, custom: false, reset: count > 0 } });
});
