"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { describePromo, PROMO_STATE_LABELS, promoState, type PromoState } from "@velyna/shared";
import { Money } from "@/components/admin-ui";
import { getAdminPromoCodes, type AdminPromoCode } from "@/lib/api";

const STATE_TONES: Record<PromoState, string> = {
  ACTIVE: "ok",
  SCHEDULED: "info",
  EXPIRED: "wait",
  EXHAUSTED: "wait",
  DISABLED: "bad",
};

const dayFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** « 1 déc. 2026 → 25 déc. 2026 », « dès le … », « jusqu'au … », « permanent ». */
const period = ({ startsAt, endsAt }: AdminPromoCode) => {
  const from = startsAt && dayFmt.format(new Date(startsAt));
  const to = endsAt && dayFmt.format(new Date(endsAt));
  if (from && to) return `${from} → ${to}`;
  if (from) return `dès le ${from}`;
  if (to) return `jusqu'au ${to}`;
  return "Permanent";
};

export default function AdminPromoCodesPage() {
  const [promos, setPromos] = useState<AdminPromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setPromos(await getAdminPromoCodes());
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Même exception assumée que les autres listes du back-office (voir admin/journal).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  return (
    <>
      <header className="admin-head">
        <div>
          <p className="eyebrow">Codes promo</p>
          <h1 className="admin-title">
            {promos.length} code{promos.length > 1 ? "s" : ""}
          </h1>
        </div>

        <Link href="/admin/codes-promo/nouveau" className="btn btn-solid">
          Nouveau code
        </Link>
      </header>

      {error && <p className="field-error">{error}</p>}

      {loading ? (
        <p className="eyebrow">Chargement…</p>
      ) : promos.length === 0 ? (
        <p className="admin-empty">
          Aucun code pour l&apos;instant. Créez-en un pour votre prochain événement.
        </p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Remise</th>
                <th>Période</th>
                <th className="num">Utilisations</th>
                <th className="num">Remises accordées</th>
                <th>État</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((promo) => {
                const state = promoState(promo);
                return (
                  <tr key={promo.id}>
                    <td>
                      <span className="font-mono tracking-wider">{promo.code}</span>
                      <span className="admin-sub">{promo.label}</span>
                    </td>
                    <td>{describePromo(promo)}</td>
                    <td>{period(promo)}</td>
                    <td className="num">
                      {promo.usedCount}
                      {promo.maxUses !== null && ` / ${promo.maxUses}`}
                    </td>
                    <td className="num">
                      <Money amount={promo.stats.discount} />
                    </td>
                    <td>
                      <span className="pill" data-tone={STATE_TONES[state]}>
                        {PROMO_STATE_LABELS[state]}
                      </span>
                    </td>
                    <td>
                      <Link href={`/admin/codes-promo/${promo.id}`} className="btn">
                        Modifier
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
