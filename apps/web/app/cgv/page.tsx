import type { Metadata } from "next";

export const metadata: Metadata = { title: "Conditions générales de vente" };

const SECTIONS: { heading: string; text: string }[] = [
  {
    heading: "1. Objet",
    text: "Les présentes conditions régissent les ventes conclues sur velynaliving.com, édité par MH VELYNÁ GROUP, Cocody, Abidjan, Côte d'Ivoire.",
  },
  {
    heading: "2. Produits et prix",
    text: "Les parfums d'ambiance Maison Velyná sont proposés en flacon de 250 ml à 29 900 F CFA. Le Matcha Latte Velynákaï est proposé en boîte de 50 g à 25 000 F CFA. Les prix sont indiqués en francs CFA, toutes taxes comprises, hors frais de livraison. Les photographies ont une valeur d'illustration.",
  },
  {
    heading: "3. Commande",
    text: "La commande est ferme dès sa validation. Un numéro au format VL-2026-XXXX vous est attribué. Nos équipes vous contactent pour finaliser le règlement.",
  },
  {
    heading: "4. Livraison",
    text: "Abidjan : 2 000 F CFA, 24 à 48 h. Intérieur du pays : 5 000 F CFA, 3 à 5 jours ouvrés. Retrait gratuit en boutique à Cocody. Livraison offerte dès 50 000 F CFA. Les délais sont donnés à titre indicatif.",
  },
  {
    heading: "5. Droit de rétractation",
    text: "Vous disposez de 14 jours à compter de la réception pour retourner un produit non ouvert dans son emballage d'origine. Remboursement sous 7 jours ouvrés après réception du retour.",
  },
  {
    heading: "6. Codes promotionnels",
    text: "Un seul code par commande. Le code VELYNA10 accorde 10 % de remise sur le sous-total. La remise s'applique avant le calcul du seuil de livraison offerte.",
  },
  {
    heading: "7. Droit applicable",
    text: "Les présentes conditions sont soumises au droit ivoirien. Tout litige relève des tribunaux compétents d'Abidjan.",
  },
];

export default function Page() {
  return (
    <>
      <section className="section-tight" style={{ paddingTop: "clamp(56px, 8vw, 120px)" }}>
        <p className="eyebrow" style={{ marginBottom: 24 }}>
          CGV
        </p>
        <h1 className="display" style={{ maxWidth: "24ch", fontSize: "clamp(34px, 4.6vw, 76px)" }}>
          Conditions générales <span className="italic">de vente</span>
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
