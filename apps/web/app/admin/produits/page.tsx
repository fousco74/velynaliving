"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { PRODUCT_STATUS_LABELS, formatXOF } from "@velyna/shared";
import {
  imageSrc,
  getAdminHouses,
  getAdminProducts,
  type AdminHouse,
  type AdminProduct,
} from "@/lib/api";

const ProductsView = () => {
  const params = useSearchParams();

  const [house, setHouse] = useState(params.get("house") ?? "");
  const [status, setStatus] = useState("");
  const [houses, setHouses] = useState<AdminHouse[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [threshold, setThreshold] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminHouses()
      .then(setHouses)
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getAdminProducts({
        house: house || undefined,
        status: status || undefined,
      });

      setProducts(result.products);
      setThreshold(result.lowStockThreshold);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, [house, status]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <header className="admin-head">
        <div>
          <p className="eyebrow">Catalogue</p>
          <h1 className="admin-title">
            {products.length} produit{products.length > 1 ? "s" : ""}
          </h1>
        </div>

        <Link href="/admin/produits/nouveau" className="btn btn-solid">
          Nouveau produit
        </Link>
      </header>

      <div className="admin-filters">
        <button type="button" data-active={house === ""} onClick={() => setHouse("")}>
          Toutes maisons
        </button>
        {houses.map((item) => (
          <button
            key={item.slug}
            type="button"
            data-active={house === item.slug}
            onClick={() => setHouse(item.slug)}
          >
            {item.name}
          </button>
        ))}
      </div>

      <div className="admin-filters">
        <button type="button" data-active={status === ""} onClick={() => setStatus("")}>
          Tous statuts
        </button>
        <button type="button" data-active={status === "ONLINE"} onClick={() => setStatus("ONLINE")}>
          En ligne
        </button>
        <button type="button" data-active={status === "DRAFT"} onClick={() => setStatus("DRAFT")}>
          Brouillon
        </button>
      </div>

      {error && <p className="field-error">{error}</p>}

      {loading ? (
        <p className="eyebrow">Chargement…</p>
      ) : products.length === 0 ? (
        <p className="admin-empty">Aucun produit ne correspond à ces critères.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Référence</th>
                <th>Maison</th>
                <th className="num">Prix</th>
                <th className="num">Stock</th>
                <th>Visibilité</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.slug}>
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
                        <span className="admin-sub">{product.capacity}</span>
                      </span>
                    </span>
                  </td>
                  <td>
                    <code className="admin-code">{product.ref}</code>
                  </td>
                  <td>{product.house.name}</td>
                  <td className="num">{formatXOF(product.price)}</td>
                  <td className="num">
                    <span
                      className="pill"
                      data-tone={
                        product.stock === 0 ? "bad" : product.stock <= threshold ? "wait" : "ok"
                      }
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td>
                    <span className="pill" data-tone={product.status === "ONLINE" ? "ok" : "wait"}>
                      {PRODUCT_STATUS_LABELS[product.status]}
                    </span>
                  </td>
                  <td>
                    <Link href={`/admin/produits/${product.slug}`} className="btn">
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
};

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<p className="eyebrow">Chargement…</p>}>
      <ProductsView />
    </Suspense>
  );
}
