import express from "express";
import {
  houseInputSchema,
  houseUpdateSchema,
  productInputSchema,
  productUpdateSchema,
} from "@velyna/shared";
import { prisma } from "../db.js";

export const adminCatalogRouter = express.Router();

const PRODUCT_FULL = {
  slug: true,
  name: true,
  ref: true,
  price: true,
  capacity: true,
  stock: true,
  status: true,
  img: true,
  imgDetail: true,
  detailBackground: true,
  inkColor: true,
  headNote: true,
  heartNote: true,
  backgroundNote: true,
  piece: true,
  usage: true,
  ambiance: true,
  description: true,
  newRank: true,
  house: { select: { name: true, slug: true } },
} as const;

/** Champs nullables en base : un formulaire vide doit écrire `null`, pas `""`. */
const NULLABLE = [
  "imgDetail",
  "detailBackground",
  "inkColor",
  "headNote",
  "heartNote",
  "backgroundNote",
  "piece",
  "usage",
  "ambiance",
  "description",
] as const;

type NullableKey = (typeof NULLABLE)[number];

/**
 * Élargit le type des champs nullables pour que Prisma accepte le `null`,
 * tout en préservant les champs obligatoires — sans quoi un
 * `Record<string, unknown>` ferait perdre le typage de `create`.
 */
type Nullified<T> = Omit<T, NullableKey> & {
  [K in Extract<keyof T, NullableKey>]: T[K] | null;
};

const blankToNull = <T extends Record<string, unknown>>(input: T) => {
  const output: Record<string, unknown> = { ...input };

  for (const key of NULLABLE) {
    if (output[key] === "") output[key] = null;
  }

  return output as Nullified<T>;
};

const isUniqueViolation = (err: unknown) => (err as { code?: string }).code === "P2002";

/**
 * Prisma 7 avec l'adaptateur pg ne remplit pas toujours `meta.target` : le
 * P2002 arrive sans nom de colonne. Plutôt qu'un « champ » générique, on
 * relit les valeurs en conflit — une requête, uniquement sur le chemin
 * d'erreur — pour dire à l'admin quoi corriger.
 */
const houseConflict = async (name?: string, slug?: string, excludeId?: number) => {
  const clash = await prisma.house.findFirst({
    where: {
      OR: [...(name ? [{ name }] : []), ...(slug ? [{ slug }] : [])],
      ...(excludeId && { id: { not: excludeId } }),
    },
    select: { name: true, slug: true },
  });

  if (clash?.slug === slug) return `Le slug « ${slug} » est déjà utilisé.`;
  if (clash?.name === name) return `Le nom « ${name} » est déjà utilisé.`;
  return "Ce nom ou ce slug est déjà utilisé.";
};

const productConflict = async (slug?: string, ref?: string, excludeId?: number) => {
  const clash = await prisma.product.findFirst({
    where: {
      OR: [...(slug ? [{ slug }] : []), ...(ref ? [{ ref }] : [])],
      ...(excludeId && { id: { not: excludeId } }),
    },
    select: { slug: true, ref: true },
  });

  if (clash?.slug === slug) return `Le slug « ${slug} » est déjà utilisé.`;
  if (clash?.ref === ref) return `La référence « ${ref} » est déjà utilisée.`;
  return "Ce slug ou cette référence est déjà utilisé.";
};

// ─────────────────────────── Maisons ───────────────────────────

adminCatalogRouter.get("/houses", async (_req, res) => {
  const houses = await prisma.house.findMany({
    select: {
      name: true,
      slug: true,
      createdAt: true,
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });

  res.json({ data: houses });
});

adminCatalogRouter.post("/houses", async (req, res) => {
  const parsed = houseInputSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Maison invalide.", issues: parsed.error.issues });
  }

  try {
    const house = await prisma.house.create({
      data: parsed.data,
      select: { name: true, slug: true, _count: { select: { products: true } } },
    });

    res.status(201).json({ data: house });
  } catch (err) {
    if (!isUniqueViolation(err)) throw err;

    res.status(409).json({ error: await houseConflict(parsed.data.name, parsed.data.slug) });
  }
});

adminCatalogRouter.patch("/houses/:slug", async (req, res) => {
  const parsed = houseUpdateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Maison invalide.", issues: parsed.error.issues });
  }

  const existing = await prisma.house.findUnique({
    where: { slug: req.params.slug },
    select: { id: true },
  });

  if (!existing) {
    return res.status(404).json({ error: "Maison introuvable." });
  }

  try {
    const house = await prisma.house.update({
      where: { id: existing.id },
      data: parsed.data,
      select: { name: true, slug: true, _count: { select: { products: true } } },
    });

    res.json({ data: house });
  } catch (err) {
    if (!isUniqueViolation(err)) throw err;

    res.status(409).json({
      error: await houseConflict(parsed.data.name, parsed.data.slug, existing.id),
    });
  }
});

adminCatalogRouter.delete("/houses/:slug", async (req, res) => {
  const house = await prisma.house.findUnique({
    where: { slug: req.params.slug },
    select: { id: true, _count: { select: { products: true } } },
  });

  if (!house) {
    return res.status(404).json({ error: "Maison introuvable." });
  }

  // La contrainte de clé étrangère refuserait de toute façon : on renvoie un
  // message qui dit quoi faire plutôt qu'une erreur Prisma opaque.
  if (house._count.products > 0) {
    return res.status(409).json({
      error: `Cette maison porte ${house._count.products} produit(s). Déplacez-les ou supprimez-les d'abord.`,
    });
  }

  await prisma.house.delete({ where: { id: house.id } });

  res.json({ data: { slug: req.params.slug, deleted: true } });
});

// ─────────────────────────── Produits ───────────────────────────

adminCatalogRouter.get("/products/:slug", async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    select: PRODUCT_FULL,
  });

  if (!product) {
    return res.status(404).json({ error: "Produit introuvable." });
  }

  res.json({ data: product });
});

adminCatalogRouter.post("/products", async (req, res) => {
  const parsed = productInputSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Produit invalide.", issues: parsed.error.issues });
  }

  const { houseSlug, ...fields } = parsed.data;

  const house = await prisma.house.findUnique({
    where: { slug: houseSlug },
    select: { id: true },
  });

  if (!house) {
    return res.status(400).json({ error: `Maison inconnue : ${houseSlug}.` });
  }

  try {
    const product = await prisma.product.create({
      data: { ...blankToNull(fields), houseId: house.id },
      select: PRODUCT_FULL,
    });

    res.status(201).json({ data: product });
  } catch (err) {
    if (!isUniqueViolation(err)) throw err;

    res.status(409).json({ error: await productConflict(fields.slug, fields.ref) });
  }
});

adminCatalogRouter.patch("/products/:slug", async (req, res) => {
  const parsed = productUpdateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Modification invalide.", issues: parsed.error.issues });
  }

  const existing = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    select: { id: true },
  });

  if (!existing) {
    return res.status(404).json({ error: "Produit introuvable." });
  }

  const { houseSlug, ...fields } = parsed.data;
  const data = blankToNull(fields) as Nullified<typeof fields> & { houseId?: number };

  if (houseSlug) {
    const house = await prisma.house.findUnique({
      where: { slug: houseSlug },
      select: { id: true },
    });

    if (!house) {
      return res.status(400).json({ error: `Maison inconnue : ${houseSlug}.` });
    }

    data.houseId = house.id;
  }

  try {
    const product = await prisma.product.update({
      where: { id: existing.id },
      data,
      select: PRODUCT_FULL,
    });

    res.json({ data: product });
  } catch (err) {
    if (!isUniqueViolation(err)) throw err;

    res.status(409).json({
      error: await productConflict(fields.slug, fields.ref, existing.id),
    });
  }
});

adminCatalogRouter.delete("/products/:slug", async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    select: { id: true, _count: { select: { orderItems: true } } },
  });

  if (!product) {
    return res.status(404).json({ error: "Produit introuvable." });
  }

  // Une ligne de commande référence le produit : le supprimer réécrirait
  // l'historique comptable. On passe en brouillon, qui le retire de la
  // boutique sans toucher aux commandes passées.
  if (product._count.orderItems > 0) {
    return res.status(409).json({
      error: `Ce produit figure dans ${product._count.orderItems} commande(s) et ne peut pas être supprimé. Passez-le en brouillon pour le retirer de la boutique.`,
    });
  }

  await prisma.product.delete({ where: { id: product.id } });

  res.json({ data: { slug: req.params.slug, deleted: true } });
});
