import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { formatXOF, FREE_DELIVERY_THRESHOLD } from "@velyna/shared";
import { ApiError, getProduct } from "@/lib/api";
import { AddToCart } from "@/components/add-to-cart";

const load = async (slug: string) => {
  try {
    return await getProduct(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
};

export async function generateMetadata({ params }: PageProps<"/produit/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await load(slug);
  return { title: product.name, description: product.ambiance ?? undefined };
}

export default async function ProductPage({ params }: PageProps<"/produit/[slug]">) {
  const { slug } = await params;
  const product = await load(slug);

  const soldOut = product.stock <= 0;
  const isKai = product.house.slug === "velyna-kai";
  const heroImg = product.imgDetail ?? product.img;

  return (
    <>
      <div
        className="grid12"
        style={{
          padding: "clamp(40px, 6vw, 96px) var(--gutter) clamp(48px, 7vw, 110px)",
          alignItems: "start",
        }}
      >
        <div style={{ gridColumn: "1 / span 6" }}>
          <Image
            src={heroImg}
            alt={product.name}
            width={1200}
            height={1500}
            priority
            sizes="(max-width: 860px) 100vw, 50vw"
            style={{
              width: "100%",
              aspectRatio: product.imgDetail ? "4 / 5" : "3 / 4",
              objectFit: "cover",
              background: product.detailBackground ?? "#ede7df",
            }}
          />
        </div>

        <div style={{ gridColumn: "8 / span 5" }}>
          <p
            className="eyebrow"
            style={{ display: "flex", flexWrap: "wrap", gap: 10, letterSpacing: "0.26em" }}
          >
            <Link href="/boutique">Boutique</Link>
            <span aria-hidden="true">—</span>
            <Link href={`/maisons/${product.house.slug}`}>{product.house.name}</Link>
          </p>

          <h1
            style={{
              margin: "20px 0 0",
              fontFamily: "var(--serif)",
              fontWeight: 400,
              fontSize: "clamp(32px, 3.4vw, 54px)",
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
            }}
          >
            {product.name}
          </h1>

          {product.ambiance && (
            <p
              style={{
                margin: "22px 0 0",
                maxWidth: "34ch",
                fontFamily: "var(--serif)",
                fontStyle: "italic",
                fontSize: "clamp(19px, 1.6vw, 23px)",
                lineHeight: 1.5,
                color: "var(--muted)",
              }}
            >
              {product.ambiance}
            </p>
          )}

          {product.description && (
            <p className="lead" style={{ margin: "18px 0 0", maxWidth: "52ch", color: "var(--ink-2)" }}>
              {product.description}
            </p>
          )}

          <p
            style={{
              margin: "22px 0 0",
              fontFamily: "var(--serif)",
              fontSize: "clamp(21px, 1.7vw, 27px)",
            }}
          >
            {formatXOF(product.price)}
          </p>

          <dl
            style={{
              margin: "30px 0 0",
              display: "grid",
              gridTemplateColumns: "104px 1fr",
              gap: "14px 22px",
              borderTop: "1px solid var(--line)",
              paddingTop: 24,
              fontFamily: "var(--sans)",
              fontWeight: 300,
            }}
          >
            <Spec label="Contenance" value={product.capacity} />
            <Spec label="Référence" value={product.ref} />
            {product.piece && <Spec label="Pour" value={product.piece} />}
            <Spec
              label="Disponibilité"
              value={soldOut ? "Épuisé" : `En stock — ${product.stock}`}
              color={soldOut ? "var(--error)" : undefined}
            />
          </dl>

          <AddToCart product={product} />

          <p className="eyebrow" style={{ marginTop: 14, letterSpacing: "0.18em" }}>
            Livraison offerte dès {formatXOF(FREE_DELIVERY_THRESHOLD)} — Abidjan sous 24-48 h
          </p>
        </div>
      </div>

      {(product.headNote || product.heartNote || product.backgroundNote) && (
        <section
          className="section"
          style={{
            background: isKai ? "#f1f2e6" : "var(--bg-soft)",
            borderTop: "1px solid rgba(201,180,154,0.5)",
          }}
        >
          <p className="eyebrow" style={{ marginBottom: "clamp(24px, 3vw, 48px)" }}>
            {isKai ? "Le profil en bouche" : "Le profil olfactif"}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "clamp(24px, 3.5vw, 72px)",
            }}
          >
            <Note label={isKai ? "Attaque" : "Notes de tête"} value={product.headNote} />
            <Note label={isKai ? "Milieu" : "Notes de cœur"} value={product.heartNote} />
            <Note label={isKai ? "Finale" : "Notes de fond"} value={product.backgroundNote} />
          </div>
        </section>
      )}

      {product.usage && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="grid12">
            <p className="eyebrow" style={{ gridColumn: "1 / span 3" }}>
              L&apos;usage conseillé
            </p>
            <p className="lead" style={{ gridColumn: "4 / span 7", margin: 0, maxWidth: "60ch" }}>
              {product.usage}
            </p>
          </div>
        </section>
      )}
    </>
  );
}

const Spec = ({ label, value, color }: { label: string; value: string; color?: string }) => (
  <>
    <dt
      style={{
        fontSize: 9,
        letterSpacing: "0.24em",
        textTransform: "uppercase",
        color: "var(--muted-3)",
      }}
    >
      {label}
    </dt>
    <dd
      style={{
        margin: 0,
        fontSize: 11,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: color ?? "var(--ink-3)",
      }}
    >
      {value}
    </dd>
  </>
);

const Note = ({ label, value }: { label: string; value: string | null }) =>
  value ? (
    <div style={{ borderTop: "1px solid rgba(201,180,154,0.7)", paddingTop: 22 }}>
      <p
        className="eyebrow"
        style={{ marginBottom: 14, fontSize: 9, letterSpacing: "0.26em", color: "var(--muted-3)" }}
      >
        {label}
      </p>
      <p
        style={{
          margin: 0,
          fontFamily: "var(--serif)",
          fontSize: "clamp(19px, 1.6vw, 25px)",
          lineHeight: 1.3,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </p>
    </div>
  ) : null;
