import express from "express";
import {
  displayAuthor,
  ratingSummary,
  RESTOCKING_STATUSES,
  reviewInputSchema,
  reviewPageQuerySchema,
  REVIEWS_PER_PAGE,
  splitFullName,
  type ReviewInput,
} from "@velyna/shared";
import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../db.js";
import { rateLimit } from "../lib/rate-limit.js";

/** Monté sous `/products/:slug/reviews` : `mergeParams` donne accès au slug. */
export const reviewRouter = express.Router({ mergeParams: true });

// Écriture publique : on freine le spam sans gêner un vrai client, qui
// n'écrit pas cinq avis dans l'heure.
const submitLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Vous avez déjà envoyé plusieurs avis. Réessayez dans une heure.",
});

/** Agrégat des avis publiés d'un produit, partagé avec la fiche produit. */
export const publishedSummary = async (productId: number) => {
  const rows = await prisma.review.groupBy({
    by: ["rating"],
    where: { productId, status: "APPROVED" },
    _count: { _all: true },
  });

  return ratingSummary(rows.map((row) => ({ rating: row.rating, count: row._count._all })));
};

/**
 * Crée un avis, depuis le site comme depuis le back-office.
 *
 * Le badge « Achat vérifié » se déduit de l'e-mail : une commande active de ce
 * produit passée avec cette adresse, et pas encore notée. Rien à saisir pour le
 * client. Compromis assumé : connaître l'e-mail d'un client suffit à obtenir le
 * badge sous son nom — la modération reste le garde-fou.
 */
export const createReview = async <S extends Prisma.ReviewSelect>(
  productId: number,
  input: Pick<ReviewInput, "name" | "email" | "rating" | "body">,
  options: { status: "PENDING" | "APPROVED"; source: "SITE" | "ADMIN"; select?: S },
) => {
  const email = input.email.toLowerCase();

  const order = await prisma.order.findFirst({
    where: {
      email: { equals: email, mode: "insensitive" },
      status: { notIn: [...RESTOCKING_STATUSES] },
      items: { some: { productId } },
      // Une commande ne vaut qu'un avis vérifié par produit (contrainte unique).
      reviews: { none: { productId } },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  const data = {
    productId,
    ...splitFullName(input.name),
    email,
    rating: input.rating,
    body: input.body,
    status: options.status,
    source: options.source,
    publishedAt: options.status === "APPROVED" ? new Date() : null,
  };

  try {
    return await prisma.review.create({
      data: { ...data, verified: order !== null, orderId: order?.id ?? null },
      select: options.select,
    });
  } catch (err) {
    // P2002 : deux avis simultanés sur la même commande. Le second est gardé,
    // simplement sans badge, plutôt que perdu.
    if ((err as { code?: string }).code !== "P2002") throw err;
    return prisma.review.create({ data, select: options.select });
  }
};

const findProduct = (slug: string) =>
  prisma.product.findFirst({ where: { slug, status: "ONLINE" }, select: { id: true } });

reviewRouter.get("/", async (req, res) => {
  const parsed = reviewPageQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({ error: "Paramètres invalides.", issues: parsed.error.issues });
  }

  const product = await findProduct(String((req.params as { slug?: string }).slug));
  if (!product) return res.status(404).json({ error: "Produit introuvable." });

  const { page } = parsed.data;
  const [summary, rows] = await Promise.all([
    publishedSummary(product.id),
    prisma.review.findMany({
      where: { productId: product.id, status: "APPROVED" },
      // Liste blanche : l'e-mail et le nom complet ne sortent jamais d'ici.
      select: {
        id: true,
        firstName: true,
        lastName: true,
        rating: true,
        title: true,
        body: true,
        verified: true,
        reply: true,
        repliedAt: true,
        publishedAt: true,
        createdAt: true,
      },
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * REVIEWS_PER_PAGE,
      take: REVIEWS_PER_PAGE,
    }),
  ]);

  res.json({
    data: {
      summary,
      page,
      pages: Math.max(1, Math.ceil(summary.count / REVIEWS_PER_PAGE)),
      reviews: rows.map(({ firstName, lastName, publishedAt, createdAt, ...review }) => ({
        ...review,
        author: displayAuthor(firstName, lastName),
        date: publishedAt ?? createdAt,
      })),
    },
  });
});

reviewRouter.post("/", submitLimit, async (req, res) => {
  const parsed = reviewInputSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Avis invalide.", issues: parsed.error.issues });
  }

  const input = parsed.data;
  const accepted = { data: { status: "PENDING" as const } };

  // Robot : on fait comme si tout allait bien, pour ne rien lui apprendre.
  if (input.website) return res.status(201).json(accepted);

  const product = await findProduct(String((req.params as { slug?: string }).slug));
  if (!product) return res.status(404).json({ error: "Produit introuvable." });

  await createReview(product.id, input, { status: "PENDING", source: "SITE" });

  res.status(201).json(accepted);
});
