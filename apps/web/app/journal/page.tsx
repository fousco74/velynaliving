import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ARTICLES } from "@/lib/articles";

export const metadata: Metadata = { title: "Le journal" };

export default function JournalPage() {
  return (
    <>
      <section className="section-tight" style={{ paddingTop: "clamp(56px, 8vw, 120px)" }}>
        <p className="eyebrow" style={{ marginBottom: 24 }}>Le journal</p>
        <h1 className="display" style={{ maxWidth: "22ch" }}>
          Rituels, fragrances <span className="italic">et art de vivre</span>
        </h1>
      </section>

      <section style={{ padding: "0 var(--gutter) clamp(64px, 9vw, 130px)" }}>
        <div className="product-grid">
          {ARTICLES.map((article) => (
            <Link key={article.slug} href={`/journal/${article.slug}`} className="product-card">
              <Image src={article.img} alt={article.title} width={800} height={533} style={{ aspectRatio: "3 / 2", objectFit: "cover", width: "100%" }} />
              <p className="eyebrow" style={{ marginTop: 18, letterSpacing: "0.22em" }}>
                {article.category} — {article.date} — {article.readingTime}
              </p>
              <h2 className="h3" style={{ marginTop: 12 }}>{article.title}</h2>
              <p style={{ margin: "12px 0 0", fontSize: 17, lineHeight: 1.7, color: "var(--muted)" }}>{article.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
