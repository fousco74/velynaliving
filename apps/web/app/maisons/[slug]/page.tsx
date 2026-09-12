import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getHouses, getProducts } from "@/lib/api";
import { ProductCard } from "@/components/product-card";

const COPY: Record<string, { title: string; eyebrow: string; img: string; text: string }> = {
  "maison-velyna": {
    title: "Maison Velyná",
    eyebrow: "Marque I",
    img: "/assets/les-5-parfums.jpeg",
    text: "Cinq signatures olfactives pour la maison — bois, ambres, muscs et iris, pensés comme des souvenirs que l'on habite. Chaque fragrance a été composée pour une pièce, une heure, une intensité.",
  },
  "velyna-kai": {
    title: "Velynákaï",
    eyebrow: "Marque II",
    img: "/assets/velynakai-produit.jpeg",
    text: "Un matcha de cérémonie issu de feuilles de première récolte, ombrées trois semaines avant la cueillette puis broyées à la meule de pierre. Le rituel compte autant que la poudre.",
  },
};

export async function generateStaticParams() {
  return Object.keys(COPY).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/maisons/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: COPY[slug]?.title ?? "Marque" };
}

export default async function MaisonPage({ params }: PageProps<"/maisons/[slug]">) {
  const { slug } = await params;
  const copy = COPY[slug];
  if (!copy) notFound();

  const houses = await getHouses();
  if (!houses.some((house) => house.slug === slug)) notFound();

  const products = await getProducts({ house: slug });

  return (
    <>
      <section style={{ position: "relative", minHeight: "56vh", display: "flex", alignItems: "flex-end", overflow: "hidden", background: "var(--bg-dark)" }}>
        <Image src={copy.img} alt={copy.title} fill priority sizes="100vw" style={{ objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(28,19,15,0.25) 0%, rgba(28,19,15,0.78) 100%)" }} />
        <div style={{ position: "relative", padding: "clamp(40px, 6vw, 90px) var(--gutter)" }}>
          <p className="eyebrow" style={{ color: "var(--rose)", marginBottom: 18 }}>{copy.eyebrow}</p>
          <h1 className="display" style={{ color: "var(--bg)" }}>{copy.title}</h1>
        </div>
      </section>

      <section className="section">
        <div className="grid12">
          <p className="eyebrow" style={{ gridColumn: "1 / span 3" }}>La marque</p>
          <p className="lead" style={{ gridColumn: "4 / span 8", margin: 0, maxWidth: "60ch" }}>{copy.text}</p>
        </div>
      </section>

      <section style={{ padding: "0 var(--gutter) clamp(64px, 9vw, 130px)" }}>
        <p className="eyebrow" style={{ borderTop: "1px solid var(--line)", paddingTop: 24, marginBottom: "clamp(28px, 4vw, 56px)" }}>
          Les créations
        </p>
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}
