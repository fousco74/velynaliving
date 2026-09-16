"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, formatXOF } from "@velyna/shared";
import { getStats, type AdminStats } from "@/lib/api";
import { DateText, Money, StatusPill } from "@/components/admin-ui";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : "Chargement impossible."));
  }, []);

  if (error) return <p className="field-error">{error}</p>;
  if (!stats) return <p className="eyebrow">Chargement…</p>;

  const alerts = stats.outOfStock + stats.lowStock;

  return (
    <>
      <header className="admin-head">
        <div>
          <p className="eyebrow">Tableau de bord</p>
          <h1 className="admin-title">Vue d&apos;ensemble</h1>
        </div>
      </header>

      <div className="admin-kpis">
        <article className="admin-kpi">
          <p className="tag">Chiffre d&apos;affaires</p>
          <p className="admin-kpi-value">{formatXOF(stats.revenue)}</p>
          <p className="admin-kpi-note">Hors commandes annulées et remboursées</p>
        </article>

        <article className="admin-kpi">
          <p className="tag">Commandes</p>
          <p className="admin-kpi-value">{stats.orders.total}</p>
          <p className="admin-kpi-note">
            {stats.orders.byStatus.NEW ?? 0} nouvelle
            {(stats.orders.byStatus.NEW ?? 0) > 1 ? "s" : ""} à traiter
          </p>
        </article>

        <article className="admin-kpi" data-alert={stats.pendingPayments > 0}>
          <p className="tag">Paiements en attente</p>
          <p className="admin-kpi-value">{stats.pendingPayments}</p>
          <p className="admin-kpi-note">À confirmer à la main (V1 sans opérateur)</p>
        </article>

        <article className="admin-kpi" data-alert={alerts > 0}>
          <p className="tag">Alertes stock</p>
          <p className="admin-kpi-value">{alerts}</p>
          <p className="admin-kpi-note">
            {stats.outOfStock} épuisé{stats.outOfStock > 1 ? "s" : ""}, {stats.lowStock} sous{" "}
            {stats.lowStockThreshold}
          </p>
        </article>
      </div>

      <section className="admin-section">
        <h2 className="admin-subtitle">Répartition par statut</h2>
        <div className="admin-statuses">
          {ORDER_STATUSES.map((status) => (
            <Link key={status} href={`/admin/commandes?status=${status}`} className="admin-status">
              <span className="admin-status-count">{stats.orders.byStatus[status] ?? 0}</span>
              <span className="tag">{ORDER_STATUS_LABELS[status]}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section-head">
          <h2 className="admin-subtitle">Dernières commandes</h2>
          <Link href="/admin/commandes" className="link-underline">
            Tout voir
          </Link>
        </div>

        {stats.recent.length === 0 ? (
          <p className="admin-empty">Aucune commande pour l&apos;instant.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Numéro</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th className="num">Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((order) => (
                  <tr key={order.number}>
                    <td>
                      <Link href={`/admin/commandes/${order.number}`} className="link-underline">
                        {order.number}
                      </Link>
                    </td>
                    <td>
                      {order.firstName} {order.lastName}
                    </td>
                    <td>
                      <DateText value={order.createdAt} />
                    </td>
                    <td>
                      <StatusPill status={order.status} />
                    </td>
                    <td className="num">
                      <Money amount={order.total} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
