"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartLine = {
  slug: string;
  name: string;
  price: number;
  img: string;
  capacity: string;
  houseName: string;
  quantity: number;
};

type CartContext = {
  lines: CartLine[];
  count: number;
  ready: boolean;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "velyna.cart.v1";

const Context = createContext<CartContext | null>(null);

const read = (): CartLine[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [lines, setLines] = useState<CartLine[]>([]);
  // Le panier vit dans localStorage : on ne le lit qu'après le montage pour
  // que le HTML rendu côté serveur et le premier rendu client concordent.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLines(read());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* navigation privée, quota plein : le panier reste en mémoire */
    }
  }, [lines, ready]);

  const value = useMemo<CartContext>(
    () => ({
      lines,
      ready,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      add: (line, quantity = 1) =>
        setLines((current) => {
          const existing = current.find((item) => item.slug === line.slug);
          return existing
            ? current.map((item) =>
                item.slug === line.slug ? { ...item, quantity: item.quantity + quantity } : item,
              )
            : [...current, { ...line, quantity }];
        }),
      setQuantity: (slug, quantity) =>
        setLines((current) =>
          quantity < 1
            ? current.filter((item) => item.slug !== slug)
            : current.map((item) => (item.slug === slug ? { ...item, quantity } : item)),
        ),
      remove: (slug) => setLines((current) => current.filter((item) => item.slug !== slug)),
      clear: () => setLines([]),
    }),
    [lines, ready],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useCart = () => {
  const context = useContext(Context);
  if (!context) throw new Error("useCart doit être utilisé dans <CartProvider>");
  return context;
};
