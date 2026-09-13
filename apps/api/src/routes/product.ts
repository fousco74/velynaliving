import express from "express";
import { productQuerySchema } from "@velyna/shared";
import { prisma } from "../db.js";

export const productRouter = express.Router();

const CARD_FIELDS = {
  slug: true,
  name: true,
  ref: true,
  price: true,
  capacity: true,
  stock: true,
  img: true,
  newRank: true,
  house: { select: { name: true, slug: true } },
} as const;

const EDITORIAL_FIELDS = {
  headNote: true,
  heartNote: true,
  backgroundNote: true,
  ambiance: true,
  description: true,
  piece: true,
} as const;

const SORTS = {
  nouveaute: { newRank: "asc" },
  "prix-asc": { price: "asc" },
  "prix-desc": { price: "desc" },
  nom: { name: "asc" },
} as const;

productRouter.get("/", async (req, res) => {
  const parsed = productQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({ error: "Paramètres invalides.", issues: parsed.error.issues });
  }

  const { house, sort, detail } = parsed.data;

  const products = await prisma.product.findMany({
    where: { status: "ONLINE", ...(house && { house: { slug: house } }) },
    select: detail === "1" ? { ...CARD_FIELDS, ...EDITORIAL_FIELDS } : CARD_FIELDS,
    orderBy: SORTS[sort],
  });

  res.json({ data: products });
});

productRouter.get("/:slug", async (req, res) => {
  const product = await prisma.product.findFirst({
    where: { slug: req.params.slug, status: "ONLINE" },
    select: {
      ...CARD_FIELDS,
      ...EDITORIAL_FIELDS,
      imgDetail: true,
      detailBackground: true,
      inkColor: true,
      usage: true,
    },
  });

  if (!product) {
    return res.status(404).json({ error: "Produit introuvable." });
  }

  res.json({ data: product });
});
