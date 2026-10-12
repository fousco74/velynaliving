import { formatXOF, normalizePromoCode, RESTOCKING_STATUSES, type PromoRule } from "@velyna/shared";
import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../db.js";

type Db = typeof prisma | Prisma.TransactionClient;

export type ResolvedPromo = PromoRule & {
  id: number;
  label: string;
  maxUses: number | null;
  minSubTotal: number | null;
};

/**
 * Vérifie qu'un code est utilisable maintenant, pour ce panier et ce client.
 *
 * Renvoie la règle à passer à `computeTotals`, ou le message à montrer au
 * client. Les messages sont volontairement précis (« expiré », « dès
 * 30 000 F CFA ») : un code promo n'est pas un secret, et un client à qui l'on
 * dit seulement « invalide » appelle la boutique.
 *
 * Le nombre d'utilisations est relu ici pour le message, mais la vraie garde
 * contre la course est l'`updateMany` conditionnel dans la transaction de
 * commande — exactement comme le stock.
 */
export const resolvePromo = async (
  db: Db,
  rawCode: string,
  { subTotal, email, now = new Date() }: { subTotal?: number; email?: string; now?: Date },
): Promise<{ promo: ResolvedPromo } | { error: string }> => {
  const promo = await db.promoCode.findUnique({ where: { code: normalizePromoCode(rawCode) } });

  if (!promo || !promo.active) return { error: "Ce code n'est pas valide." };

  if (promo.startsAt && promo.startsAt > now) {
    return {
      error: `Ce code sera valable à partir du ${promo.startsAt.toLocaleDateString("fr-FR", { timeZone: "UTC" })}.`,
    };
  }

  if (promo.endsAt && promo.endsAt < now) return { error: "Ce code a expiré." };

  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
    return { error: "Ce code a atteint son nombre maximal d'utilisations." };
  }

  if (promo.minSubTotal !== null && subTotal !== undefined && subTotal < promo.minSubTotal) {
    return { error: `Ce code est valable dès ${formatXOF(promo.minSubTotal)} d'achat.` };
  }

  if (promo.oncePerCustomer && email) {
    // Une commande annulée ou remboursée rend le droit d'utiliser le code.
    const used = await db.order.count({
      where: {
        promoCodeId: promo.id,
        email: email.toLowerCase(),
        status: { notIn: [...RESTOCKING_STATUSES] },
      },
    });

    if (used > 0) return { error: "Vous avez déjà utilisé ce code." };
  }

  return {
    promo: {
      id: promo.id,
      code: promo.code,
      label: promo.label,
      type: promo.type,
      value: promo.value,
      maxUses: promo.maxUses,
      minSubTotal: promo.minSubTotal,
    },
  };
};
