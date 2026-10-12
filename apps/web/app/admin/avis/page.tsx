"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { REVIEW_STATUS_LABELS, type ReviewStatus } from "@velyna/shared";
import { DateText } from "@/components/admin-ui";
import { Stars } from "@/components/stars";
import { deleteReview, getAdminReviews, moderateReview, type AdminReview } from "@/lib/api";

const TONES: Record<ReviewStatus, string> = { PENDING: "wait", APPROVED: "ok", REJECTED: "bad" };

const FILTERS: { value: ReviewStatus | ""; label: string }[] = [
  { value: "PENDING", label: "En attente" },
  { value: "APPROVED", label: "Publiés" },
  { value: "REJECTED", label: "Refusés" },
  { value: "", label: "Tous" },
];

export default function AdminReviewsPage() {
  const [status, setStatus] = useState<ReviewStatus | "">("PENDING");
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [counts, setCounts] = useState<Partial<Record<ReviewStatus, number>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const result = await getAdminReviews(status || undefined);
      setReviews(result.reviews);
      setCounts(result.counts);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  // Même exception assumée que les autres listes du back-office (voir admin/journal).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  return (
    <>
      <header className="admin-head">
        <div>
          <p className="eyebrow">Avis clients</p>
          <h1 className="admin-title">{counts.PENDING ?? 0} avis en attente</h1>
          <p className="admin-sub" style={{ marginTop: 8 }}>
            Rien n&apos;apparaît sur le site avant publication. Publiez aussi les avis négatifs
            sincères : un mur d&apos;avis parfaits n&apos;inspire pas confiance.
          </p>
        </div>
      </header>

      <div className="admin-filters">
        {FILTERS.map((filter) => (
          <button
            key={filter.label}
            type="button"
            data-active={status === filter.value}
            onClick={() => setStatus(filter.value)}
          >
            {filter.label}
            {filter.value && ` (${counts[filter.value] ?? 0})`}
          </button>
        ))}
      </div>

      {error && <p className="field-error">{error}</p>}

      {loading ? (
        <p className="eyebrow">Chargement…</p>
      ) : reviews.length === 0 ? (
        <p className="admin-empty">Aucun avis dans cette catégorie.</p>
      ) : (
        reviews.map((review) => (
          <ReviewCard key={review.id} review={review} onChange={() => void load()} />
        ))
      )}
    </>
  );
}

const ReviewCard = ({ review, onChange }: { review: AdminReview; onChange: () => void }) => {
  const [reply, setReply] = useState(review.reply ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError("");
    try {
      await action();
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action impossible.");
      setBusy(false);
    }
  };

  const replyChanged = reply.trim() !== (review.reply ?? "");

  return (
    <article className="admin-panel">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Stars value={review.rating} />
          <span className="pill" data-tone={TONES[review.status]}>
            {REVIEW_STATUS_LABELS[review.status]}
          </span>
          {review.verified && (
            <span className="pill" data-tone="ok">
              Achat vérifié — {review.order?.number}
            </span>
          )}
        </div>
        <Link href={`/produit/${review.product.slug}#avis`} className="admin-sub link-underline">
          {review.product.name} ↗
        </Link>
      </div>

      {review.title && <h2 className="admin-subtitle mt-4 mb-0">{review.title}</h2>}
      <p className="mt-3 mb-0 max-w-[75ch] text-[18px] leading-[1.7] whitespace-pre-line">
        {review.body}
      </p>
      <p className="admin-sub mt-3">
        {review.firstName} {review.lastName} · {review.email} ·{" "}
        <DateText value={review.createdAt} />
      </p>

      <div className="field mt-5">
        <label htmlFor={`reply-${review.id}`}>
          Réponse de la maison — publiée sous l&apos;avis
        </label>
        <textarea
          id={`reply-${review.id}`}
          rows={2}
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          placeholder="Merci pour votre retour…"
        />
      </div>

      {error && <p className="field-error">{error}</p>}

      <div className="admin-actions mt-4">
        {review.status !== "APPROVED" && (
          <button
            type="button"
            className="btn btn-solid"
            disabled={busy}
            onClick={() =>
              run(() =>
                moderateReview(review.id, {
                  status: "APPROVED",
                  ...(replyChanged && { reply: reply.trim() }),
                }),
              )
            }
          >
            Publier{replyChanged ? " avec la réponse" : ""}
          </button>
        )}
        {replyChanged && review.status === "APPROVED" && (
          <button
            type="button"
            className="btn btn-solid"
            disabled={busy}
            onClick={() => run(() => moderateReview(review.id, { reply: reply.trim() }))}
          >
            Enregistrer la réponse
          </button>
        )}
        {review.status !== "REJECTED" && (
          <button
            type="button"
            className="btn"
            disabled={busy}
            onClick={() => run(() => moderateReview(review.id, { status: "REJECTED" }))}
          >
            {review.status === "APPROVED" ? "Retirer du site" : "Refuser"}
          </button>
        )}
        {confirming ? (
          <>
            <button
              type="button"
              className="btn"
              data-danger="true"
              disabled={busy}
              onClick={() => run(() => deleteReview(review.id))}
            >
              Confirmer la suppression
            </button>
            <button type="button" className="btn" onClick={() => setConfirming(false)}>
              Annuler
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn"
            data-danger="true"
            disabled={busy}
            onClick={() => setConfirming(true)}
          >
            Supprimer
          </button>
        )}
      </div>
    </article>
  );
};
