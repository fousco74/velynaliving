"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  JOURNAL_STATUSES,
  JOURNAL_STATUS_LABELS,
  estimateReadingTime,
  parseArticleBody,
} from "@velyna/shared";
import { ImageField } from "@/components/image-field";
import {
  ApiError,
  createArticle,
  updateArticle,
  type AdminArticleFull,
  type ArticlePayload,
  type JournalStatusValue,
} from "@/lib/api";

type FormState = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  body: string;
  imageUrl: string;
  readingTime: string;
  publishedAt: string;
  status: JournalStatusValue;
};

const EMPTY: FormState = {
  slug: "",
  title: "",
  category: "",
  excerpt: "",
  body: "",
  imageUrl: "",
  readingTime: "",
  publishedAt: "",
  status: "DRAFT",
};

/**
 * `publishedAt` est stocké à midi UTC : tronquer l'ISO donne donc toujours le
 * bon jour, quel que soit le fuseau du navigateur.
 */
const toDateInput = (value: string | null) => (value ? value.slice(0, 10) : "");

const fromArticle = (article: AdminArticleFull): FormState => ({
  slug: article.slug,
  title: article.title,
  category: article.category ?? "",
  excerpt: article.excerpt ?? "",
  body: article.body ?? "",
  imageUrl: article.imageUrl ?? "",
  readingTime: article.readingTime ?? "",
  publishedAt: toDateInput(article.publishedAt),
  status: article.status,
});

const toSlug = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toPayload = (form: FormState): ArticlePayload => ({
  slug: form.slug.trim(),
  title: form.title.trim(),
  category: form.category.trim(),
  excerpt: form.excerpt.trim(),
  body: form.body.trim(),
  imageUrl: form.imageUrl.trim(),
  readingTime: form.readingTime.trim(),
  // Champ vide → null : un article non daté est un brouillon assumé.
  publishedAt: form.publishedAt === "" ? null : form.publishedAt,
  status: form.status,
});

export const JournalForm = ({ article }: { article?: AdminArticleFull }) => {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(article ? fromArticle(article) : EMPTY);
  const [slugTouched, setSlugTouched] = useState(Boolean(article));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [issues, setIssues] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setIssues([]);
    setNotice("");

    try {
      const payload = toPayload(form);

      if (article) {
        const updated = await updateArticle(article.slug, payload);
        setNotice("Article enregistré.");
        // Le slug fait partie de l'URL : s'il change, on suit.
        if (updated.slug !== article.slug) router.replace(`/admin/journal/${updated.slug}`);
        else router.refresh();
      } else {
        const created = await createArticle(payload);
        router.replace(`/admin/journal/${created.slug}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible.");
      if (err instanceof ApiError && err.issues) {
        setIssues(err.issues.map((issue) => `${issue.path.join(".")} — ${issue.message}`));
      }
    } finally {
      setBusy(false);
    }
  };

  const blocks = parseArticleBody(form.body);

  return (
    <form onSubmit={submit}>
      {notice && <p className="admin-notice">{notice}</p>}
      {error && <p className="field-error">{error}</p>}
      {issues.length > 0 && (
        <ul className="admin-issues">
          {issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      )}

      <section className="admin-panel">
        <h2 className="admin-subtitle">Identité</h2>
        <div className="admin-grid">
          <div className="field">
            <label htmlFor="a-title">Titre</label>
            <input
              id="a-title"
              value={form.title}
              onChange={(event) => {
                set("title", event.target.value);
                if (!slugTouched) set("slug", toSlug(event.target.value));
              }}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="a-slug">Slug (URL publique)</label>
            <input
              id="a-slug"
              value={form.slug}
              onChange={(event) => {
                setSlugTouched(true);
                set("slug", event.target.value);
              }}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="a-category">Catégorie</label>
            <input
              id="a-category"
              value={form.category}
              onChange={(event) => set("category", event.target.value)}
              placeholder="Art de vivre"
            />
            <p className="admin-hint">Sert d&apos;onglet de filtre sur la page du journal.</p>
          </div>

          <ImageField
            id="a-image"
            label="Image"
            value={form.imageUrl}
            onChange={(value) => set("imageUrl", value)}
            hint="Affichée en tête d'article et dans les listes du journal."
          />

          <div className="field">
            <label htmlFor="a-date">Date de publication</label>
            <input
              id="a-date"
              type="date"
              value={form.publishedAt}
              onChange={(event) => set("publishedAt", event.target.value)}
            />
            <p className="admin-hint">Laissée vide, elle se remplit à la première publication.</p>
          </div>

          <div className="field">
            <label htmlFor="a-status">Visibilité</label>
            <select
              id="a-status"
              value={form.status}
              onChange={(event) => set("status", event.target.value as JournalStatusValue)}
            >
              {JOURNAL_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {JOURNAL_STATUS_LABELS[value]}
                </option>
              ))}
            </select>
            <p className="admin-hint">Un brouillon n&apos;apparaît pas dans le journal public.</p>
          </div>

          <div className="field">
            <label htmlFor="a-reading">Temps de lecture</label>
            <input
              id="a-reading"
              value={form.readingTime}
              onChange={(event) => set("readingTime", event.target.value)}
              placeholder={estimateReadingTime(form.body)}
            />
            <p className="admin-hint">
              Vide : calculé automatiquement ({estimateReadingTime(form.body)}).
            </p>
          </div>
        </div>
      </section>

      <section className="admin-panel">
        <h2 className="admin-subtitle">Texte</h2>

        <div className="field mb-6">
          <label htmlFor="a-excerpt">Chapô</label>
          <textarea
            id="a-excerpt"
            rows={3}
            value={form.excerpt}
            onChange={(event) => set("excerpt", event.target.value)}
          />
          <p className="admin-hint">
            Résumé affiché sous le titre et dans les listes. Deux à trois lignes.
          </p>
        </div>

        <div className="field">
          <label htmlFor="a-body">Corps de l&apos;article</label>
          <textarea
            id="a-body"
            rows={18}
            value={form.body}
            onChange={(event) => set("body", event.target.value)}
            className="font-mono text-[15px] leading-[1.7]"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line-soft pt-4">
          <p className="admin-hint m-0">
            Une <strong>ligne vide</strong> sépare deux blocs ·{" "}
            <code className="admin-code">## titre</code> pour un intertitre ·{" "}
            <code className="admin-code">&gt; texte</code> pour une citation
          </p>
          <p className="admin-hint m-0 ml-auto">
            {blocks.length} bloc{blocks.length > 1 ? "s" : ""} ·{" "}
            {blocks.filter((block) => block.kind === "h2").length} intertitre(s) ·{" "}
            {blocks.filter((block) => block.kind === "quote").length} citation(s)
          </p>
        </div>
      </section>

      <div className="admin-form-actions">
        <button type="submit" className="btn btn-solid" disabled={busy}>
          {busy ? "Enregistrement…" : article ? "Enregistrer" : "Créer l'article"}
        </button>
        <Link href="/admin/journal" className="btn">
          Retour à la liste
        </Link>
      </div>
    </form>
  );
};
