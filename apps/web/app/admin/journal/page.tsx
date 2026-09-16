"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { JOURNAL_STATUS_LABELS, formatArticleDate } from "@velyna/shared";
import { imageSrc, getAdminJournal, type AdminArticleRow } from "@/lib/api";

export default function AdminJournalPage() {
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [articles, setArticles] = useState<AdminArticleRow[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getAdminJournal({
        status: status || undefined,
        category: category || undefined,
      });

      setArticles(result.articles);
      setCategories(result.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, [status, category]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <header className="admin-head">
        <div>
          <p className="eyebrow">Journal</p>
          <h1 className="admin-title">
            {articles.length} article{articles.length > 1 ? "s" : ""}
          </h1>
        </div>

        <Link href="/admin/journal/nouveau" className="btn btn-solid">
          Nouvel article
        </Link>
      </header>

      <div className="admin-filters">
        <button type="button" data-active={status === ""} onClick={() => setStatus("")}>
          Tous statuts
        </button>
        <button
          type="button"
          data-active={status === "PUBLISHED"}
          onClick={() => setStatus("PUBLISHED")}
        >
          Publiés
        </button>
        <button type="button" data-active={status === "DRAFT"} onClick={() => setStatus("DRAFT")}>
          Brouillons
        </button>
      </div>

      {categories.length > 0 && (
        <div className="admin-filters">
          <button type="button" data-active={category === ""} onClick={() => setCategory("")}>
            Toutes catégories
          </button>
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              data-active={category === item}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {error && <p className="field-error">{error}</p>}

      {loading ? (
        <p className="eyebrow">Chargement…</p>
      ) : articles.length === 0 ? (
        <p className="admin-empty">Aucun article ne correspond à ces critères.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Article</th>
                <th>Catégorie</th>
                <th>Publication</th>
                <th className="num">Vues</th>
                <th>Visibilité</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.slug}>
                  <td>
                    <span className="admin-product">
                      {article.imageUrl ? (
                        <Image
                          src={imageSrc(article.imageUrl)}
                          alt=""
                          width={44}
                          height={44}
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <span className="inline-block size-11 shrink-0 bg-line-soft" />
                      )}
                      <span>
                        {article.title}
                        <span className="admin-sub">{article.readingTime ?? "—"}</span>
                      </span>
                    </span>
                  </td>
                  <td>{article.category ?? "—"}</td>
                  <td>{formatArticleDate(article.publishedAt) || "—"}</td>
                  <td className="num">{article.views}</td>
                  <td>
                    <span
                      className="pill"
                      data-tone={article.status === "PUBLISHED" ? "ok" : "wait"}
                    >
                      {JOURNAL_STATUS_LABELS[article.status]}
                    </span>
                  </td>
                  <td>
                    <Link href={`/admin/journal/${article.slug}`} className="btn">
                      Modifier
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
