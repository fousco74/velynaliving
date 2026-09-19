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

/**
 * Chemin d'image accepté en base.
 *
 * `/assets/…` : visuel livré avec le site (apps/web/public).
 * `/uploads/…` : image téléversée depuis le back-office, servie par l'API.
 *
 * Volontairement restreint à ces deux préfixes : aucune URL externe ne peut
 * entrer en base par un formulaire.
 */
export const imagePathSchema = z
  .string()
  .trim()
  .min(1)
  .max(300)
  .regex(
    /^\/(assets|uploads)\/[A-Za-z0-9._-]+$/,
    "Chemin attendu : /assets/fichier.jpeg ou /uploads/fichier.jpeg",
  );

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

// ─────────────────────────── Journal ───────────────────────────

export const JOURNAL_STATUSES = ["PUBLISHED", "DRAFT"] as const;
export type JournalStatus = (typeof JOURNAL_STATUSES)[number];

export const JOURNAL_STATUS_LABELS: Record<JournalStatus, string> = {
  PUBLISHED: "Publié",
  DRAFT: "Brouillon",
};

export type ArticleBlock = { kind: "p" | "h2" | "quote"; text: string };

/**
 * Le corps d'un article est stocké en **texte brut**, pas en JSON structuré :
 * l'admin écrit dans un textarea, pas dans un éditeur de blocs. La convention
 * est un sous-ensemble minimal de Markdown, choisi pour couvrir exactement les
 * trois formes du design (paragraphe, intertitre, citation) et rien de plus.
 *
 *   ligne vide  → séparateur de blocs
 *   `## texte`  → intertitre
 *   `> texte`   → citation
 *   sinon       → paragraphe
 */
export const parseArticleBody = (body: string | null | undefined): ArticleBlock[] => {
  if (!body) return [];

  // Les retours à la ligne internes à un bloc sont recollés : la mise en page
  // du textarea ne doit pas transparaître dans le rendu.
  const join = (text: string) => text.replace(/\s*\n\s*/g, " ").trim();

  return body
    .split(/\n[ \t]*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map<ArticleBlock>((block) => {
      if (/^##\s/.test(block)) return { kind: "h2", text: join(block.replace(/^##\s*/, "")) };
      if (/^>\s?/.test(block)) return { kind: "quote", text: join(block.replace(/^>\s?/gm, "")) };
      return { kind: "p", text: join(block) };
    });
};

/** 200 mots/minute, arrondi à la minute pleine, jamais moins d'une. */
export const estimateReadingTime = (body: string | null | undefined) => {
  const words = parseArticleBody(body).reduce(
    (total, block) => total + block.text.split(/\s+/).filter(Boolean).length,
    0,
  );

  return `${Math.max(1, Math.round(words / 200))} min`;
};

/**
 * « 2 septembre 2026 ». Fuseau épinglé sur UTC : `publishedAt` a une précision
 * au jour, et sans cela le serveur et le navigateur pourraient afficher deux
 * dates différentes de part et d'autre de minuit — et déclencher une erreur
 * d'hydratation React.
 */
const articleDateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export const formatArticleDate = (value: string | Date | null | undefined) =>
  value ? articleDateFmt.format(new Date(value)) : "";

/** Date seule (AAAA-MM-JJ) : c'est ce qu'émet un `<input type="date">`. */
const publishedAtSchema = z.iso.date().or(z.literal("")).nullable().optional();

/** Champs éditoriaux, identiques à la création et à la modification. */
const journalEditorialFields = {
  category: optionalText(60),
  excerpt: optionalText(600),
  body: optionalText(20000),
  imageUrl: imagePathSchema.or(z.literal("")).optional(),
  readingTime: optionalText(20),
  publishedAt: publishedAtSchema,
};

export const journalInputSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(2, "Titre requis").max(160),
  status: z.enum(JOURNAL_STATUSES).default("DRAFT"),
  ...journalEditorialFields,
});

/**
 * Le PATCH redéclare ses champs au lieu d'un `.partial()` sur le schéma de
 * création : `.partial()` conserve les `.default()`, si bien qu'un corps vide
 * `{}` produirait `{ status: "DRAFT" }` et dépublierait l'article sans que
 * personne ne l'ait demandé. Un PATCH ne doit porter que ce qu'on lui envoie.
 */
export const journalUpdateSchema = z
  .object({
    slug: slugSchema.optional(),
    title: z.string().trim().min(2, "Titre requis").max(160).optional(),
    status: z.enum(JOURNAL_STATUSES).optional(),
    ...journalEditorialFields,
  })
  .refine((patch) => Object.keys(patch).length > 0, "Aucune modification demandée.");

export const adminJournalQuerySchema = z.object({
  status: z.enum(JOURNAL_STATUSES).optional(),
  category: z.string().trim().max(60).optional(),
});

export const journalQuerySchema = z.object({
  category: z.string().trim().max(60).optional(),
});

export type JournalInput = z.infer<typeof journalInputSchema>;
export type JournalUpdate = z.infer<typeof journalUpdateSchema>;

// ═══════════════════════ Images « en dur » du site ═══════════════════════

/**
 * Visuels livrés avec le site (`/assets/…`) que le back-office peut remplacer.
 *
 * Le catalogue vit ici, pas en base : c'est une propriété du CODE — tel
 * emplacement existe parce qu'un composant l'affiche. La base ne garde que les
 * REMPLACEMENTS. Une ligne absente signifie donc « visuel d'origine », et
 * supprimer la ligne suffit à revenir au livré, sans script de restauration.
 *
 * Corollaire : retirer une image d'une page, c'est retirer son entrée d'ici —
 * la valeur orpheline en base devient inerte, elle n'est plus jamais lue.
 */
export const SITE_IMAGE_SLOTS = [
  {
    key: "home-hero",
    group: "Accueil",
    label: "Image d'ouverture (hero)",
    hint: "Plein écran, 92 % de la hauteur. Paysage, sujet légèrement au-dessus du centre.",
    defaultPath: "/assets/hero-ambiance.jpeg",
  },
  {
    key: "home-brand-1",
    group: "Accueil",
    label: "Bloc Marque I — Maison Velyná",
    hint: "Moitié d'écran sur grand format, pleine largeur sur mobile.",
    defaultPath: "/assets/maison-velyna.jpeg",
  },
  {
    key: "home-brand-2",
    group: "Accueil",
    label: "Bloc Marque II — Velynákaï",
    hint: "Moitié d'écran sur grand format, pleine largeur sur mobile.",
    defaultPath: "/assets/maison-velyna-kai.jpeg",
  },
  {
    key: "home-founder",
    group: "Accueil",
    label: "Portrait de la fondatrice",
    hint: "Portrait 3/4, visage dans le tiers supérieur.",
    defaultPath: "/assets/fondatrice.jpeg",
  },
  {
    key: "menu-brand-1",
    group: "Menu « Marques »",
    label: "Vignette Maison Velyná",
    hint: "Petite vignette paysage du menu déroulant.",
    defaultPath: "/assets/maison-velyna.jpeg",
  },
  {
    key: "menu-brand-2",
    group: "Menu « Marques »",
    label: "Vignette Velynákaï",
    hint: "Petite vignette paysage du menu déroulant.",
    defaultPath: "/assets/maison-velyna-kai.jpeg",
  },
  {
    key: "brands-maison-velyna",
    group: "Page « Les marques »",
    label: "Rangée Maison Velyná",
    hint: "Format 4/3.",
    defaultPath: "/assets/maison-velyna.jpeg",
  },
  {
    key: "brands-velyna-kai",
    group: "Page « Les marques »",
    label: "Rangée Velynákaï",
    hint: "Format 4/3.",
    defaultPath: "/assets/maison-velyna-kai.jpeg",
  },
  {
    key: "maison-velyna-hero",
    group: "Page Maison Velyná",
    label: "Image d'ouverture — la collection",
    hint: "Portrait. Le cadrage est ancré en bas de l'image.",
    defaultPath: "/assets/les-parfums.jpeg",
  },
  {
    key: "velyna-kai-hero",
    group: "Page Velynákaï",
    label: "Première image (bandeau vert)",
    hint: "Recadrée en plein bloc, sujet vers le bas.",
    defaultPath: "/assets/velynakai-produit.jpeg",
  },
  {
    key: "velyna-kai-product",
    group: "Page Velynákaï",
    label: "Image du bloc produit",
    hint: "Affichée entière (jamais rognée) : un fond uni vaut mieux.",
    defaultPath: "/assets/velyna-kai.jpeg",
  },
  {
    key: "not-found",
    group: "Page 404",
    label: "Image de la page introuvable",
    hint: "Format 4/5.",
    defaultPath: "/assets/minuit-poudre.jpeg",
  },
  {
    key: "la-maison-logo",
    group: "Page « La maison »",
    label: "Logo",
    hint: "Carré.",
    defaultPath: "/assets/logo.jpeg",
  },
  {
    key: "la-maison-founder",
    group: "Page « La maison »",
    label: "Portrait de la fondatrice",
    hint: "Portrait 3/4.",
    defaultPath: "/assets/fondatrice.jpeg",
  },
] as const;

export type SiteImageSlot = (typeof SITE_IMAGE_SLOTS)[number];
export type SiteImageKey = SiteImageSlot["key"];

/** Chemin affichable pour chaque emplacement — jamais partiel. */
export type SiteImages = Record<SiteImageKey, string>;

export const SITE_IMAGE_KEYS: readonly SiteImageKey[] = SITE_IMAGE_SLOTS.map((slot) => slot.key);

export const isSiteImageKey = (value: string): value is SiteImageKey =>
  SITE_IMAGE_KEYS.includes(value as SiteImageKey);

/**
 * Fusionne les remplacements enregistrés avec les visuels livrés.
 *
 * Le résultat est toujours complet : une page n'a jamais à tester l'absence,
 * et une clé inconnue en base (emplacement retiré du code) est ignorée.
 */
export const resolveSiteImages = (
  overrides: readonly { key: string; path: string }[] = [],
): SiteImages => {
  const images = Object.fromEntries(
    SITE_IMAGE_SLOTS.map((slot) => [slot.key, slot.defaultPath]),
  ) as SiteImages;

  for (const { key, path } of overrides) {
    if (isSiteImageKey(key)) images[key] = path;
  }

  return images;
};

export const siteImageUpdateSchema = z.object({ path: imagePathSchema });
