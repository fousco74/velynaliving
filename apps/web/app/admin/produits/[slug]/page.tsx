"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteProduct, getAdminProduct, type AdminProductFull } from "@/lib/api";
import { ProductForm } from "@/components/product-form";

export default function EditProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<AdminProductFull | null>(null);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getAdminProduct(slug)
      .then(setProduct)
      .catch((err) => setError(err instanceof Error ? err.message : "Produit introuvable."));
  }, [slug]);

  const remove = async () => {
    setBusy(true);
    setDeleteError("");

    try {
      await deleteProduct(slug);
      router.replace("/admin/produits");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Suppression impossible.");
      setConfirming(false);
      setBusy(false);
    }
  };

  if (error) return <p className="field-error">{error}</p>;
  if (!product) return <p className="eyebrow">Chargement…</p>;

  return (
    <>
      <header className="admin-head">
        <div>
          <Link href="/admin/produits" className="eyebrow link-underline">
            ← Produits
          </Link>
          <h1 className="admin-title" style={{ marginTop: 10 }}>
            {product.name}
          </h1>
          <p className="admin-sub" style={{ marginTop: 8 }}>
            {product.house.name} · {product.ref}
            {product.status === "ONLINE" && (
              <>
                {" · "}
                <Link href={`/produit/${product.slug}`} className="link-underline" target="_blank">
                  Voir en boutique ↗
                </Link>
              </>
            )}
          </p>
        </div>
      </header>

      <ProductForm product={product} />

      <section className="admin-panel admin-danger">
        <h2 className="admin-subtitle">Supprimer</h2>
        <p className="admin-sub" style={{ marginBottom: 16 }}>
          Un produit déjà commandé ne peut pas être supprimé : il figure dans l&apos;historique
          comptable. Passez-le en brouillon pour le retirer de la boutique.
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
            Supprimer ce produit
          </button>
        )}
      </section>
    </>
  );
}
