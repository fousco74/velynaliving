"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  computeTotals,
  formatXOF,
  FREE_DELIVERY_THRESHOLD,
  isPromoCode,
  PROMO_CODE,
} from "@velyna/shared";
import { useCart } from "@/components/cart-provider";

export default function PanierPage() {
  const { lines, setQuantity, remove, ready, count } = useCart();
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState("");

  // Le montant affiché vient de la même fonction que celle utilisée par l'API :
  // le panier ne peut pas annoncer un total que le serveur refuserait.
  const totals = computeTotals(
    lines.map((line) => ({ unitPrice: line.price, quantity: line.quantity })),
    "ABIDJAN",
    promo,
  );

  const applyPromo = (event: React.FormEvent) => {
    event.preventDefault();
    if (isPromoCode(promoInput)) {
      setPromo(promoInput.trim().toUpperCase());
      setPromoError("");
    } else {
      setPromo(null);
      setPromoError("Ce code n'est pas valide.");
    }
  };

  return (
    <>
      <section className="section-tight" style={{ paddingTop: "clamp(56px, 8vw, 120px)" }}>
        <p className="eyebrow" style={{ marginBottom: 24 }}>
          Panier ({ready ? count : 0})
        </p>
        <h1 className="display">
          Votre <span className="italic">sélection</span>
        </h1>
      </section>

      <section style={{ padding: "0 var(--gutter) clamp(64px, 9vw, 130px)" }}>
        {!ready ? null : lines.length === 0 ? (
          <div
            style={{
              borderTop: "1px solid var(--line)",
              borderBottom: "1px solid var(--line)",
              padding: "clamp(32px, 5vw, 72px) 0",
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: "var(--serif)",
                fontSize: "clamp(24px, 2.2vw, 34px)",
                letterSpacing: "-0.03em",
              }}
            >
              Votre panier est encore vide.
            </p>
            <p className="lead" style={{ margin: "16px 0 30px", maxWidth: "48ch" }}>
              Cinq fragrances d&apos;intérieur et un matcha de cérémonie vous attendent dans la
              boutique.
            </p>
            <Link href="/boutique" className="btn">
              Découvrir la boutique
            </Link>
          </div>
        ) : (
          <div className="grid12">
            <div style={{ gridColumn: "1 / span 7" }}>
              {lines.map((line) => (
                <div
                  key={line.slug}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "92px 1fr auto",
                    gap: "clamp(14px, 2vw, 32px)",
                    alignItems: "center",
                    padding: "22px 0",
                    borderTop: "1px solid var(--line)",
                  }}
                >
                  <Link href={`/produit/${line.slug}`}>
                    <Image
                      src={line.img}
                      alt={line.name}
                      width={200}
                      height={266}
                      style={{
                        width: "100%",
                        height: "auto",
                        aspectRatio: "3 / 4",
                        objectFit: "cover",
                      }}
                    />
                  </Link>
                  <div>
                    <Link
                      href={`/produit/${line.slug}`}
                      style={{ fontFamily: "var(--serif)", fontSize: "clamp(19px, 2vw, 24px)" }}
                    >
                      {line.name}
                    </Link>
                    <p className="eyebrow" style={{ marginTop: 8, letterSpacing: "0.2em" }}>
                      {line.houseName} — {line.capacity} — {formatXOF(line.price)}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 16,
                        marginTop: 14,
                      }}
                    >
                      <span className="qty" style={{ padding: "8px 14px", fontSize: 11 }}>
                        <button
                          type="button"
                          aria-label={`Diminuer ${line.name}`}
                          onClick={() => setQuantity(line.slug, line.quantity - 1)}
                        >
                          −
                        </button>
                        <span>{line.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Augmenter ${line.name}`}
                          onClick={() => setQuantity(line.slug, line.quantity + 1)}
                        >
                          +
                        </button>
                      </span>
                      <button
                        type="button"
                        onClick={() => remove(line.slug)}
                        className="tag"
                        style={{
                          background: "none",
                          border: 0,
                          padding: 0,
                          cursor: "pointer",
                          color: "var(--muted-2)",
                        }}
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--sans)",
                      fontWeight: 300,
                      fontSize: 12,
                      letterSpacing: "0.14em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatXOF(line.price * line.quantity)}
                  </span>
                </div>
              ))}

              <div style={{ borderTop: "1px solid var(--line)", paddingTop: 26 }}>
                <Link href="/boutique" className="link-underline">
                  Continuer mes achats
                </Link>
              </div>
            </div>

            <aside
              style={{
                gridColumn: "9 / span 4",
                borderTop: "1px solid var(--line)",
                paddingTop: 24,
              }}
            >
              <p className="eyebrow" style={{ marginBottom: 24, letterSpacing: "0.26em" }}>
                Récapitulatif
              </p>

              <div className="summary-row">
                <span>Sous-total</span>
                <span>{formatXOF(totals.subTotal)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="summary-row">
                  <span>Code {PROMO_CODE}</span>
                  <span>−{formatXOF(totals.discount)}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Livraison</span>
                <span>{totals.freeDelivery ? "Offerte" : "Calculée à l'étape suivante"}</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span>{formatXOF(totals.subTotal - totals.discount)}</span>
              </div>

              <form
                onSubmit={applyPromo}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 14,
                  borderBottom: "1px solid var(--line-strong)",
                  paddingBottom: 10,
                  marginTop: 18,
                }}
              >
                <label
                  htmlFor="promo"
                  className="tag"
                  style={{ fontSize: 9, letterSpacing: "0.24em", color: "var(--muted-3)" }}
                >
                  Code promo
                </label>
                <input
                  id="promo"
                  type="text"
                  value={promoInput}
                  onChange={(event) => setPromoInput(event.target.value)}
                  placeholder={PROMO_CODE}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    background: "none",
                    border: 0,
                    outline: "none",
                    fontFamily: "var(--body)",
                    fontSize: 18,
                  }}
                />
                <button
                  type="submit"
                  className="tag"
                  style={{ background: "none", border: 0, cursor: "pointer" }}
                >
                  Appliquer
                </button>
              </form>

              {promoError && <p className="field-error">{promoError}</p>}
              {promo && (
                <p style={{ margin: "10px 0 0", fontSize: 16, color: "var(--kai-soft)" }}>
                  Code appliqué — 10 % de remise.
                </p>
              )}

              <Link
                href={promo ? `/commande?promo=${promo}` : "/commande"}
                className="btn btn-solid btn-block"
                style={{ marginTop: 22 }}
              >
                Passer commande
              </Link>

              <p
                style={{ margin: "16px 0 0", fontSize: 16, lineHeight: 1.7, color: "var(--muted)" }}
              >
                Livraison offerte dès {formatXOF(FREE_DELIVERY_THRESHOLD)}. Les frais sont calculés
                à l&apos;étape suivante selon votre commune.
              </p>
            </aside>
          </div>
        )}
      </section>
    </>
  );
}
