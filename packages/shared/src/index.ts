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

  return {
    subTotal,
    discount,
    deliveryCost,
    total: subTotal - discount + deliveryCost,
    freeDelivery,
  };
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
export const orderInputSchema = z
  .object({
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
  })
  .superRefine((order, ctx) => {
    // Une livraison à domicile sans adresse n'est pas livrable : le retrait
    // boutique est le seul mode où l'adresse n'a pas de sens.
    if (order.deliveryMethod !== "PICKUP" && !order.address) {
      ctx.addIssue({
        code: "custom",
        path: ["address"],
        message: "Adresse requise pour une livraison à domicile",
      });
    }
  });

export const orderTrackSchema = z.object({
  number: z.string().trim().min(1),
  email: z.email("Adresse e-mail invalide"),
});

export type Contact = z.infer<typeof contactSchema>;
export type House = z.infer<typeof houseSchema>;
export type OrderInput = z.infer<typeof orderInputSchema>;

// ─────────────────────── Back-office administrateur ───────────────────────

export const PRODUCT_STATUSES = ["ONLINE", "DRAFT"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  ONLINE: "En ligne",
  DRAFT: "Brouillon",
};

export const PAYMENT_STATUSES = ["PENDING", "CONFIRMED", "FAILED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmé",
  FAILED: "Échoué",
};

/**
 * Transitions autorisées d'un statut de commande.
 * Le graphe est volontairement à sens unique : une commande expédiée ne
 * redevient pas « en préparation », sinon l'historique ne veut plus rien dire.
 * DELIVERED et REFUNDED sont terminaux (hors remboursement d'une livraison).
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  NEW: ["PREPARING", "CANCELLED"],
  PREPARING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

/** Statuts qui rendent le stock au catalogue quand on les atteint. */
export const RESTOCKING_STATUSES: readonly OrderStatus[] = ["CANCELLED", "REFUNDED"];

export const canTransition = (from: OrderStatus, to: OrderStatus) =>
  ORDER_STATUS_TRANSITIONS[from].includes(to);

/** Seuil d'alerte du tableau de bord : en dessous, le réassort devient urgent. */
export const LOW_STOCK_THRESHOLD = 10;

export const loginSchema = z.object({
  email: z.email("Adresse e-mail invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const adminOrderQuerySchema = z.object({
  status: orderStatusSchema.optional(),
  /** Recherche libre : numéro de commande, nom ou e-mail client. */
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(20),
});

export const orderStatusUpdateSchema = z.object({
  status: orderStatusSchema,
});

export const paymentStatusUpdateSchema = z.object({
  status: z.enum(PAYMENT_STATUSES),
  reference: z.string().trim().max(120).optional(),
});

export const adminProductQuerySchema = z.object({
  house: z.string().trim().min(1).optional(),
  status: z.enum(PRODUCT_STATUSES).optional(),
  /** `1` limite aux produits sous le seuil d'alerte. */
  lowStock: z.enum(["0", "1"]).default("0"),
});

/** Slug d'URL : minuscules, chiffres et tirets simples. Pas d'accent, pas d'espace. */
export const slugSchema = z
  .string()
  .trim()
  .min(2, "Slug trop court")
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Minuscules, chiffres et tirets uniquement");

/** Chemin d'image servi depuis apps/web/public. */
export const imagePathSchema = z
  .string()
  .trim()
  .min(1)
  .max(300)
  .regex(/^\/assets\/[A-Za-z0-9._-]+$/, "Chemin attendu : /assets/fichier.jpeg");

/** Couleur hexadécimale du design (#RRGGBB). */
export const hexColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Couleur attendue au format #RRGGBB");

const optionalText = (max: number) => z.string().trim().max(max).or(z.literal("")).optional();

// ─── Maisons ───

export const houseInputSchema = z.object({
  name: z.string().trim().min(2, "Nom requis").max(80),
  slug: slugSchema,
});

/** PATCH : tout est optionnel, mais au moins un champ doit changer. */
export const houseUpdateSchema = houseInputSchema
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, "Aucune modification demandée.");

// ─── Produits ───

/**
 * Champs éditoriaux, communs à la création et à la modification.
 * Nullables en base : une chaîne vide envoyée par un formulaire est convertie
 * en `null` côté API, pour ne pas stocker du vide qui s'affiche.
 */
const productEditorialFields = {
  imgDetail: imagePathSchema.or(z.literal("")).optional(),
  detailBackground: hexColorSchema.or(z.literal("")).optional(),
  inkColor: hexColorSchema.or(z.literal("")).optional(),
  headNote: optionalText(200),
  heartNote: optionalText(200),
  backgroundNote: optionalText(200),
  piece: optionalText(120),
  usage: optionalText(2000),
  ambiance: optionalText(200),
  description: optionalText(4000),
  newRank: z.number().int().min(1).max(999).nullable().optional(),
};

export const productInputSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(2, "Nom requis").max(120),
  ref: z.string().trim().min(2, "Référence requise").max(40),
  houseSlug: slugSchema,
  price: z.number().int().positive("Le prix doit être positif").max(100000000),
  capacity: z.string().trim().min(1, "Contenance requise").max(40),
  stock: z.number().int().min(0, "Le stock ne peut pas être négatif").max(99999).default(0),
  img: imagePathSchema,
  status: z.enum(PRODUCT_STATUSES).default("DRAFT"),
  ...productEditorialFields,
});

export const productUpdateSchema = z
  .object({
    slug: slugSchema.optional(),
    name: z.string().trim().min(2, "Nom requis").max(120).optional(),
    ref: z.string().trim().min(2, "Référence requise").max(40).optional(),
    houseSlug: slugSchema.optional(),
    price: z.number().int().positive("Le prix doit être positif").max(100000000).optional(),
    capacity: z.string().trim().min(1, "Contenance requise").max(40).optional(),
    stock: z.number().int().min(0, "Le stock ne peut pas être négatif").max(99999).optional(),
    img: imagePathSchema.optional(),
    status: z.enum(PRODUCT_STATUSES).optional(),
    ...productEditorialFields,
  })
  .refine((patch) => Object.keys(patch).length > 0, "Aucune modification demandée.");

export type HouseInput = z.infer<typeof houseInputSchema>;
export type ProductInput = z.infer<typeof productInputSchema>;

export type Login = z.infer<typeof loginSchema>;
export type ProductUpdate = z.infer<typeof productUpdateSchema>;
