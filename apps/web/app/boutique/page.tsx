import Link from "next/link";
import type { Metadata } from "next";
import { getHouses, getProducts } from "@/lib/api";
import { ProductCard } from "@/components/product-card";

export const metadata: Metadata = { title: "Boutique" };

const SORTS = [
  { key: "nouveaute", label: "Nouveautés" },
  { key: "prix-asc", label: "Prix croissant" },
  { key: "prix-desc", label: "Prix décroissant" },
  { key: "nom", label: "A → Z" },
];

/** ?house=a&house=b arrive sous forme de tableau : on ne garde que la 1re valeur. */
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function BoutiquePage({ searchParams }: PageProps<"/boutique">) {
  const params = await searchParams;
  const house = first(params.house);
  const sort = first(params.sort) ?? "nouveaute";

  const [products, houses] = await Promise.all([getProducts({ house, sort }), getHouses()]);

  const href = (next: { house?: string; sort?: string }) => {
    const params = new URLSearchParams();
    const h = "house" in next ? next.house : house;
    const s = next.sort ?? sort;
    if (h) params.set("house", h);
    if (s !== "nouveaute") params.set("sort", s);
    return params.size ? `/boutique?${params}` : "/boutique";
  };

  const filters = [{ slug: undefined, name: "Toutes" }, ...houses];

  return (
    <>
      <section className="section-tight" style={{ paddingTop: "clamp(56px, 8vw, 120px)" }}>
        <p className="eyebrow" style={{ marginBottom: 24 }}>
          Boutique
        </p>
        <h1 className="display" style={{ maxWidth: "22ch" }}>
          Toutes nos <span className="italic">créations</span>
        </h1>
      </section>

      <section style={{ padding: "0 var(--gutter) clamp(64px, 9vw, 130px)" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px 40px",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid var(--line)",
            borderBottom: "1px solid var(--line)",
            padding: "22px 0",
            marginBottom: "clamp(32px, 5vw, 68px)",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {filters.map((filter) => {
              const active = house === filter.slug;
              return (
                <Link
                  key={filter.slug ?? "all"}
                  href={href({ house: filter.slug })}
                  className="tag"
                  style={{
                    border: "1px solid var(--line-strong)",
                    padding: "10px 20px",
                    letterSpacing: "0.22em",
                    background: active ? "var(--ink)" : "transparent",
                    color: active ? "var(--bg)" : "var(--ink)",
                  }}
                >
                  {filter.name}
                </Link>
              );
            })}
          </div>

          <div
            style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "12px 24px" }}
          >
            <span className="tag" style={{ color: "var(--muted-3)", letterSpacing: "0.22em" }}>
              Trier par
            </span>
            {SORTS.map((option) => (
              <Link
                key={option.key}
                href={href({ sort: option.key })}
                className="tag"
                style={{
                  color: "var(--muted)",
                  letterSpacing: "0.22em",
                  paddingBottom: 4,
                  borderBottom: `1px solid ${sort === option.key ? "var(--ink)" : "transparent"}`,
                }}
              >
                {option.label}
              </Link>
            ))}
            <span className="tag" style={{ color: "var(--muted-2)", letterSpacing: "0.22em" }}>
              {products.length} création{products.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {products.length === 0 ? (
          <p className="lead">Aucune création ne correspond à ce filtre.</p>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
