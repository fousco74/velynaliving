import type { Metadata } from "next";

export const metadata: Metadata = { title: "Questions fréquentes" };

const SECTIONS: { heading: string; text: string }[] = [
  {
    "heading": "Quels sont les délais de livraison ?",
    "text": "Abidjan : 24 à 48 h. Intérieur du pays : 3 à 5 jours ouvrés. Retrait en boutique à Cocody : sous 24 h. Les délais courent à compter de la confirmation du règlement."
  },
  {
    "heading": "Comment régler ma commande ?",
    "text": "Vous choisissez votre moyen de règlement à la dernière étape : Orange Money, MTN Money, Moov Money, Wave, carte bancaire ou paiement à la livraison. Aucun montant n'est débité en ligne : nos équipes vous contactent pour finaliser."
  },
  {
    "heading": "La livraison est-elle offerte ?",
    "text": "Oui, dès 50 000 F CFA d'achat, quelle que soit la commune. En dessous : 2 000 F CFA à Abidjan, 5 000 F CFA à l'intérieur du pays, gratuit en retrait boutique."
  },
  {
    "heading": "Puis-je retourner un article ?",
    "text": "Vous disposez de 14 jours après réception. Les produits doivent être non ouverts et dans leur emballage d'origine. Le remboursement intervient sous 7 jours ouvrés après réception du retour."
  },
  {
    "heading": "Combien de temps tient une fragrance ?",
    "text": "Un flacon de 250 ml diffuse environ trois mois dans une pièce de taille moyenne, à raison d'un usage quotidien."
  },
  {
    "heading": "Comment suivre ma commande ?",
    "text": "Rendez-vous sur la page Suivi de commande avec votre numéro VL-2026-XXXX et l'adresse e-mail utilisée lors de la commande."
  }
];

export default function Page() {
  return (
    <>
      <section className="section-tight" style={{ paddingTop: "clamp(56px, 8vw, 120px)" }}>
        <p className="eyebrow" style={{ marginBottom: 24 }}>
          Questions
        </p>
        <h1 className="display" style={{ maxWidth: "24ch", fontSize: "clamp(34px, 4.6vw, 76px)" }}>
          Vos questions, <span className="italic">nos réponses</span>
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
