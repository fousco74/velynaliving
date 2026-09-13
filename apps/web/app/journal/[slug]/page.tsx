import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ARTICLES, getArticle } from "@/lib/articles";

export async function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/journal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  return { title: article?.title ?? "Article", description: article?.excerpt };
}

export default async function ArticlePage({ params }: PageProps<"/journal/[slug]">) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const others = ARTICLES.filter((item) => item.slug !== article.slug).slice(0, 3);

  return (
    <article>
      <header
        style={{
          maxWidth: 780,
          margin: "0 auto",
          padding: "clamp(48px, 7vw, 104px) var(--gutter) clamp(28px, 3.5vw, 48px)",
          textAlign: "center",
        }}
      >
        <p className="eyebrow" style={{ marginBottom: 22, letterSpacing: "0.3em" }}>
          {article.category}
        </p>
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--serif)",
            fontWeight: 400,
            fontSize: "clamp(32px, 4.4vw, 70px)",
            lineHeight: 1.03,
            letterSpacing: "-0.04em",
          }}
        >
          {article.title}
        </h1>
        <p
          style={{
            margin: "24px auto 0",
            maxWidth: "44ch",
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontSize: "clamp(18px, 1.5vw, 23px)",
            lineHeight: 1.55,
            color: "var(--muted)",
          }}
        >
          {article.excerpt}
        </p>
        <p
          className="eyebrow"
          style={{ marginTop: 24, letterSpacing: "0.24em", color: "var(--muted-3)" }}
        >
          {article.date} — {article.readingTime} de lecture
        </p>
      </header>

      <div style={{ margin: "0 var(--gutter)" }}>
        <Image
          src={article.img}
          alt={article.title}
          width={1600}
          height={700}
          priority
          sizes="100vw"
          style={{
            width: "100%",
            height: "auto",
            aspectRatio: "16 / 7",
            objectFit: "cover",
            background: "#ede7df",
          }}
        />
      </div>

      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "clamp(32px, 4.5vw, 68px) var(--gutter) 0",
        }}
      >
        {article.body.map((block, index) => {
          if (block.kind === "h2") {
            return (
              <h2
                key={index}
                style={{
                  margin: "40px 0 16px",
                  fontFamily: "var(--serif)",
                  fontWeight: 400,
                  fontSize: "clamp(24px, 2.1vw, 32px)",
                  lineHeight: 1.14,
                  letterSpacing: "-0.03em",
                }}
              >
                {block.text}
              </h2>
            );
          }

          if (block.kind === "quote") {
            return (
              <blockquote
                key={index}
                style={{ margin: "36px 0", padding: "0 0 0 26px", borderLeft: "1px solid #c9b49a" }}
              >
                <p
                  style={{
                    margin: 0,
                    fontFamily: "var(--serif)",
                    fontStyle: "italic",
                    fontSize: "clamp(21px, 1.8vw, 28px)",
                    lineHeight: 1.5,
                  }}
                >
                  {block.text}
                </p>
              </blockquote>
            );
          }

          return (
            <p
              key={index}
              style={{
                margin: "0 0 22px",
                fontSize: "clamp(18px, 1.4vw, 20px)",
                lineHeight: 1.82,
                color: "var(--ink-2)",
                textWrap: "pretty",
              }}
            >
              {block.text}
            </p>
          );
        })}
      </div>

      <section className="section">
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 24,
            borderTop: "1px solid var(--line)",
            paddingTop: 24,
            marginBottom: "clamp(28px, 4vw, 56px)",
          }}
        >
          <p className="eyebrow">À lire aussi</p>
          <Link href="/journal" className="eyebrow" style={{ letterSpacing: "0.24em" }}>
            Tous les articles
          </Link>
        </div>
        <div className="product-grid">
          {others.map((item) => (
            <Link key={item.slug} href={`/journal/${item.slug}`} className="product-card">
              <Image
                src={item.img}
                alt={item.title}
                width={800}
                height={533}
                sizes="(max-width: 560px) 100vw, 33vw"
                style={{ aspectRatio: "3 / 2", objectFit: "cover", width: "100%", height: "auto" }}
              />
              <p className="eyebrow" style={{ marginTop: 16, letterSpacing: "0.22em" }}>
                {item.category} — {item.readingTime}
              </p>
              <h3 className="h3" style={{ marginTop: 10 }}>
                {item.title}
              </h3>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
