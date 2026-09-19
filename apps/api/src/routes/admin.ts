import express from "express";
import {
  LOW_STOCK_THRESHOLD,
  RESTOCKING_STATUSES,
  adminOrderQuerySchema,
  adminProductQuerySchema,
  canTransition,
  orderStatusUpdateSchema,
  paymentStatusUpdateSchema,
} from "@velyna/shared";
import { prisma } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";
import { adminCatalogRouter } from "./admin-catalog.js";
import { adminJournalRouter } from "./admin-journal.js";
import { adminSiteImagesRouter } from "./admin-site-images.js";
import { adminUploadsRouter } from "./admin-uploads.js";

export const adminRouter = express.Router();

// Toutes les routes de ce router sont protégées, sans exception.
adminRouter.use(requireAdmin);

// CRUD du catalogue (maisons, produits) et du journal — sous la même garde.
adminRouter.use(adminCatalogRouter);
adminRouter.use(adminJournalRouter);
adminRouter.use(adminSiteImagesRouter);
adminRouter.use(adminUploadsRouter);

/** Ligne de liste : assez pour le tableau, sans charger les articles. */
const ORDER_ROW = {
  number: true,
  status: true,
  createdAt: true,
  firstName: true,
  lastName: true,
  email: true,
  municipality: true,
  deliveryMethod: true,
  total: true,
  payment: { select: { operator: true, status: true } },
  _count: { select: { items: true } },
} as const;

const ORDER_FULL = {
  number: true,
  status: true,
  createdAt: true,
  updatedAt: true,
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
  payment: { select: { operator: true, status: true, amount: true, reference: true } },
} as const;

const PRODUCT_ROW = {
  slug: true,
  name: true,
  ref: true,
  price: true,
  capacity: true,
  stock: true,
  status: true,
  img: true,
  house: { select: { name: true, slug: true } },
} as const;

// ─────────────────────────── Tableau de bord ───────────────────────────

adminRouter.get("/stats", async (_req, res) => {
  const [byStatus, revenue, lowStock, outOfStock, pendingPayments, recent] = await Promise.all([
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    // Le chiffre d'affaires exclut annulées et remboursées : ce sont des
    // commandes enregistrées, pas des ventes.
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { notIn: [...RESTOCKING_STATUSES] } },
    }),
    prisma.product.count({
      where: { status: "ONLINE", stock: { gt: 0, lte: LOW_STOCK_THRESHOLD } },
    }),
    prisma.product.count({ where: { status: "ONLINE", stock: 0 } }),
    prisma.payment.count({ where: { status: "PENDING" } }),
    prisma.order.findMany({ select: ORDER_ROW, orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const counts = Object.fromEntries(byStatus.map((row) => [row.status, row._count._all]));

  res.json({
    data: {
      orders: {
        total: byStatus.reduce((sum, row) => sum + row._count._all, 0),
        byStatus: counts,
      },
      revenue: revenue._sum.total ?? 0,
      lowStock,
      outOfStock,
      pendingPayments,
      recent,
      lowStockThreshold: LOW_STOCK_THRESHOLD,
    },
  });
});

// ─────────────────────────── Commandes ───────────────────────────

adminRouter.get("/orders", async (req, res) => {
  const parsed = adminOrderQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({ error: "Paramètres invalides.", issues: parsed.error.issues });
  }

  const { status, q, page, perPage } = parsed.data;

  const where = {
    ...(status && { status }),
    ...(q && {
      OR: [
        { number: { contains: q, mode: "insensitive" as const } },
        { email: { contains: q, mode: "insensitive" as const } },
        { firstName: { contains: q, mode: "insensitive" as const } },
        { lastName: { contains: q, mode: "insensitive" as const } },
      ],
    }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      select: ORDER_ROW,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.order.count({ where }),
  ]);

  res.json({
    data: { orders, total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) },
  });
});

adminRouter.get("/orders/:number", async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { number: req.params.number },
    select: ORDER_FULL,
  });

  if (!order) {
    return res.status(404).json({ error: "Commande introuvable." });
  }

  res.json({ data: order });
});

adminRouter.patch("/orders/:number", async (req, res) => {
  const parsed = orderStatusUpdateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Statut invalide.", issues: parsed.error.issues });
  }

  const current = await prisma.order.findUnique({
    where: { number: req.params.number },
    select: { id: true, status: true, items: { select: { productId: true, quantity: true } } },
  });

  if (!current) {
    return res.status(404).json({ error: "Commande introuvable." });
  }

  const next = parsed.data.status;

  if (current.status === next) {
    return res.status(409).json({ error: "La commande est déjà dans ce statut." });
  }

  if (!canTransition(current.status, next)) {
    return res.status(409).json({
      error: `Transition impossible : ${current.status} → ${next}.`,
    });
  }

  // Annulation ou remboursement : les articles retournent au catalogue.
  // Le graphe de transitions garantit qu'on ne peut pas atteindre deux fois
  // un statut de restitution, donc pas de double réapprovisionnement.
  const restock = RESTOCKING_STATUSES.includes(next);

  const order = await prisma.$transaction(async (tx) => {
    if (restock) {
      for (const item of current.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    return tx.order.update({
      where: { id: current.id },
      data: { status: next },
      select: ORDER_FULL,
    });
  });

  res.json({ data: order, ...(restock && { restocked: current.items.length }) });
});

adminRouter.patch("/orders/:number/payment", async (req, res) => {
  const parsed = paymentStatusUpdateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Paiement invalide.", issues: parsed.error.issues });
  }

  const order = await prisma.order.findUnique({
    where: { number: req.params.number },
    select: { payment: { select: { id: true } } },
  });

  if (!order?.payment) {
    return res.status(404).json({ error: "Paiement introuvable pour cette commande." });
  }

  // V1 : aucun opérateur n'est branché, l'admin confirme l'encaissement à la main.
  const payment = await prisma.payment.update({
    where: { id: order.payment.id },
    data: { status: parsed.data.status, reference: parsed.data.reference ?? null },
    select: { operator: true, status: true, amount: true, reference: true },
  });

  res.json({ data: payment });
});

// ─────────────────────────── Catalogue ───────────────────────────

adminRouter.get("/products", async (req, res) => {
  const parsed = adminProductQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({ error: "Paramètres invalides.", issues: parsed.error.issues });
  }

  const { house, status, lowStock } = parsed.data;

  // Contrairement à /products public, l'admin voit aussi les brouillons.
  const products = await prisma.product.findMany({
    where: {
      ...(house && { house: { slug: house } }),
      ...(status && { status }),
      ...(lowStock === "1" && { stock: { lte: LOW_STOCK_THRESHOLD } }),
    },
    select: PRODUCT_ROW,
    orderBy: [{ stock: "asc" }, { name: "asc" }],
  });

  res.json({ data: { products, lowStockThreshold: LOW_STOCK_THRESHOLD } });
});
