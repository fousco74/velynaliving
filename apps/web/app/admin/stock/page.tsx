"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { PRODUCT_STATUS_LABELS, formatXOF } from "@velyna/shared";
import { imageSrc, getAdminProducts, updateProduct, type AdminProduct } from "@/lib/api";

/** Ligne éditable : le stock se corrige sur place, sans page intermédiaire. */
const StockRow = ({
  product,
  threshold,
  onSaved,
}: {
  product: AdminProduct;
  threshold: number;
  onSaved: (product: AdminProduct) => void;
}) => {
  const [stock, setStock] = useState(String(product.stock));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Le parent recharge la liste après chaque écriture : on resynchronise le
  // champ, sinon il garderait la valeur tapée avant le rechargement. Ajusté
  // pendant le rendu plutôt que dans un effet, pour éviter la cascade.
  const [syncedStock, setSyncedStock] = useState(product.stock);

  if (product.stock !== syncedStock) {
    setSyncedStock(product.stock);
    setStock(String(product.stock));
  }

  const dirty = stock !== String(product.stock);

  const save = async () => {
    const value = Number(stock);

    if (!Number.isInteger(value) || value < 0) {
      setError("Entier positif attendu.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      onSaved(await updateProduct(product.slug, { stock: value }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  };

  const toggleStatus = async () => {
    setBusy(true);
    setError("");

    try {
      onSaved(
        await updateProduct(product.slug, {
          status: product.status === "ONLINE" ? "DRAFT" : "ONLINE",
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  };

  const level = product.stock === 0 ? "bad" : product.stock <= threshold ? "wait" : "ok";

  return (
    <tr>
      <td>
        <span className="admin-product">
          <Image
            src={imageSrc(product.img)}
            alt=""
            width={44}
            height={44}
            style={{ objectFit: "cover" }}
          />
          <span>
            {product.name}
            <span className="admin-sub">
              {product.house.name} · {product.capacity}
            </span>
          </span>
        </span>
      </td>
      <td>{product.ref}</td>
      <td className="num">{formatXOF(product.price)}</td>
      <td>
        <span className="pill" data-tone={level}>
          {product.stock === 0 ? "Épuisé" : `${product.stock} en stock`}
        </span>
      </td>
      <td>
        <div className="admin-stock-edit">
          <input
            type="number"
            min={0}
            value={stock}
            onChange={(event) => setStock(event.target.value)}
            aria-label={`Stock de ${product.name}`}
          />
          <button type="button" className="btn" onClick={save} disabled={busy || !dirty}>
            {busy ? "…" : "Enregistrer"}
          </button>
        </div>
        {error && <p className="field-error">{error}</p>}
      </td>
      <td>
        <button
          type="button"
          className="pill pill-button"
          data-tone={product.status === "ONLINE" ? "ok" : "wait"}
          onClick={toggleStatus}
          disabled={busy}
          title="Basculer en ligne / brouillon"
        >
          {PRODUCT_STATUS_LABELS[product.status]}
        </button>
      </td>
    </tr>
  );
};

export default function AdminStockPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [threshold, setThreshold] = useState(10);
  const [lowOnly, setLowOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const result = await getAdminProducts({ lowStock: lowOnly });
      setProducts(result.products);
      setThreshold(result.lowStockThreshold);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, [lowOnly]);

  /*
   * Exception assumée à `set-state-in-effect`.
   *
   * Tous les `setState` de `load` sont désormais posés APRÈS un `await` :
   * l'effet ne pose plus rien de synchrone. Mais la règle raisonne sur l'appel
   * et ne distingue pas les deux cas. La satisfaire vraiment demanderait
   * d'abandonner le chargement côté client, que le back-office impose : session
   * par cookie httpOnly et filtres interactifs.
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const replace = (updated: AdminProduct) =>
    setProducts((current) => current.map((item) => (item.slug === updated.slug ? updated : item)));

  const alerts = products.filter((item) => item.stock <= threshold).length;

  return (
    <>
      <header className="admin-head">
        <div>
          <p className="eyebrow">Stock</p>
          <h1 className="admin-title">
            {products.length} produit{products.length > 1 ? "s" : ""}
          </h1>
          <p className="admin-sub" style={{ marginTop: 8 }}>
            {alerts} sous le seuil d&apos;alerte ({threshold})
          </p>
        </div>

        <div className="admin-filters">
          <button type="button" data-active={!lowOnly} onClick={() => setLowOnly(false)}>
            Tous
          </button>
          <button type="button" data-active={lowOnly} onClick={() => setLowOnly(true)}>
            Stock faible
          </button>
        </div>
      </header>

      {error && <p className="field-error">{error}</p>}

      {loading ? (
        <p className="eyebrow">Chargement…</p>
      ) : products.length === 0 ? (
        <p className="admin-empty">Aucun produit à afficher.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Référence</th>
                <th className="num">Prix</th>
                <th>État</th>
                <th>Ajuster le stock</th>
                <th>Visibilité</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <StockRow
                  key={product.slug}
                  product={product}
                  threshold={threshold}
                  onSaved={replace}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
