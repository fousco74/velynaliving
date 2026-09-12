import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Les marques" };

const BRANDS = [
  {
    slug: "maison-velyna",
    name: "Maison Velyná",
    tagline: "Fragrances d'intérieur",
    img: "/assets/maison-velyna.jpeg",
    text: "Cinq signatures olfactives pour la maison — bois, ambres, muscs et iris, pensés comme des souvenirs que l'on habite.",
  },
  {
    slug: "velyna-kai",
    name: "Velynákaï",
    tagline: "Matcha & rituels",
    img: "/assets/velyna-kai.jpeg",
    text: "Un matcha de cérémonie et le rituel qui l'accompagne. Un instant suspendu, mesuré au geste près.",
  },
];

export default function MaisonsPage() {
  return (
    <>
      <section className="section-tight" style={{ paddingTop: "clamp(56px, 8vw, 120px)" }}>
        <p className="eyebrow" style={{ marginBottom: 24 }}>
          Les marques
        </p>
        <h1 className="display" style={{ maxWidth: "20ch" }}>
          Deux maisons, <span className="italic">un art de vivre</span>
        </h1>
      </section>

      <section style={{ padding: "0 var(--gutter) clamp(64px, 9vw, 130px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "clamp(28px, 4vw, 64px)" }}>
          {BRANDS.map((brand) => (
            <Link key={brand.slug} href={`/maisons/${brand.slug}`}>
              <Image src={brand.img} alt={brand.name} width={900} height={675} style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover" }} />
              <h2 className="h3" style={{ marginTop: 20 }}>{brand.name}</h2>
              <p className="eyebrow" style={{ marginTop: 8, letterSpacing: "0.22em" }}>{brand.tagline}</p>
              <p className="lead" style={{ marginTop: 14, maxWidth: "42ch" }}>{brand.text}</p>
              <span className="link-underline" style={{ display: "inline-block", marginTop: 20 }}>Découvrir</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
