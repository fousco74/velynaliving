import express from "express";
import {
  adminReviewCreateSchema,
  adminReviewQuerySchema,
  reviewModerationSchema,
} from "@velyna/shared";
import { prisma } from "../db.js";
import { createReview } from "./review.js";

export const adminReviewsRouter = express.Router();

const REVIEW_ADMIN = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  rating: true,
  title: true,
  body: true,
  verified: true,
  status: true,
  source: true,
  reply: true,
  repliedAt: true,
  publishedAt: true,
  createdAt: true,
  product: { select: { slug: true, name: true } },
  order: { select: { number: true } },
} as const;

const parseId = (raw: string) => {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
};

adminReviewsRouter.get("/reviews", async (req, res) => {
  const parsed = adminReviewQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({ error: "Paramètres invalides.", issues: parsed.error.issues });
  }

  const { status } = parsed.data;

  const [reviews, counts] = await Promise.all([
    prisma.review.findMany({
      where: status ? { status } : {},
      select: REVIEW_ADMIN,
      // Les plus anciens en attente d'abord : on modère dans l'ordre d'arrivée.
      orderBy: status === "PENDING" ? { createdAt: "asc" } : { createdAt: "desc" },
    }),
    prisma.review.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  res.json({
    data: {
      reviews,
      counts: Object.fromEntries(counts.map((row) => [row.status, row._count._all])),
    },
  });
});

adminReviewsRouter.post("/reviews", async (req, res) => {
  const parsed = adminReviewCreateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Avis invalide.", issues: parsed.error.issues });
  }

  const { productSlug, ...input } = parsed.data;

  // Tout statut : la maison peut préparer l'avis d'un produit encore en brouillon.
  const product = await prisma.product.findUnique({
    where: { slug: productSlug },
    select: { id: true },
  });
  if (!product) {
    return res.status(400).json({ error: "Produit introuvable.", field: "productSlug" });
  }

  // Saisi par la maison : publié d'emblée, la relecture est déjà faite.
  const review = await createReview(product.id, input, {
    status: "APPROVED",
    source: "ADMIN",
    select: REVIEW_ADMIN,
  });

  res.status(201).json({ data: review });
});

adminReviewsRouter.patch("/reviews/:id", async (req, res) => {
  const parsed = reviewModerationSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Modification invalide.", issues: parsed.error.issues });
  }

  const id = parseId(req.params.id);
  const current =
    id &&
    (await prisma.review.findUnique({ where: { id }, select: { id: true, publishedAt: true } }));

  if (!current) return res.status(404).json({ error: "Avis introuvable." });

  const { status, reply } = parsed.data;

  const review = await prisma.review.update({
    where: { id: current.id },
    data: {
      ...(status && { status }),
      // La date affichée est celle de la première publication : republier un
      // avis après l'avoir masqué ne le fait pas remonter en tête.
      ...(status === "APPROVED" && !current.publishedAt && { publishedAt: new Date() }),
      ...(reply !== undefined && {
        reply: reply || null,
        repliedAt: reply ? new Date() : null,
      }),
    },
    select: REVIEW_ADMIN,
  });

  res.json({ data: review });
});

adminReviewsRouter.delete("/reviews/:id", async (req, res) => {
  const id = parseId(req.params.id);
  const review = id && (await prisma.review.findUnique({ where: { id }, select: { id: true } }));

  if (!review) return res.status(404).json({ error: "Avis introuvable." });

  await prisma.review.delete({ where: { id: review.id } });
  res.status(204).end();
});
