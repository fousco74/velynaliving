const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

export type House = { name: string; slug: string };

export type ProductCard = {
  slug: string;
  name: string;
  ref: string;
  price: number;
  capacity: string;
  stock: number;
  img: string;
  newRank: number | null;
  house: House;
};

export type ProductEditorial = ProductCard & {
  headNote: string | null;
  heartNote: string | null;
  backgroundNote: string | null;
  ambiance: string | null;
  description: string | null;
  piece: string | null;
};

export type Product = ProductEditorial & {
  imgDetail: string | null;
  detailBackground: string | null;
  inkColor: string | null;
  usage: string | null;
};

export type OrderItem = {
  quantity: number;
  unitPrice: number;
  productName: string;
  productRef: string;
  product: { slug: string; img: string; capacity: string };
};

export type Order = {
  number: string;
  status: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string | null;
  municipality: string;
  instruction: string | null;
  deliveryMethod: "ABIDJAN" | "INTERIOR" | "PICKUP";
  subTotal: number;
  discount: number;
  promoCode: string | null;
  deliveryCost: number;
  total: number;
  items: OrderItem[];
  payment: { operator: string; status: string; amount: number } | null;
};

export type ApiIssue = { path: (string | number)[]; message: string };

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    /** Détail Zod renvoyé par l'API, pour afficher l'erreur au bon champ. */
    readonly issues?: ApiIssue[],
  ) {
    super(message);
  }
}

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
    cache: "no-store",
    // Le back-office s'authentifie par cookie httpOnly, et l'API vit sur un
    // autre port : sans « include », le navigateur ne l'envoie pas.
    credentials: "include",
  });

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(payload?.error ?? "Une erreur est survenue.", res.status, payload?.issues);
  }

  return payload.data as T;
};

const productsUrl = (params?: { house?: string; sort?: string; detail?: boolean }) => {
  const query = new URLSearchParams();
  if (params?.house) query.set("house", params.house);
  if (params?.sort) query.set("sort", params.sort);
  if (params?.detail) query.set("detail", "1");
  return `/products${query.size ? `?${query}` : ""}`;
};

export const getProducts = (params?: { house?: string; sort?: string }) =>
  request<ProductCard[]>(productsUrl(params));

/** Variante enrichie : notes olfactives et textes, pour les pages marques. */
export const getProductsDetailed = (params?: { house?: string; sort?: string }) =>
  request<ProductEditorial[]>(productsUrl({ ...params, detail: true }));

export const getProduct = (slug: string) => request<Product>(`/products/${slug}`);

export const getHouses = () => request<House[]>("/houses");

export const createOrder = (body: unknown) =>
  request<Order>("/orders", { method: "POST", body: JSON.stringify(body) });

export const trackOrder = (number: string, email: string) =>
  request<Order>(`/orders/${encodeURIComponent(number)}?email=${encodeURIComponent(email)}`);

// ─────────────────────── Back-office administrateur ───────────────────────

export type AdminUser = { email: string; role: string };

export type OrderRow = {
  number: string;
  status: OrderStatusValue;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  municipality: string;
  deliveryMethod: Order["deliveryMethod"];
  total: number;
  payment: { operator: string; status: PaymentStatusValue } | null;
  _count: { items: number };
};

export type OrderStatusValue =
  "NEW" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";

export type PaymentStatusValue = "PENDING" | "CONFIRMED" | "FAILED";

export type AdminOrder = Omit<Order, "status" | "payment"> & {
  status: OrderStatusValue;
  updatedAt: string;
  payment: {
    operator: string;
    status: PaymentStatusValue;
    amount: number;
    reference: string | null;
  } | null;
};

export type AdminProduct = {
  slug: string;
  name: string;
  ref: string;
  price: number;
  capacity: string;
  stock: number;
  status: "ONLINE" | "DRAFT";
  img: string;
  house: House;
};

export type AdminStats = {
  orders: { total: number; byStatus: Partial<Record<OrderStatusValue, number>> };
  revenue: number;
  lowStock: number;
  outOfStock: number;
  pendingPayments: number;
  recent: OrderRow[];
  lowStockThreshold: number;
};

export const login = (email: string, password: string) =>
  request<AdminUser>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const logout = () => request<{ ok: boolean }>("/auth/logout", { method: "POST" });

export const getMe = () => request<AdminUser>("/auth/me");

export const getStats = () => request<AdminStats>("/admin/stats");

export const getAdminOrders = (params: {
  status?: string;
  q?: string;
  page?: number;
  perPage?: number;
}) => {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.q) query.set("q", params.q);
  if (params.page) query.set("page", String(params.page));
  if (params.perPage) query.set("perPage", String(params.perPage));

  return request<{
    orders: OrderRow[];
    total: number;
    page: number;
    perPage: number;
    pages: number;
  }>(`/admin/orders${query.size ? `?${query}` : ""}`);
};

export const getAdminOrder = (number: string) =>
  request<AdminOrder>(`/admin/orders/${encodeURIComponent(number)}`);

export const updateOrderStatus = (number: string, status: OrderStatusValue) =>
  request<AdminOrder>(`/admin/orders/${encodeURIComponent(number)}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const updatePaymentStatus = (
  number: string,
  status: PaymentStatusValue,
  reference?: string,
) =>
  request<AdminOrder["payment"]>(`/admin/orders/${encodeURIComponent(number)}/payment`, {
    method: "PATCH",
    body: JSON.stringify({ status, ...(reference && { reference }) }),
  });

export const getAdminProducts = (params?: {
  house?: string;
  status?: string;
  lowStock?: boolean;
}) => {
  const query = new URLSearchParams();
  if (params?.house) query.set("house", params.house);
  if (params?.status) query.set("status", params.status);
  if (params?.lowStock) query.set("lowStock", "1");

  return request<{ products: AdminProduct[]; lowStockThreshold: number }>(
    `/admin/products${query.size ? `?${query}` : ""}`,
  );
};

// ─────────────────────── Catalogue : maisons ───────────────────────

export type AdminHouse = {
  name: string;
  slug: string;
  createdAt?: string;
  _count: { products: number };
};

export const getAdminHouses = () => request<AdminHouse[]>("/admin/houses");

export const createHouse = (body: { name: string; slug: string }) =>
  request<AdminHouse>("/admin/houses", { method: "POST", body: JSON.stringify(body) });

export const updateHouse = (slug: string, patch: { name?: string; slug?: string }) =>
  request<AdminHouse>(`/admin/houses/${encodeURIComponent(slug)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });

export const deleteHouse = (slug: string) =>
  request<{ slug: string; deleted: boolean }>(`/admin/houses/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });

// ─────────────────────── Catalogue : produits ───────────────────────

/** Fiche complète servie par GET /admin/products/:slug, éditée par le formulaire. */
export type AdminProductFull = AdminProduct & {
  imgDetail: string | null;
  detailBackground: string | null;
  inkColor: string | null;
  headNote: string | null;
  heartNote: string | null;
  backgroundNote: string | null;
  piece: string | null;
  usage: string | null;
  ambiance: string | null;
  description: string | null;
  newRank: number | null;
};

export type ProductPayload = {
  slug?: string;
  name?: string;
  ref?: string;
  houseSlug?: string;
  price?: number;
  capacity?: string;
  stock?: number;
  img?: string;
  status?: "ONLINE" | "DRAFT";
  imgDetail?: string;
  detailBackground?: string;
  inkColor?: string;
  headNote?: string;
  heartNote?: string;
  backgroundNote?: string;
  piece?: string;
  usage?: string;
  ambiance?: string;
  description?: string;
  newRank?: number | null;
};

export const getAdminProduct = (slug: string) =>
  request<AdminProductFull>(`/admin/products/${encodeURIComponent(slug)}`);

export const createProduct = (body: ProductPayload) =>
  request<AdminProductFull>("/admin/products", { method: "POST", body: JSON.stringify(body) });

export const updateProduct = (slug: string, patch: ProductPayload) =>
  request<AdminProductFull>(`/admin/products/${encodeURIComponent(slug)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });

export const deleteProduct = (slug: string) =>
  request<{ slug: string; deleted: boolean }>(`/admin/products/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });

// ─────────────────────── Journal ───────────────────────

export type JournalCard = {
  slug: string;
  title: string;
  category: string | null;
  excerpt: string | null;
  imageUrl: string | null;
  readingTime: string | null;
  publishedAt: string | null;
  views: number;
};

export type JournalArticle = JournalCard & { body: string | null };

export type JournalList = { articles: JournalCard[]; categories: string[] };

export const getJournal = (category?: string) =>
  request<JournalList>(`/journal${category ? `?category=${encodeURIComponent(category)}` : ""}`);

export const getArticle = (slug: string) =>
  request<JournalArticle>(`/journal/${encodeURIComponent(slug)}`);

/**
 * Compteur de lectures. Appelé depuis le navigateur, jamais pendant le rendu
 * serveur : un prérendu Next n'est pas un lecteur.
 */
export const countArticleView = (slug: string) =>
  request<{ counted: boolean }>(`/journal/${encodeURIComponent(slug)}/view`, { method: "POST" });

export type AdminArticleRow = {
  slug: string;
  title: string;
  category: string | null;
  status: JournalStatusValue;
  publishedAt: string | null;
  readingTime: string | null;
  views: number;
  imageUrl: string | null;
  updatedAt: string;
};

export type JournalStatusValue = "PUBLISHED" | "DRAFT";

export type AdminArticleFull = AdminArticleRow & {
  excerpt: string | null;
  body: string | null;
  createdAt: string;
};

export type ArticlePayload = {
  slug?: string;
  title?: string;
  category?: string;
  excerpt?: string;
  body?: string;
  imageUrl?: string;
  readingTime?: string;
  publishedAt?: string | null;
  status?: JournalStatusValue;
};

export const getAdminJournal = (params?: { status?: string; category?: string }) => {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.category) query.set("category", params.category);

  return request<{ articles: AdminArticleRow[]; categories: string[] }>(
    `/admin/journal${query.size ? `?${query}` : ""}`,
  );
};

export const getAdminArticle = (slug: string) =>
  request<AdminArticleFull>(`/admin/journal/${encodeURIComponent(slug)}`);

export const createArticle = (body: ArticlePayload) =>
  request<AdminArticleFull>("/admin/journal", { method: "POST", body: JSON.stringify(body) });

export const updateArticle = (slug: string, patch: ArticlePayload) =>
  request<AdminArticleFull>(`/admin/journal/${encodeURIComponent(slug)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });

export const deleteArticle = (slug: string) =>
  request<{ slug: string; deleted: boolean }>(`/admin/journal/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });

// ─────────────────────── Images ───────────────────────

/**
 * Résout un chemin d'image stocké en base vers une URL affichable.
 *
 * `/assets/…` est servi par Next (apps/web/public), `/uploads/…` par l'API :
 * les images téléversées sont des données, elles ne vivent pas dans le build.
 * Tout composant qui affiche une image venant de la base passe par ici.
 */
export const imageSrc = (path: string) =>
  path.startsWith("/uploads/") ? `${API_URL}${path}` : path;

/**
 * Téléverse une image et renvoie le chemin à stocker en base.
 * Le fichier part tel quel dans le corps de la requête : pas de multipart,
 * pas de dépendance côté API.
 */
export const uploadImage = (file: File) =>
  request<{ url: string; bytes: number; type: string }>(
    `/admin/uploads?name=${encodeURIComponent(file.name)}`,
    { method: "POST", headers: { "content-type": file.type }, body: file },
  );
