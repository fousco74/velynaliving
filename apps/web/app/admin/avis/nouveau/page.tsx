"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, createAdminReview, getAdminProducts, type AdminProduct } from "@/lib/api";

const RATINGS = [
  { value: 5, label: "5 — Exceptionnel" },
  { value: 4, label: "4 — Très bien" },
  { value: 3, label: "3 — Bien" },
  { value: 2, label: "2 — Moyen" },
  { value: 1, label: "1 — Décevant" },
];

export default function NewReviewPage() {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [form, setForm] = useState({
    productSlug: "",
    name: "",
    email: "",
    rating: "5",
    body: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [issues, setIssues] = useState<string[]>([]);

  useEffect(() => {
    getAdminProducts()
      .then((result) => setProducts(result.products))
      .catch(() => setError("Impossible de charger les produits."));
  }, []);

  const set = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setIssues([]);

    try {
      await createAdminReview({
        productSlug: form.productSlug,
        name: form.name.trim(),
        email: form.email.trim(),
        rating: Number(form.rating),
        body: form.body.trim(),
      });
      router.replace("/admin/avis?statut=APPROVED");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible.");
      if (err instanceof ApiError && err.issues) {
        setIssues(err.issues.map((issue) => `${issue.path.join(".")} — ${issue.message}`));
      }
      setBusy(false);
    }
  };

  return (
    <>
      <header className="admin-head">
        <div>
          <Link href="/admin/avis" className="eyebrow link-underline">
            ← Avis clients
          </Link>
          <h1 className="admin-title" style={{ marginTop: 10 }}>
            Ajouter un avis
          </h1>
          <p className="admin-sub" style={{ marginTop: 8 }}>
            Pour un avis réellement reçu d&apos;un client (WhatsApp, e-mail, boutique), recopié tel
            quel. Il est publié tout de suite sur la fiche produit.
          </p>
        </div>
      </header>

      <form onSubmit={submit}>
        {error && <p className="field-error">{error}</p>}
        {issues.length > 0 && (
          <ul className="admin-issues">
            {issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        )}

        <section className="admin-panel">
          <div className="admin-grid">
            <div className="field">
              <label htmlFor="r-product">Produit</label>
              <select
                id="r-product"
                value={form.productSlug}
                onChange={(event) => set("productSlug", event.target.value)}
                required
              >
                <option value="">Choisir…</option>
                {products.map((product) => (
                  <option key={product.slug} value={product.slug}>
                    {product.name}
                    {product.status === "DRAFT" ? " (brouillon)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="r-rating">Note</label>
              <select
                id="r-rating"
                value={form.rating}
                onChange={(event) => set("rating", event.target.value)}
              >
                {RATINGS.map((rating) => (
                  <option key={rating.value} value={rating.value}>
                    {rating.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="r-name">Nom complet</label>
              <input
                id="r-name"
                value={form.name}
                maxLength={100}
                onChange={(event) => set("name", event.target.value)}
                required
              />
              <p className="admin-hint">Publié en « Prénom N. ».</p>
            </div>

            <div className="field">
              <label htmlFor="r-email">E-mail</label>
              <input
                id="r-email"
                type="email"
                value={form.email}
                onChange={(event) => set("email", event.target.value)}
                required
              />
              <p className="admin-hint">
                Jamais publié. S&apos;il a commandé ce produit : badge « Achat vérifié ».
              </p>
            </div>
          </div>

          <div className="field mt-6">
            <label htmlFor="r-body">Avis</label>
            <textarea
              id="r-body"
              rows={5}
              value={form.body}
              onChange={(event) => set("body", event.target.value)}
              required
            />
          </div>
        </section>

        <div className="admin-actions">
          <button type="submit" className="btn btn-solid" disabled={busy}>
            {busy ? "Enregistrement…" : "Publier l'avis"}
          </button>
          <Link href="/admin/avis" className="btn">
            Annuler
          </Link>
        </div>
      </form>
    </>
  );
}
