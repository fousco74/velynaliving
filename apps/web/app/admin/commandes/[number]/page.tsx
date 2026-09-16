"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DELIVERY_OPTIONS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TRANSITIONS,
  OPERATOR_LABELS,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS,
  formatXOF,
  type Operator,
  type OrderStatus,
} from "@velyna/shared";
import {
  getAdminOrder,
  updateOrderStatus,
  updatePaymentStatus,
  type AdminOrder,
  type PaymentStatusValue,
} from "@/lib/api";
import { DateText, Money, PaymentPill, StatusPill } from "@/components/admin-ui";

export default function AdminOrderPage() {
  const { number } = useParams<{ number: string }>();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState("");

  useEffect(() => {
    getAdminOrder(number)
      .then(setOrder)
      .catch((err) => setError(err instanceof Error ? err.message : "Commande introuvable."));
  }, [number]);

  const changeStatus = async (next: OrderStatus) => {
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const updated = await updateOrderStatus(number, next);
      setOrder(updated);
      setNotice(`Statut passé à « ${ORDER_STATUS_LABELS[next]} ».`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Changement impossible.");
    } finally {
      setBusy(false);
    }
  };

  const changePayment = async (next: PaymentStatusValue) => {
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const payment = await updatePaymentStatus(number, next, reference.trim() || undefined);
      setOrder((current) => (current ? { ...current, payment } : current));
      setNotice(`Paiement marqué « ${PAYMENT_STATUS_LABELS[next]} ».`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Changement impossible.");
    } finally {
      setBusy(false);
    }
  };

  if (error && !order) return <p className="field-error">{error}</p>;
  if (!order) return <p className="eyebrow">Chargement…</p>;

  const nextStatuses = ORDER_STATUS_TRANSITIONS[order.status];
  const delivery = DELIVERY_OPTIONS[order.deliveryMethod];

  return (
    <>
      <header className="admin-head">
        <div>
          <Link href="/admin/commandes" className="eyebrow link-underline">
            ← Commandes
          </Link>
          <h1 className="admin-title" style={{ marginTop: 10 }}>
            {order.number}
          </h1>
          <p className="admin-sub" style={{ marginTop: 8 }}>
            Passée le <DateText value={order.createdAt} /> · modifiée le{" "}
            <DateText value={order.updatedAt} />
          </p>
        </div>
        <StatusPill status={order.status} />
      </header>

      {notice && <p className="admin-notice">{notice}</p>}
      {error && <p className="field-error">{error}</p>}

      <section className="admin-section">
        <h2 className="admin-subtitle">Faire avancer la commande</h2>
        {nextStatuses.length === 0 ? (
          <p className="admin-empty">
            Statut terminal : plus aucune transition possible depuis «{" "}
            {ORDER_STATUS_LABELS[order.status]} ».
          </p>
        ) : (
          <div className="admin-actions">
            {nextStatuses.map((next) => (
              <button
                key={next}
                type="button"
                className="btn"
                disabled={busy}
                onClick={() => changeStatus(next)}
                data-danger={next === "CANCELLED" || next === "REFUNDED"}
              >
                {ORDER_STATUS_LABELS[next]}
              </button>
            ))}
          </div>
        )}
        {(nextStatuses.includes("CANCELLED") || nextStatuses.includes("REFUNDED")) && (
          <p className="admin-sub" style={{ marginTop: 14 }}>
            Annuler ou rembourser remet automatiquement les articles en stock.
          </p>
        )}
      </section>

      <div className="admin-cols">
        <section className="admin-section">
          <h2 className="admin-subtitle">Client</h2>
          <dl className="admin-dl">
            <dt>Nom</dt>
            <dd>
              {order.firstName} {order.lastName}
            </dd>
            <dt>E-mail</dt>
            <dd>
              <a href={`mailto:${order.email}`} className="link-underline">
                {order.email}
              </a>
            </dd>
            <dt>Téléphone</dt>
            <dd>
              <a href={`tel:${order.phone.replace(/\s/g, "")}`} className="link-underline">
                {order.phone}
              </a>
            </dd>
            <dt>Livraison</dt>
            <dd>
              {delivery.label} — {delivery.detail}
            </dd>
            <dt>Adresse</dt>
            <dd>
              {order.address ?? <span className="admin-sub">Retrait boutique</span>}
              <span className="admin-sub">{order.municipality}, Abidjan</span>
            </dd>
            {order.instruction && (
              <>
                <dt>Instruction</dt>
                <dd>{order.instruction}</dd>
              </>
            )}
          </dl>
        </section>

        <section className="admin-section">
          <h2 className="admin-subtitle">Paiement</h2>
          {order.payment ? (
            <>
              <dl className="admin-dl">
                <dt>Opérateur</dt>
                <dd>{OPERATOR_LABELS[order.payment.operator as Operator]}</dd>
                <dt>Montant</dt>
                <dd>
                  <Money amount={order.payment.amount} />
                </dd>
                <dt>Statut</dt>
                <dd>
                  <PaymentPill status={order.payment.status} />
                </dd>
                {order.payment.reference && (
                  <>
                    <dt>Référence</dt>
                    <dd>{order.payment.reference}</dd>
                  </>
                )}
              </dl>

              <div className="field" style={{ margin: "22px 0 16px" }}>
                <label htmlFor="p-ref">Référence de transaction</label>
                <input
                  id="p-ref"
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  placeholder="WAVE-88213"
                />
              </div>

              <div className="admin-actions">
                {PAYMENT_STATUSES.filter((value) => value !== order.payment!.status).map(
                  (value) => (
                    <button
                      key={value}
                      type="button"
                      className="btn"
                      disabled={busy}
                      onClick={() => changePayment(value)}
                      data-danger={value === "FAILED"}
                    >
                      {PAYMENT_STATUS_LABELS[value]}
                    </button>
                  ),
                )}
              </div>
            </>
          ) : (
            <p className="admin-empty">Aucun paiement rattaché.</p>
          )}
        </section>
      </div>

      <section className="admin-section">
        <h2 className="admin-subtitle">Articles</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Référence</th>
                <th className="num">Qté</th>
                <th className="num">Prix unitaire</th>
                <th className="num">Ligne</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.productRef}>
                  <td>
                    <span className="admin-product">
                      <Image
                        src={item.product.img}
                        alt=""
                        width={44}
                        height={44}
                        style={{ objectFit: "cover" }}
                      />
                      <span>
                        {item.productName}
                        <span className="admin-sub">{item.product.capacity}</span>
                      </span>
                    </span>
                  </td>
                  <td>{item.productRef}</td>
                  <td className="num">{item.quantity}</td>
                  <td className="num">
                    <Money amount={item.unitPrice} />
                  </td>
                  <td className="num">
                    <Money amount={item.unitPrice * item.quantity} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="admin-totals">
          <dt>Sous-total</dt>
          <dd>{formatXOF(order.subTotal)}</dd>
          {order.discount > 0 && (
            <>
              <dt>Remise {order.promoCode}</dt>
              <dd>−{formatXOF(order.discount)}</dd>
            </>
          )}
          <dt>Livraison</dt>
          <dd>{order.deliveryCost === 0 ? "Offerte" : formatXOF(order.deliveryCost)}</dd>
          <dt className="total">Total</dt>
          <dd className="total">{formatXOF(order.total)}</dd>
        </dl>
      </section>
    </>
  );
}
