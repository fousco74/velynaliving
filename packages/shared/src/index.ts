import { z } from "zod";

export const DELIVERY_METHODS = ["ABIDJAN", "INTERIOR", "PICKUP"] as const;
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];

export const DELIVERY_OPTIONS: Record<
  DeliveryMethod,
  { label: string; detail: string; cost: number }
> = {
  ABIDJAN: { label: "Abidjan", detail: "24 à 48 h", cost: 2000 },
  INTERIOR: { label: "Intérieur du pays", detail: "3 à 5 jours ouvrés", cost: 5000 },
  PICKUP: { label: "Retrait boutique", detail: "Cocody, sous 24 h", cost: 0 },
};

export const FREE_DELIVERY_THRESHOLD = 50000;
export const PROMO_CODE = "VELYNA10";
export const PROMO_RATE = 0.1;
export const EUR_RATE = 655.957;

export const OPERATORS = [
  "ORANGE",
  "MTN",
  "MOOV_MONEY",
  "WAVE",
  "CARD",
  "CASH_ON_DELIVERY",
] as const;
export type Operator = (typeof OPERATORS)[number];

export const OPERATOR_LABELS: Record<Operator, string> = {
  ORANGE: "Orange Money",
  MTN: "MTN Money",
  MOOV_MONEY: "Moov Money",
  WAVE: "Wave",
  CARD: "Carte bancaire",
  CASH_ON_DELIVERY: "Paiement à la livraison",
};

export const ORDER_STATUSES = [
  "NEW",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "Nouvelle",
  PREPARING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
};

/** 29900 → « 29 900 F CFA ». Espace insécable fine pour éviter les coupures de ligne. */
export const formatXOF = (amount: number) =>
  `${String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} F CFA`;

export type PricedItem = { unitPrice: number; quantity: number };

export type Totals = {
  subTotal: number;
  discount: number;
  deliveryCost: number;
  total: number;
  freeDelivery: boolean;
};

/**
 * Source de vérité des montants, partagée entre l'API et le panier.
 * La remise s'applique avant le seuil de livraison offerte : le client ne peut
 * pas atteindre la gratuité grâce à un montant qu'il ne paiera pas.
 */
export const computeTotals = (
  items: PricedItem[],
  deliveryMethod: DeliveryMethod,
  promoCode?: string | null,
): Totals => {
  const subTotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const promoApplies = promoCode?.trim().toUpperCase() === PROMO_CODE;
  const discount = promoApplies ? Math.round(subTotal * PROMO_RATE) : 0;

  const base = DELIVERY_OPTIONS[deliveryMethod].cost;
  const freeDelivery = subTotal - discount >= FREE_DELIVERY_THRESHOLD;
  const deliveryCost = freeDelivery ? 0 : base;

  return { subTotal, discount, deliveryCost, total: subTotal - discount + deliveryCost, freeDelivery };
};

export const isPromoCode = (code: string) => code.trim().toUpperCase() === PROMO_CODE;

export const deliveryMethodSchema = z.enum(DELIVERY_METHODS);
export const operatorSchema = z.enum(OPERATORS);
export const orderStatusSchema = z.enum(ORDER_STATUSES);

// ---------------------------------------------------------------------------

/** Le F CFA n'a pas de décimales : tous les montants sont des entiers. */
export const CURRENCY = "XOF" as const;

export const COMMUNES_ABIDJAN = [
  "Cocody",
  "Plateau",
  "Marcory",
  "Treichville",
  "Yopougon",
  "Abobo",
  "Adjamé",
  "Attécoubé",
  "Koumassi",
  "Port-Bouët",
  "Bingerville",
  "Songon",
  "Anyama",
  "Autre",
] as const;

/** Format imposé par le design : +225 07 00 00 00 00 */
export const phoneCI = z
  .string()
  .trim()
  .regex(/^\+225 \d{2} \d{2} \d{2} \d{2} \d{2}$/, "Format attendu : +225 07 00 00 00 00");

export const contactSchema = z.object({
  email: z.email("Adresse e-mail invalide"),
  phone: phoneCI,
  commune: z.enum(COMMUNES_ABIDJAN),
});

export const houseSchema = z.object({
  name: z.string(),
  slug: z.string(),
});

export const productQuerySchema = z.object({
  house: z.string().trim().min(1).optional(),
  sort: z.enum(["nouveaute", "prix-asc", "prix-desc", "nom"]).default("nouveaute"),
  /** Ajoute les champs éditoriaux (notes, ambiance) utilisés par les pages marques. */
  detail: z.enum(["0", "1"]).default("0"),
});

/**
 * Le client n'envoie que des slugs et des quantités : aucun montant ne vient
 * du navigateur, l'API recalcule tout depuis la base.
 */
export const orderInputSchema = z.object({
  items: z
    .array(
      z.object({
        slug: z.string().trim().min(1),
        quantity: z.number().int().positive().max(99),
      }),
    )
    .min(1, "Votre panier est vide."),
  firstName: z.string().trim().min(1, "Prénom requis"),
  lastName: z.string().trim().min(1, "Nom requis"),
  email: z.email("Adresse e-mail invalide"),
  phone: phoneCI,
  address: z.string().trim().min(1, "Adresse requise").optional(),
  municipality: z.enum(COMMUNES_ABIDJAN),
  instruction: z.string().trim().max(500).optional(),
  deliveryMethod: deliveryMethodSchema,
  operator: operatorSchema,
  promoCode: z.string().trim().max(40).optional(),
});

export const orderTrackSchema = z.object({
  number: z.string().trim().min(1),
  email: z.email("Adresse e-mail invalide"),
});

export type Contact = z.infer<typeof contactSchema>;
export type House = z.infer<typeof houseSchema>;
export type OrderInput = z.infer<typeof orderInputSchema>;
