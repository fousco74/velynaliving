import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ARTICLES } from "@/lib/articles";

export const metadata: Metadata = { title: "Le journal" };

const CATEGORIES = ["Tous", ...new Set(ARTICLES.map((article) => article.category))];

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function JournalPage({ searchParams }: PageProps<"/journal">) {
  const params = await searchParams;
  const category = first(params.cat) ?? "Tous";

  const articles =
    category === "Tous" ? ARTICLES : ARTICLES.filter((article) => article.category === category);

  const [featured, ...rest] = articles;

  return (
    <>
      <section style={{ padding: "clamp(56px, 8vw, 120px) var(--gutter) clamp(24px, 3vw, 44px)" }}>
        <p className="eyebrow" style={{ marginBottom: 24 }}>
          Le journal
        </p>
        <h1 className="display" style={{ maxWidth: "20ch" }}>
          Notes sur <span className="italic">l&apos;art de vivre</span>
        </h1>
      </section>

      <section style={{ padding: "0 var(--gutter) clamp(64px, 9vw, 130px)" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px 28px",
            alignItems: "baseline",
            justifyContent: "space-between",
            borderTop: "1px solid var(--line)",
            borderBottom: "1px solid var(--line)",
            padding: "16px 0",
            marginBottom: "clamp(28px, 4vw, 56px)",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 26px" }}>
            {CATEGORIES.map((item) => (
              <Link
                key={item}
                href={item === "Tous" ? "/journal" : `/journal?cat=${encodeURIComponent(item)}`}
                className="tag"
                style={{
                  color: "var(--muted)",
                  letterSpacing: "0.22em",
                  paddingBottom: 4,
                  borderBottom: `1px solid ${category === item ? "var(--ink)" : "transparent"}`,
                }}
              >
                {item}
              </Link>
            ))}
          </div>
          <span className="tag" style={{ color: "var(--muted-2)", letterSpacing: "0.22em" }}>
            {articles.length} article{articles.length > 1 ? "s" : ""}
          </span>
        </div>

        {featured && (
          <Link
            href={`/journal/${featured.slug}`}
            className="grid12"
            style={{ alignItems: "center", marginBottom: "clamp(32px, 5vw, 72px)" }}
          >
            <div style={{ gridRow: 1, gridColumn: "1 / span 7" }}>
              <Image
                src={featured.img}
                alt={featured.title}
                width={1200}
                height={750}
                priority
                sizes="(max-width: 860px) 100vw, 58vw"
                style={{
                  width: "100%",
                  height: "auto",
                  aspectRatio: "16 / 10",
                  objectFit: "cover",
                  background: "#ede7df",
                }}
              />
            </div>
            <div style={{ gridRow: 1, gridColumn: "9 / span 4" }}>
              <p className="eyebrow" style={{ marginBottom: 18, letterSpacing: "0.26em" }}>
                {featured.category} — {featured.date} — {featured.readingTime}
              </p>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "var(--serif)",
                  fontWeight: 400,
                  fontSize: "clamp(26px, 2.8vw, 44px)",
                  lineHeight: 1.08,
                  letterSpacing: "-0.032em",
                }}
              >
                {featured.title}
              </h2>
              <p className="lead" style={{ margin: "20px 0 0" }}>
                {featured.excerpt}
              </p>
              <span className="btn" style={{ marginTop: 26 }}>
                Lire l&apos;article
              </span>
            </div>
          </Link>
        )}

        {rest.length > 0 && (
          <div className="product-grid">
            {rest.map((article) => (
              <Link key={article.slug} href={`/journal/${article.slug}`} className="product-card">
                <Image
                  src={article.img}
                  alt={article.title}
                  width={800}
                  height={533}
                  sizes="(max-width: 560px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  style={{
                    aspectRatio: "3 / 2",
                    objectFit: "cover",
                    width: "100%",
                    height: "auto",
                  }}
                />
                <p className="eyebrow" style={{ marginTop: 18, letterSpacing: "0.22em" }}>
                  {article.category} — {article.date} — {article.readingTime}
                </p>
                <h3 className="h3" style={{ marginTop: 12 }}>
                  {article.title}
                </h3>
                <p
                  style={{
                    margin: "12px 0 0",
                    fontSize: 17,
                    lineHeight: 1.7,
                    color: "var(--muted)",
                  }}
                >
                  {article.excerpt}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
