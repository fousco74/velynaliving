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

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
    cache: "no-store",
  });

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(payload?.error ?? "Une erreur est survenue.", res.status);
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
