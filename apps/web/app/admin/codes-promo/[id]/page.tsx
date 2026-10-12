"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PROMO_STATE_LABELS, promoState } from "@velyna/shared";
import { Money } from "@/components/admin-ui";
import { PromoForm } from "@/components/promo-form";
import { deletePromoCode, getAdminPromoCode, type AdminPromoCode } from "@/lib/api";

export default function EditPromoCodePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [promo, setPromo] = useState<AdminPromoCode | null>(null);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getAdminPromoCode(Number(id))
      .then(setPromo)
      .catch((err) => setError(err instanceof Error ? err.message : "Code introuvable."));
  }, [id]);

  const remove = async () => {
    if (!promo) return;
    setBusy(true);
    setDeleteError("");

    try {
      await deletePromoCode(promo.id);
      router.replace("/admin/codes-promo");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Suppression impossible.");
      setConfirming(false);
      setBusy(false);
    }
  };

  if (error) return <p className="field-error">{error}</p>;
  if (!promo) return <p className="eyebrow">Chargement…</p>;

  return (
    <>
      <header className="admin-head">
        <div>
          <Link href="/admin/codes-promo" className="eyebrow link-underline">
            ← Codes promo
          </Link>
          <h1 className="admin-title" style={{ marginTop: 10 }}>
            {promo.code}
          </h1>
          <p className="admin-sub" style={{ marginTop: 8 }}>
            {promo.label} · {PROMO_STATE_LABELS[promoState(promo)]}
          </p>
        </div>
      </header>

      <section className="admin-panel">
        <h2 className="admin-subtitle">Bilan</h2>
        <div className="admin-grid">
          <div>
            <p className="eyebrow">Commandes</p>
            <p className="admin-title">{promo.stats.orders}</p>
          </div>
          <div>
            <p className="eyebrow">Remises accordées</p>
            <p className="admin-title">
              <Money amount={promo.stats.discount} />
            </p>
          </div>
          <div>
            <p className="eyebrow">Chiffre d&apos;affaires généré</p>
            <p className="admin-title">
              <Money amount={promo.stats.revenue} />
            </p>
          </div>
        </div>
        <p className="admin-hint" style={{ marginTop: 16 }}>
          Commandes annulées et remboursées exclues.
        </p>
      </section>

      <PromoForm promo={promo} />

      <section className="admin-panel admin-danger">
        <h2 className="admin-subtitle">Supprimer</h2>
        <p className="admin-sub" style={{ marginBottom: 16 }}>
          Seul un code jamais utilisé peut être supprimé. Un code qui a servi garde la trace des
          remises accordées : passez-le en « Désactivé » pour l&apos;arrêter.
        </p>

        {deleteError && <p className="field-error">{deleteError}</p>}

        {confirming ? (
          <div className="admin-actions">
            <button
              type="button"
              className="btn"
              data-danger="true"
              onClick={remove}
              disabled={busy}
            >
              {busy ? "Suppression…" : "Confirmer la suppression"}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => setConfirming(false)}
              disabled={busy}
            >
              Annuler
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn"
            data-danger="true"
            onClick={() => setConfirming(true)}
          >
            Supprimer ce code
          </button>
        )}
      </section>
    </>
  );
}
