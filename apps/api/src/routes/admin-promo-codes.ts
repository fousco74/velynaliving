import express from "express";
import {
  promoCodeInputSchema,
  promoCodeUpdateSchema,
  RESTOCKING_STATUSES,
  validatePromoShape,
  type PromoCodeUpdate,
  type PromoType,
} from "@velyna/shared";
import { prisma } from "../db.js";

export const adminPromoCodesRouter = express.Router();

const PROMO_SELECT = {
  id: true,
  code: true,
  label: true,
  type: true,
  value: true,
  startsAt: true,
  endsAt: true,
  minSubTotal: true,
  maxUses: true,
  usedCount: true,
  oncePerCustomer: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} as const;

/**
 * Abidjan vit en UTC toute l'année (pas d'heure d'été) : une journée du
 * calendrier ivoirien va donc de 00:00 à 23:59:59.999 UTC. La fin est
 * inclusive — un code « jusqu'au 25 décembre » marche toute la journée du 25.
 *
 * `undefined` = champ absent du PATCH ; `""` ou `null` = borne retirée.
 */
const toStart = (value: string | null | undefined) =>
  value === undefined ? undefined : value ? new Date(`${value}T00:00:00.000Z`) : null;
const toEnd = (value: string | null | undefined) =>
  value === undefined ? undefined : value ? new Date(`${value}T23:59:59.999Z`) : null;

/** Pour une livraison offerte, la valeur n'a pas de sens : on la fige à 0. */
const valueFor = (type: PromoType, value: number) => (type === "FREE_DELIVERY" ? 0 : value);

const toData = (input: PromoCodeUpdate) =>
  Object.fromEntries(
    Object.entries({
      ...input,
      startsAt: toStart(input.startsAt),
      endsAt: toEnd(input.endsAt),
    }).filter(([, value]) => value !== undefined),
  );

const parseId = (raw: string) => {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const isUniqueViolation = (err: unknown) => (err as { code?: string }).code === "P2002";

/** Statistiques réelles, tirées des commandes : celles qui ont été annulées ne comptent pas. */
const usageStats = async (ids?: number[]) => {
  const rows = await prisma.order.groupBy({
    by: ["promoCodeId"],
    where: {
      promoCodeId: ids ? { in: ids } : { not: null },
      status: { notIn: [...RESTOCKING_STATUSES] },
    },
    _count: { _all: true },
    _sum: { discount: true, total: true },
  });

  return new Map(
    rows.map((row) => [
      row.promoCodeId,
      { orders: row._count._all, discount: row._sum.discount ?? 0, revenue: row._sum.total ?? 0 },
    ]),
  );
};

const EMPTY_STATS = { orders: 0, discount: 0, revenue: 0 };

adminPromoCodesRouter.get("/promo-codes", async (_req, res) => {
  const promos = await prisma.promoCode.findMany({
    select: PROMO_SELECT,
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
  });
  const stats = await usageStats();

  res.json({
    data: promos.map((promo) => ({ ...promo, stats: stats.get(promo.id) ?? EMPTY_STATS })),
  });
});

adminPromoCodesRouter.get("/promo-codes/:id", async (req, res) => {
  const id = parseId(req.params.id);
  const promo = id && (await prisma.promoCode.findUnique({ where: { id }, select: PROMO_SELECT }));

  if (!promo) return res.status(404).json({ error: "Code promo introuvable." });

  const stats = await usageStats([promo.id]);
  res.json({ data: { ...promo, stats: stats.get(promo.id) ?? EMPTY_STATS } });
});

adminPromoCodesRouter.post("/promo-codes", async (req, res) => {
  const parsed = promoCodeInputSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Code promo invalide.", issues: parsed.error.issues });
  }

  const { code, ...rest } = parsed.data;

  try {
    const promo = await prisma.promoCode.create({
      data: {
        code,
        ...rest,
        value: valueFor(rest.type, rest.value),
        startsAt: toStart(rest.startsAt) ?? null,
        endsAt: toEnd(rest.endsAt) ?? null,
        minSubTotal: rest.minSubTotal ?? null,
        maxUses: rest.maxUses ?? null,
      },
      select: PROMO_SELECT,
    });

    res.status(201).json({ data: { ...promo, stats: EMPTY_STATS } });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return res.status(409).json({ error: `Le code ${code} existe déjà.` });
    }
    throw err;
  }
});

adminPromoCodesRouter.patch("/promo-codes/:id", async (req, res) => {
  const parsed = promoCodeUpdateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Modification invalide.", issues: parsed.error.issues });
  }

  const id = parseId(req.params.id);
  const current = id && (await prisma.promoCode.findUnique({ where: { id } }));

  if (!current) return res.status(404).json({ error: "Code promo introuvable." });

  // Le PATCH peut ne porter que le type, ou que la fin : la cohérence se
  // vérifie sur l'état final, base + modification.
  const patch = parsed.data;
  const type = patch.type ?? current.type;
  const merged = validatePromoShape({
    type,
    value: patch.value ?? current.value,
    startsAt:
      patch.startsAt !== undefined ? patch.startsAt : current.startsAt?.toISOString().slice(0, 10),
    endsAt: patch.endsAt !== undefined ? patch.endsAt : current.endsAt?.toISOString().slice(0, 10),
  });

  if (!merged.success) {
    return res.status(400).json({ error: "Modification invalide.", issues: merged.error.issues });
  }

  const promo = await prisma.promoCode.update({
    where: { id: current.id },
    data: {
      ...toData(patch),
      ...((patch.type !== undefined || patch.value !== undefined) && {
        value: valueFor(type, patch.value ?? current.value),
      }),
    },
    select: PROMO_SELECT,
  });

  const stats = await usageStats([promo.id]);
  res.json({ data: { ...promo, stats: stats.get(promo.id) ?? EMPTY_STATS } });
});

adminPromoCodesRouter.delete("/promo-codes/:id", async (req, res) => {
  const id = parseId(req.params.id);
  const promo = id && (await prisma.promoCode.findUnique({ where: { id }, select: { id: true } }));

  if (!promo) return res.status(404).json({ error: "Code promo introuvable." });

  // Un code déjà utilisé reste en base : il porte l'historique des remises
  // accordées. On le désactive à la place.
  const used = await prisma.order.count({ where: { promoCodeId: promo.id } });

  if (used > 0) {
    return res.status(409).json({
      error: `Ce code a servi pour ${used} commande(s) : désactivez-le plutôt que de le supprimer.`,
    });
  }

  await prisma.promoCode.delete({ where: { id: promo.id } });
  res.status(204).end();
});
