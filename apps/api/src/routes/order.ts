import express from "express";
import { computeTotals, orderInputSchema, orderTrackSchema, isPromoCode } from "@velyna/shared";
import { prisma } from "../db.js";

export const orderRouter = express.Router();

const ORDER_VIEW = {
  number: true,
  status: true,
  createdAt: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  address: true,
  municipality: true,
  instruction: true,
  deliveryMethod: true,
  subTotal: true,
  discount: true,
  promoCode: true,
  deliveryCost: true,
  total: true,
  items: {
    select: {
      quantity: true,
      unitPrice: true,
      productName: true,
      productRef: true,
      product: { select: { slug: true, img: true, capacity: true } },
    },
  },
  payment: { select: { operator: true, status: true, amount: true } },
} as const;

/** VL-2026-0148 : compteur annuel, repris du format affiché dans le design. */
const nextOrderNumber = async (year: number) => {
  const last = await prisma.order.findFirst({
    where: { number: { startsWith: `VL-${year}-` } },
    orderBy: { number: "desc" },
    select: { number: true },
  });

  const rank = last ? Number(last.number.slice(-4)) + 1 : 1;
  return `VL-${year}-${String(rank).padStart(4, "0")}`;
};

orderRouter.post("/", async (req, res) => {
  const parsed = orderInputSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Commande invalide.", issues: parsed.error.issues });
  }

  const input = parsed.data;

  const products = await prisma.product.findMany({
    where: { slug: { in: input.items.map((item) => item.slug) }, status: "ONLINE" },
    select: { id: true, slug: true, name: true, ref: true, price: true, stock: true },
  });

  const bySlug = new Map(products.map((product) => [product.slug, product]));

  const lines: {
    productId: number;
    quantity: number;
    unitPrice: number;
    productName: string;
    productRef: string;
  }[] = [];

  for (const item of input.items) {
    const product = bySlug.get(item.slug);

    if (!product) {
      return res.status(400).json({ error: `Produit indisponible : ${item.slug}.` });
    }

    if (product.stock < item.quantity) {
      return res.status(409).json({
        error: `Stock insuffisant pour ${product.name} (${product.stock} restant).`,
      });
    }

    lines.push({
      productId: product.id,
      quantity: item.quantity,
      unitPrice: product.price,
      productName: product.name,
      productRef: product.ref,
    });
  }

  const promoCode =
    input.promoCode && isPromoCode(input.promoCode) ? input.promoCode.toUpperCase() : null;
  const totals = computeTotals(lines, input.deliveryMethod, promoCode);
  const email = input.email.toLowerCase();

  // Le numéro est unique en base : en cas de collision avec une commande
  // concurrente, on retente avec le rang suivant.
  for (let attempt = 0; attempt < 5; attempt++) {
    const number = await nextOrderNumber(new Date().getFullYear());

    try {
      const order = await prisma.$transaction(async (tx) => {
        const customer = await tx.customer.upsert({
          where: { email },
          create: {
            email,
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone,
            address: input.address,
          },
          update: {
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone,
            address: input.address,
          },
          select: { id: true },
        });

        for (const line of lines) {
          // Décrément conditionnel : si un autre acheteur a vidé le stock
          // entre-temps, le count vaut 0 et toute la transaction est annulée.
          const { count } = await tx.product.updateMany({
            where: { id: line.productId, stock: { gte: line.quantity } },
            data: { stock: { decrement: line.quantity } },
          });

          if (count === 0) {
            throw new Error(`OUT_OF_STOCK:${line.productName}`);
          }
        }

        return tx.order.create({
          data: {
            number,
            customerId: customer.id,
            firstName: input.firstName,
            lastName: input.lastName,
            email,
            phone: input.phone,
            address: input.address,
            municipality: input.municipality,
            instruction: input.instruction,
            deliveryMethod: input.deliveryMethod,
            subTotal: totals.subTotal,
            discount: totals.discount,
            promoCode,
            deliveryCost: totals.deliveryCost,
            total: totals.total,
            items: { create: lines },
            payment: {
              create: { operator: input.operator, amount: totals.total },
            },
          },
          select: ORDER_VIEW,
        });
      });

      return res.status(201).json({ data: order });
    } catch (err) {
      const message = err instanceof Error ? err.message : "";

      if (message.startsWith("OUT_OF_STOCK:")) {
        return res.status(409).json({ error: `Stock insuffisant pour ${message.split(":")[1]}.` });
      }

      // P2002 = violation de contrainte unique, ici le numéro de commande.
      if ((err as { code?: string }).code !== "P2002") throw err;
    }
  }

  res.status(503).json({ error: "Impossible d'enregistrer la commande, réessayez." });
});

orderRouter.get("/:number", async (req, res) => {
  const parsed = orderTrackSchema.safeParse({ number: req.params.number, email: req.query.email });

  if (!parsed.success) {
    return res.status(400).json({ error: "Numéro de commande et e-mail requis." });
  }

  const order = await prisma.order.findFirst({
    where: { number: parsed.data.number, email: parsed.data.email.toLowerCase() },
    select: ORDER_VIEW,
  });

  // Même réponse que le numéro soit inconnu ou l'e-mail non concordant :
  // sans cela, on confirmerait l'existence d'une commande à un inconnu.
  if (!order) {
    return res.status(404).json({ error: "Aucune commande ne correspond à ces informations." });
  }

  res.json({ data: order });
});
