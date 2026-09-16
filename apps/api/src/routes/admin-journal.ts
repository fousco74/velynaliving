import express from "express";
import {
  adminJournalQuerySchema,
  estimateReadingTime,
  journalInputSchema,
  journalUpdateSchema,
  type JournalInput,
  type JournalStatus,
} from "@velyna/shared";
import { prisma } from "../db.js";

export const adminJournalRouter = express.Router();

/** Ligne de liste : pas de corps d'article, qui pèse pour rien dans un tableau. */
const JOURNAL_ROW = {
  slug: true,
  title: true,
  category: true,
  status: true,
  publishedAt: true,
  readingTime: true,
  views: true,
  imageUrl: true,
  updatedAt: true,
} as const;

const JOURNAL_FULL = {
  ...JOURNAL_ROW,
  excerpt: true,
  body: true,
  createdAt: true,
} as const;

/**
 * Forme acceptée par Prisma. Les champs nullables en base doivent recevoir
 * `null`, jamais `""` : une chaîne vide s'affiche (une puce, un tiret, un bloc
 * qui s'ouvre) alors qu'un `null` se teste.
 */
type JournalData = {
  slug?: string;
  title?: string;
  category?: string | null;
  excerpt?: string | null;
  body?: string | null;
  imageUrl?: string | null;
  readingTime?: string | null;
  publishedAt?: Date | null;
  status?: JournalStatus;
};

/** `undefined` = champ absent du PATCH, à ne pas toucher. `""` = à vider. */
const blank = (value: string | undefined) =>
  value === undefined ? undefined : value.trim() === "" ? null : value.trim();

/**
 * La date arrive au format AAAA-MM-JJ. On l'ancre à midi UTC plutôt qu'à
 * minuit : à minuit, un lecteur à l'ouest de Greenwich verrait la veille.
 */
const toDate = (value: string | null | undefined) =>
  value === undefined ? undefined : value ? new Date(`${value}T12:00:00Z`) : null;

const toData = (input: Partial<JournalInput>): JournalData => ({
  ...(input.slug !== undefined && { slug: input.slug }),
  ...(input.title !== undefined && { title: input.title.trim() }),
  ...(input.status !== undefined && { status: input.status }),
  category: blank(input.category),
  excerpt: blank(input.excerpt),
  body: blank(input.body),
  imageUrl: blank(input.imageUrl),
  // Temps de lecture laissé vide : on le déduit du corps plutôt que d'afficher
  // un blanc dans le design, qui l'attend toujours. Un PATCH qui ne parle ni
  // du temps de lecture ni du corps n'y touche pas — sans quoi changer le seul
  // statut d'un article effacerait sa durée.
  readingTime:
    input.readingTime === undefined && input.body === undefined
      ? undefined
      : (blank(input.readingTime) ?? (input.body ? estimateReadingTime(input.body) : null)),
  publishedAt: toDate(input.publishedAt),
});

/** Prisma ignore les clés `undefined`, mais pas les clés absentes du PATCH. */
const pruned = (data: JournalData) =>
  Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  ) as JournalData;

const isUniqueViolation = (err: unknown) => (err as { code?: string }).code === "P2002";

adminJournalRouter.get("/journal", async (req, res) => {
  const parsed = adminJournalQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({ error: "Paramètres invalides.", issues: parsed.error.issues });
  }

  const { status, category } = parsed.data;

  const articles = await prisma.journal.findMany({
    where: { ...(status && { status }), ...(category && { category }) },
    select: JOURNAL_ROW,
    // Les brouillons n'ont pas de date de publication : on les remonte en tête,
    // ce sont eux qui demandent une action.
    orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }],
  });

  const categories = await prisma.journal.findMany({
    where: { category: { not: null } },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  res.json({
    data: {
      articles,
      categories: categories.map((row) => row.category).filter((value) => value !== null),
    },
  });
});

adminJournalRouter.get("/journal/:slug", async (req, res) => {
  const article = await prisma.journal.findUnique({
    where: { slug: req.params.slug },
    select: JOURNAL_FULL,
  });

  if (!article) {
    return res.status(404).json({ error: "Article introuvable." });
  }

  res.json({ data: article });
});

adminJournalRouter.post("/journal", async (req, res) => {
  const parsed = journalInputSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Article invalide.", issues: parsed.error.issues });
  }

  const data = pruned(toData(parsed.data));

  // Publier sans dater n'a pas de sens : le design affiche la date partout.
  if (parsed.data.status === "PUBLISHED" && !data.publishedAt) {
    data.publishedAt = new Date();
  }

  try {
    const article = await prisma.journal.create({
      data: { ...data, slug: parsed.data.slug, title: parsed.data.title.trim() },
      select: JOURNAL_FULL,
    });

    res.status(201).json({ data: article });
  } catch (err) {
    if (!isUniqueViolation(err)) throw err;

    res.status(409).json({ error: `Le slug « ${parsed.data.slug} » est déjà utilisé.` });
  }
});

adminJournalRouter.patch("/journal/:slug", async (req, res) => {
  const parsed = journalUpdateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Modification invalide.", issues: parsed.error.issues });
  }

  const existing = await prisma.journal.findUnique({
    where: { slug: req.params.slug },
    select: { id: true, status: true, publishedAt: true },
  });

  if (!existing) {
    return res.status(404).json({ error: "Article introuvable." });
  }

  const data = pruned(toData(parsed.data));

  // Première publication : on date automatiquement. Une republication garde
  // la date d'origine — l'article n'est pas neuf parce qu'on l'a recorrigé.
  const publishing = parsed.data.status === "PUBLISHED" && existing.status !== "PUBLISHED";

  if (publishing && !data.publishedAt && !existing.publishedAt) {
    data.publishedAt = new Date();
  }

  try {
    const article = await prisma.journal.update({
      where: { id: existing.id },
      data,
      select: JOURNAL_FULL,
    });

    res.json({ data: article });
  } catch (err) {
    if (!isUniqueViolation(err)) throw err;

    res.status(409).json({ error: `Le slug « ${parsed.data.slug} » est déjà utilisé.` });
  }
});

adminJournalRouter.delete("/journal/:slug", async (req, res) => {
  const article = await prisma.journal.findUnique({
    where: { slug: req.params.slug },
    select: { id: true },
  });

  if (!article) {
    return res.status(404).json({ error: "Article introuvable." });
  }

  // Aucune table ne référence Journal : contrairement au produit, la
  // suppression ne réécrit aucun historique.
  await prisma.journal.delete({ where: { id: article.id } });

  res.json({ data: { slug: req.params.slug, deleted: true } });
});
