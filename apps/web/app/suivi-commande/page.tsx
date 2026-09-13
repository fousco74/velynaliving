"use client";

import Link from "next/link";
import { useState } from "react";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderStatus } from "@velyna/shared";
import { trackOrder, type Order } from "@/lib/api";
import { OrderDetail } from "@/components/order-detail";

/** Frise linéaire : les statuts d'annulation sortent du parcours nominal. */
const TIMELINE: OrderStatus[] = ["NEW", "PREPARING", "SHIPPED", "DELIVERED"];

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function SuiviPage() {
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const search = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      setOrder(await trackOrder(number.trim(), email.trim()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const reached = order ? TIMELINE.indexOf(order.status as OrderStatus) : -1;
  const cancelled =
    order && !TIMELINE.includes(order.status as OrderStatus) ? (order.status as OrderStatus) : null;

  return (
    <>
      <section
        style={{ padding: "clamp(56px, 8vw, 120px) var(--gutter) clamp(28px, 4vw, 52px)" }}
      >
        <p className="eyebrow" style={{ marginBottom: 24 }}>
          Suivi de commande
        </p>
        <h1 className="display" style={{ maxWidth: "20ch", fontSize: "clamp(38px, 5.4vw, 86px)" }}>
          Où est <span className="italic">ma commande ?</span>
        </h1>
      </section>

      <section style={{ padding: "0 var(--gutter) clamp(64px, 9vw, 130px)" }}>
        <form
          onSubmit={search}
          className="grid12"
          style={{ alignItems: "end", borderTop: "1px solid var(--line)", paddingTop: 28 }}
        >
          <div className="field" style={{ gridColumn: "1 / span 4" }}>
            <label htmlFor="s-num">Numéro de commande</label>
            <input
              id="s-num"
              value={number}
              onChange={(event) => setNumber(event.target.value)}
              placeholder="VL-2026-0001"
              required
            />
          </div>
          <div className="field" style={{ gridColumn: "5 / span 4" }}>
            <label htmlFor="s-mail">E-mail de la commande</label>
            <input
              id="s-mail"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="prenom@exemple.com"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-solid"
            style={{ gridColumn: "9 / span 3", padding: "17px 28px" }}
            disabled={loading}
          >
            {loading ? "Recherche…" : "Rechercher"}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: 40, borderTop: "1px solid var(--line)", paddingTop: 26 }}>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--serif)",
                fontSize: "clamp(22px, 2vw, 30px)",
                letterSpacing: "-0.03em",
              }}
            >
              Aucune commande à ce numéro.
            </p>
            <p className="lead" style={{ margin: "14px 0 22px", maxWidth: "52ch" }}>
              Vérifiez le format (VL-2026-0000) et l&apos;adresse e-mail utilisée lors de
              l&apos;achat. Si le doute persiste, notre service client retrouve votre commande en
              quelques minutes.
            </p>
            <Link href="/contact" className="btn">
              Contacter le service client
            </Link>
          </div>
        )}

        {order && (
          <div style={{ marginTop: 40 }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px 40px",
                alignItems: "baseline",
                borderTop: "1px solid var(--line)",
                paddingTop: 24,
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
                {order.number}
              </p>
              <p className="eyebrow" style={{ letterSpacing: "0.22em" }}>
                Commandée le {dateFmt.format(new Date(order.createdAt))} — {order.municipality},
                Abidjan
              </p>
            </div>

            {cancelled ? (
              <p
                className="lead"
                style={{ marginTop: 30, color: "var(--error)", fontFamily: "var(--serif)", fontSize: 22 }}
              >
                Commande {ORDER_STATUS_LABELS[cancelled].toLowerCase()}.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "clamp(16px, 2vw, 32px)",
                  marginTop: 36,
                }}
              >
                {TIMELINE.map((status, index) => {
                  const done = index <= reached;
                  return (
                    <div key={status} className="timeline-step" data-done={done}>
                      <p
                        className="tag"
                        style={{
                          margin: "0 0 8px",
                          letterSpacing: "0.24em",
                          color: done ? "var(--ink)" : "var(--muted-3)",
                        }}
                      >
                        {ORDER_STATUS_LABELS[status]}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 16,
                          color: done ? "var(--muted)" : "var(--muted-3)",
                        }}
                      >
                        {index === 0
                          ? dateFmt.format(new Date(order.createdAt))
                          : done
                            ? "Effectué"
                            : "À venir"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ marginTop: 44 }}>
              <OrderDetail order={order} />
            </div>
          </div>
        )}
      </section>
    </>
  );
}
