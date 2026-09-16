import express from "express";
import { journalQuerySchema } from "@velyna/shared";
import { prisma } from "../db.js";

export const journalRouter = express.Router();

const CARD_FIELDS = {
  slug: true,
  title: true,
  category: true,
  excerpt: true,
  imageUrl: true,
  readingTime: true,
  publishedAt: true,
  views: true,
} as const;

/** Un brouillon n'existe pas pour le public : filtre appliqué à chaque route. */
const PUBLISHED = { status: "PUBLISHED" } as const;

journalRouter.get("/", async (req, res) => {
  const parsed = journalQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({ error: "Paramètres invalides.", issues: parsed.error.issues });
  }

  const { category } = parsed.data;

  const [articles, categories] = await Promise.all([
    prisma.journal.findMany({
      where: { ...PUBLISHED, ...(category && { category }) },
      select: CARD_FIELDS,
      orderBy: [{ publishedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
    }),
    // Les catégories viennent de la base, jamais de la liste filtrée : sinon
    // choisir un filtre ferait disparaître tous les autres onglets.
    prisma.journal.findMany({
      where: { ...PUBLISHED, category: { not: null } },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
  ]);

  res.json({
    data: {
      articles,
      categories: categories.map((row) => row.category).filter((value) => value !== null),
    },
  });
});

journalRouter.get("/:slug", async (req, res) => {
  const article = await prisma.journal.findFirst({
    where: { slug: req.params.slug, ...PUBLISHED },
    select: { ...CARD_FIELDS, body: true },
  });

  if (!article) {
    return res.status(404).json({ error: "Article introuvable." });
  }

  res.json({ data: article });
});

/**
 * Compteur de vues, volontairement séparé de la lecture de l'article.
 *
 * Incrémenter dans le GET compterait les rendus serveur de Next — metadata et
 * page, prérendu, prefetch — et non les lecteurs. Ici c'est le navigateur qui
 * appelle, une fois par page affichée.
 */
journalRouter.post("/:slug/view", async (req, res) => {
  const result = await prisma.journal.updateMany({
    where: { slug: req.params.slug, ...PUBLISHED },
    data: { views: { increment: 1 } },
  });

  if (result.count === 0) {
    return res.status(404).json({ error: "Article introuvable." });
  }

  res.json({ data: { counted: true } });
});
