"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderStatus } from "@velyna/shared";
import { getAdminOrders, type OrderRow } from "@/lib/api";
import { DateText, Money, PaymentPill, StatusPill } from "@/components/admin-ui";

const PER_PAGE = 20;

const OrdersView = () => {
  const params = useSearchParams();
  const initialStatus = params.get("status") ?? "";

  const [status, setStatus] = useState(initialStatus);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getAdminOrders({
        status: status || undefined,
        q: query || undefined,
        page,
        perPage: PER_PAGE,
      });

      setRows(result.orders);
      setTotal(result.total);
      setPages(result.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, [status, query, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    setQuery(search.trim());
  };

  const pickStatus = (value: string) => {
    setPage(1);
    setStatus(value);
  };

  return (
    <>
      <header className="admin-head">
        <div>
          <p className="eyebrow">Commandes</p>
          <h1 className="admin-title">
            {total} commande{total > 1 ? "s" : ""}
            {status ? ` — ${ORDER_STATUS_LABELS[status as OrderStatus].toLowerCase()}` : ""}
          </h1>
        </div>

        <form onSubmit={submitSearch} className="admin-search">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Numéro, nom ou e-mail"
            aria-label="Rechercher une commande"
          />
          <button type="submit" className="btn">
            Chercher
          </button>
        </form>
      </header>

      <div className="admin-filters">
        <button type="button" data-active={status === ""} onClick={() => pickStatus("")}>
          Toutes
        </button>
        {ORDER_STATUSES.map((value) => (
          <button
            key={value}
            type="button"
            data-active={status === value}
            onClick={() => pickStatus(value)}
          >
            {ORDER_STATUS_LABELS[value]}
          </button>
        ))}
      </div>

      {error && <p className="field-error">{error}</p>}

      {loading ? (
        <p className="eyebrow">Chargement…</p>
      ) : rows.length === 0 ? (
        <p className="admin-empty">Aucune commande ne correspond à ces critères.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Client</th>
                <th>Commune</th>
                <th>Date</th>
                <th className="num">Articles</th>
                <th>Statut</th>
                <th>Paiement</th>
                <th className="num">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((order) => (
                <tr key={order.number}>
                  <td>
                    <Link href={`/admin/commandes/${order.number}`} className="link-underline">
                      {order.number}
                    </Link>
                  </td>
                  <td>
                    {order.firstName} {order.lastName}
                    <span className="admin-sub">{order.email}</span>
                  </td>
                  <td>{order.municipality}</td>
                  <td>
                    <DateText value={order.createdAt} />
                  </td>
                  <td className="num">{order._count.items}</td>
                  <td>
                    <StatusPill status={order.status} />
                  </td>
                  <td>
                    {order.payment ? (
                      <PaymentPill status={order.payment.status} />
                    ) : (
                      <span className="admin-sub">—</span>
                    )}
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

      {pages > 1 && (
        <div className="admin-pager">
          <button type="button" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
            Précédent
          </button>
          <span className="tag">
            Page {page} sur {pages}
          </span>
          <button type="button" onClick={() => setPage((p) => p + 1)} disabled={page >= pages}>
            Suivant
          </button>
        </div>
      )}
    </>
  );
};

/** useSearchParams impose une frontière Suspense côté App Router. */
export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<p className="eyebrow">Chargement…</p>}>
      <OrdersView />
    </Suspense>
  );
}
