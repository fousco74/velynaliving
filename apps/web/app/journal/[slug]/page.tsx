import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ARTICLES, getArticle } from "@/lib/articles";

export async function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps<"/journal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  return { title: article?.title ?? "Article", description: article?.excerpt };
}

export default async function ArticlePage({ params }: PageProps<"/journal/[slug]">) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <>
      <section className="section-tight" style={{ paddingTop: "clamp(56px, 8vw, 120px)", maxWidth: 940 }}>
        <p className="eyebrow" style={{ marginBottom: 22, letterSpacing: "0.26em" }}>
          {article.category} — {article.date} — {article.readingTime}
        </p>
        <h1 className="display" style={{ fontSize: "clamp(34px, 4.6vw, 72px)" }}>{article.title}</h1>
        <p className="lead" style={{ margin: "26px 0 0", maxWidth: "56ch", fontStyle: "italic" }}>{article.excerpt}</p>
      </section>

      <section style={{ padding: "0 var(--gutter) clamp(40px, 5vw, 64px)" }}>
        <Image src={article.img} alt={article.title} width={1600} height={900} priority style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover" }} />
      </section>

      <section style={{ padding: "0 var(--gutter) clamp(64px, 9vw, 130px)" }}>
        <div style={{ maxWidth: 720 }}>
          {article.body.map((block, index) => {
            if (block.kind === "h2") {
              return <h2 key={index} className="h3" style={{ margin: "40px 0 16px" }}>{block.text}</h2>;
            }
            if (block.kind === "quote") {
              return (
                <blockquote key={index} style={{ margin: "34px 0", paddingLeft: 24, borderLeft: "1px solid var(--rose)", fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "clamp(20px, 1.8vw, 26px)", lineHeight: 1.5, color: "var(--muted)" }}>
                  {block.text}
                </blockquote>
              );
            }
            return <p key={index} className="lead" style={{ margin: "0 0 20px" }}>{block.text}</p>;
          })}

          <div style={{ marginTop: 48, borderTop: "1px solid var(--line)", paddingTop: 26 }}>
            <Link href="/journal" className="link-underline">Tous les articles</Link>
          </div>
        </div>
      </section>
    </>
  );
}
