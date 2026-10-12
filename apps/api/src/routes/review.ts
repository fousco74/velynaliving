import express from "express";
import {
  displayAuthor,
  ratingSummary,
  RESTOCKING_STATUSES,
  reviewInputSchema,
  reviewPageQuerySchema,
  REVIEWS_PER_PAGE,
} from "@velyna/shared";
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

  const email = input.email.toLowerCase();
  let orderId: number | null = null;

  if (input.orderNumber) {
    // Même réponse que la commande n'existe pas, que l'e-mail diffère ou que
    // le produit n'y figure pas : sans cela, on confirmerait l'existence d'une
    // commande à un inconnu (même règle que le suivi de commande).
    const order = await prisma.order.findFirst({
      where: {
        number: input.orderNumber.toUpperCase(),
        email,
        status: { notIn: [...RESTOCKING_STATUSES] },
        items: { some: { productId: product.id } },
      },
      select: { id: true },
    });

    if (!order) {
      return res.status(400).json({
        error: "Aucune commande de ce produit ne correspond à ce numéro et à cet e-mail.",
        field: "orderNumber",
      });
    }

    orderId = order.id;
  }

  try {
    await prisma.review.create({
      data: {
        productId: product.id,
        firstName: input.firstName,
        lastName: input.lastName,
        email,
        rating: input.rating,
        title: input.title || null,
        body: input.body,
        verified: orderId !== null,
        orderId,
      },
    });
  } catch (err) {
    // P2002 : un avis existe déjà pour cette commande et ce produit.
    if ((err as { code?: string }).code === "P2002") {
      return res.status(409).json({
        error: "Vous avez déjà donné votre avis sur ce produit pour cette commande.",
        field: "orderNumber",
      });
    }
    throw err;
  }

  res.status(201).json(accepted);
});
