"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { formatXOF } from "@velyna/shared";
import { useCart } from "./cart-provider";
import type { Product } from "@/lib/api";

export const AddToCart = ({ product }: { product: Product }) => {
  const { add, lines } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [panelOpen, setPanelOpen] = useState(false);

  const soldOut = product.stock <= 0;
  const max = Math.max(product.stock, 1);
  const cartTotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);

  const handleAdd = () => {
    add(
      {
        slug: product.slug,
        name: product.name,
        price: product.price,
        img: product.img,
        capacity: product.capacity,
        houseName: product.house.name,
      },
      quantity,
    );
    setPanelOpen(true);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 14,
          marginTop: 30,
          borderTop: "1px solid var(--line)",
          paddingTop: 24,
        }}
      >
        <span className="qty">
          <button
            type="button"
            aria-label="Diminuer la quantité"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span>{quantity}</span>
          <button
            type="button"
            aria-label="Augmenter la quantité"
            onClick={() => setQuantity((q) => Math.min(max, q + 1))}
          >
            +
          </button>
        </span>
        <button
          type="button"
          className="btn"
          onClick={handleAdd}
          disabled={soldOut}
          style={{ flex: 1, minWidth: 210 }}
        >
          {soldOut ? "Épuisé" : `Ajouter — ${formatXOF(product.price * quantity)}`}
        </button>
      </div>

      {panelOpen && (
        <>
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setPanelOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 110,
              background: "rgba(30,21,17,0.28)",
              border: 0,
              cursor: "pointer",
            }}
          />
          <aside
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              zIndex: 120,
              width: "min(420px, 92vw)",
              background: "var(--bg)",
              borderLeft: "1px solid var(--line-strong)",
              display: "flex",
              flexDirection: "column",
              padding: "clamp(20px, 3vw, 40px)",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 16,
                borderBottom: "1px solid var(--line)",
                paddingBottom: 18,
              }}
            >
              <p className="eyebrow" style={{ letterSpacing: "0.26em" }}>
                Ajouté au panier
              </p>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                aria-label="Fermer"
                style={{ background: "none", border: 0, cursor: "pointer", fontSize: 18 }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                display: "flex",
                gap: 18,
                padding: "24px 0",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <Image
                src={product.img}
                alt={product.name}
                width={92}
                height={123}
                style={{ width: 92, aspectRatio: "3 / 4", objectFit: "cover" }}
              />
              <div>
                <p style={{ margin: 0, fontFamily: "var(--serif)", fontSize: 23 }}>
                  {product.name}
                </p>
                <p className="eyebrow" style={{ marginTop: 8, letterSpacing: "0.2em" }}>
                  {product.capacity} × {quantity}
                </p>
                <p style={{ margin: "12px 0 0", fontFamily: "var(--sans)", fontSize: 12 }}>
                  {formatXOF(product.price * quantity)}
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                padding: "20px 0",
                fontFamily: "var(--serif)",
                fontSize: 21,
              }}
            >
              <span>Total panier</span>
              <span>{formatXOF(cartTotal)}</span>
            </div>

            <Link href="/panier" className="btn btn-solid btn-block">
              Voir le panier
            </Link>
            <button
              type="button"
              className="btn btn-soft btn-block"
              style={{ marginTop: 14 }}
              onClick={() => setPanelOpen(false)}
            >
              Continuer mes achats
            </button>
          </aside>
        </>
      )}
    </>
  );
};
