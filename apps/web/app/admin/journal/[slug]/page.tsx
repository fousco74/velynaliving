"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatArticleDate } from "@velyna/shared";
import { deleteArticle, getAdminArticle, type AdminArticleFull } from "@/lib/api";
import { JournalForm } from "@/components/journal-form";

export default function EditArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<AdminArticleFull | null>(null);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getAdminArticle(slug)
      .then(setArticle)
      .catch((err) => setError(err instanceof Error ? err.message : "Article introuvable."));
  }, [slug]);

  const remove = async () => {
    setBusy(true);
    setDeleteError("");

    try {
      await deleteArticle(slug);
      router.replace("/admin/journal");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Suppression impossible.");
      setConfirming(false);
      setBusy(false);
    }
  };

  if (error) return <p className="field-error">{error}</p>;
  if (!article) return <p className="eyebrow">Chargement…</p>;

  return (
    <>
      <header className="admin-head">
        <div>
          <Link href="/admin/journal" className="eyebrow link-underline">
            ← Journal
          </Link>
          <h1 className="admin-title" style={{ marginTop: 10 }}>
            {article.title}
          </h1>
          <p className="admin-sub" style={{ marginTop: 8 }}>
            {[article.category, formatArticleDate(article.publishedAt), `${article.views} vues`]
              .filter(Boolean)
              .join(" · ")}
            {article.status === "PUBLISHED" && (
              <>
                {" · "}
                <Link href={`/journal/${article.slug}`} className="link-underline" target="_blank">
                  Voir dans le journal ↗
                </Link>
              </>
            )}
          </p>
        </div>
      </header>

      <JournalForm article={article} />

      <section className="admin-panel admin-danger">
        <h2 className="admin-subtitle">Supprimer</h2>
        <p className="admin-sub" style={{ marginBottom: 16 }}>
          La suppression est définitive : aucune commande ne référence un article, rien ne le
          retient. Pour le retirer du site sans le perdre, passez-le en brouillon.
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
            Supprimer cet article
          </button>
        )}
      </section>
    </>
  );
}
