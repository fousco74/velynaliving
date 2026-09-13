"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  DELIVERY_OPTIONS,
  formatXOF,
  OPERATOR_LABELS,
  type DeliveryMethod,
  type Operator,
} from "@velyna/shared";
import type { Order } from "@/lib/api";

function ConfirmationContent() {
  const params = useSearchParams();
  const number = params.get("number");
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("velyna.lastOrder");
    if (raw) setOrder(JSON.parse(raw) as Order);
  }, []);

  return (
    <>
      <section
        style={{ padding: "clamp(56px, 8vw, 120px) var(--gutter) clamp(32px, 5vw, 64px)" }}
      >
        <p className="eyebrow" style={{ marginBottom: 24 }}>
          Commande enregistrée
        </p>
        <h1 className="display" style={{ maxWidth: "26ch", fontSize: "clamp(36px, 5vw, 80px)" }}>
          Merci, votre commande <span className="italic">est enregistrée.</span>
        </h1>
        <p className="lead" style={{ margin: "26px 0 0", maxWidth: "56ch" }}>
          Nos équipes préparent votre commande à la main, emballage maison inclus. Nous vous
          contactons pour finaliser le règlement : aucun montant n&apos;a été débité.
        </p>
      </section>

      <section style={{ padding: "0 var(--gutter) clamp(64px, 9vw, 130px)" }}>
        <div className="grid12">
          <div style={{ gridColumn: "1 / span 7" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "clamp(20px, 2.5vw, 40px)",
                borderTop: "1px solid var(--line)",
                paddingTop: 24,
              }}
            >
              <Summary label="Numéro" value={number ?? order?.number ?? "—"} />
              <Summary
                label="Délai estimé"
                value={
                  order ? DELIVERY_OPTIONS[order.deliveryMethod as DeliveryMethod].detail : "—"
                }
              />
              <Summary
                label="Règlement"
                value={
                  order?.payment
                    ? (OPERATOR_LABELS[order.payment.operator as Operator] ??
                      order.payment.operator)
                    : "—"
                }
              />
            </div>

            {order && (
              <>
                <p className="eyebrow" style={{ margin: "40px 0 16px", letterSpacing: "0.26em" }}>
                  Articles
                </p>
                {order.items.map((item) => (
                  <div
                    key={item.productRef}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "72px 1fr auto",
                      gap: 18,
                      alignItems: "center",
                      padding: "14px 0",
                      borderTop: "1px solid rgba(201,180,154,0.5)",
                    }}
                  >
                    <Image
                      src={item.product.img}
                      alt={item.productName}
                      width={160}
                      height={213}
                      style={{ width: "100%", aspectRatio: "3 / 4", objectFit: "cover" }}
                    />
                    <div>
                      <p style={{ margin: 0, fontFamily: "var(--serif)", fontSize: 21 }}>
                        {item.productName}
                      </p>
                      <p className="eyebrow" style={{ marginTop: 6, letterSpacing: "0.2em" }}>
                        {item.product.capacity} × {item.quantity}
                      </p>
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
                      {formatXOF(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="summary-total">
                  <span>Total à régler</span>
                  <span>{formatXOF(order.total)}</span>
                </div>
              </>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 28 }}>
              <Link href="/suivi-commande" className="btn btn-solid">
                Suivre ma commande
              </Link>
              <Link href="/boutique" className="btn btn-soft">
                Retour à la boutique
              </Link>
            </div>
          </div>

          {order && (
            <aside
              style={{ gridColumn: "9 / span 4", borderTop: "1px solid var(--line)", paddingTop: 24 }}
            >
              <p className="eyebrow" style={{ marginBottom: 18, letterSpacing: "0.26em" }}>
                Livraison
              </p>
              <p style={{ margin: 0, fontFamily: "var(--serif)", fontSize: 22 }}>
                {order.firstName} {order.lastName}
              </p>
              <p style={{ margin: "12px 0 0", fontSize: 17, lineHeight: 1.7, color: "var(--ink-3)" }}>
                {order.address && (
                  <>
                    {order.address}
                    <br />
                  </>
                )}
                {order.municipality}, Abidjan
                <br />
                {order.phone}
              </p>
              <p style={{ margin: "12px 0 0", fontSize: 17, lineHeight: 1.7, color: "var(--ink-3)" }}>
                {order.email}
              </p>
              <p
                style={{
                  margin: "26px 0 0",
                  paddingTop: 20,
                  borderTop: "1px solid rgba(201,180,154,0.5)",
                  fontSize: 16,
                  lineHeight: 1.7,
                  color: "var(--muted)",
                }}
              >
                Une question sur cette commande ? Écrivez-nous en précisant le numéro {order.number}.
              </p>
            </aside>
          )}
        </div>
      </section>
    </>
  );
}

const Summary = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p
      className="eyebrow"
      style={{ marginBottom: 10, fontSize: 9, letterSpacing: "0.26em", color: "var(--muted-3)" }}
    >
      {label}
    </p>
    <p style={{ margin: 0, fontFamily: "var(--serif)", fontSize: 24 }}>{value}</p>
  </div>
);

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<section className="section" />}>
      <ConfirmationContent />
    </Suspense>
  );
}
