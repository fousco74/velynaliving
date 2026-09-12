import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mentions légales" };

const SECTIONS: { heading: string; text: string }[] = [
  {
    "heading": "Éditeur",
    "text": "MH VELYNÁ GROUP — Cocody, Abidjan, Côte d'Ivoire. Contact : service@velynaliving.com."
  },
  {
    "heading": "Directrice de la publication",
    "text": "Mani Axelle Hermine, CEO & Founder."
  },
  {
    "heading": "Hébergement",
    "text": "Le site est hébergé chez un prestataire tiers. Les coordonnées complètes sont communiquées sur simple demande à service@velynaliving.com."
  },
  {
    "heading": "Propriété intellectuelle",
    "text": "L'ensemble des contenus du site — textes, photographies, identités de marque, compositions olfactives — est la propriété exclusive de MH VELYNÁ GROUP. Toute reproduction sans autorisation est interdite."
  },
  {
    "heading": "Crédits",
    "text": "Photographies et direction artistique : MH VELYNÁ GROUP."
  }
];

export default function Page() {
  return (
    <>
      <section className="section-tight" style={{ paddingTop: "clamp(56px, 8vw, 120px)" }}>
        <p className="eyebrow" style={{ marginBottom: 24 }}>
          Mentions légales
        </p>
        <h1 className="display" style={{ maxWidth: "24ch", fontSize: "clamp(34px, 4.6vw, 76px)" }}>
          Mentions <span className="italic">légales</span>
        </h1>
      </section>

      <section style={{ padding: "0 var(--gutter) clamp(64px, 9vw, 130px)" }}>
        <div style={{ maxWidth: 780 }}>
          {SECTIONS.map((section) => (
            <div
              key={section.heading}
              style={{ borderTop: "1px solid var(--line)", padding: "26px 0" }}
            >
              <h2 className="h3" style={{ marginBottom: 12 }}>
                {section.heading}
              </h2>
              <p className="lead" style={{ margin: 0, maxWidth: "62ch" }}>
                {section.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
