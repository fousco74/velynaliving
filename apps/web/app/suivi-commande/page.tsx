"use client";

import { useState } from "react";
import { trackOrder, type Order } from "@/lib/api";
import { OrderDetail } from "@/components/order-detail";

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

  return (
    <>
      <section className="section-tight" style={{ paddingTop: "clamp(56px, 8vw, 120px)" }}>
        <p className="eyebrow" style={{ marginBottom: 24 }}>
          Suivi de commande
        </p>
        <h1 className="display" style={{ fontSize: "clamp(38px, 5.4vw, 86px)" }}>
          Où en est <span className="italic">votre commande ?</span>
        </h1>
      </section>

      <section style={{ padding: "0 var(--gutter) clamp(64px, 9vw, 130px)" }}>
        <form onSubmit={search} style={{ maxWidth: 640 }}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="number">Numéro de commande</label>
              <input
                id="number"
                value={number}
                onChange={(event) => setNumber(event.target.value)}
                placeholder="VL-2026-0001"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="prenom@exemple.com"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-solid" style={{ marginTop: 28 }} disabled={loading}>
            {loading ? "Recherche…" : "Retrouver ma commande"}
          </button>

          {error && (
            <p className="field-error" style={{ fontSize: 17, marginTop: 20 }}>
              {error}
            </p>
          )}
        </form>

        {order && (
          <div style={{ marginTop: "clamp(40px, 6vw, 72px)" }}>
            <OrderDetail order={order} />
          </div>
        )}
      </section>
    </>
  );
}
