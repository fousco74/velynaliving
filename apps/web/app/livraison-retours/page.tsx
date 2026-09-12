import type { Metadata } from "next";

export const metadata: Metadata = { title: "Livraison et retours" };

const SECTIONS: { heading: string; text: string }[] = [
  {
    "heading": "Abidjan",
    "text": "2 000 F CFA — livraison sous 24 à 48 h. Nos livreurs vous appellent avant de se présenter."
  },
  {
    "heading": "Intérieur du pays",
    "text": "5 000 F CFA — livraison sous 3 à 5 jours ouvrés selon la destination."
  },
  {
    "heading": "Retrait en boutique",
    "text": "Gratuit — retrait à Cocody, Abidjan, sous 24 h. Nous vous prévenons dès que votre commande est prête."
  },
  {
    "heading": "Livraison offerte",
    "text": "Dès 50 000 F CFA d'achat, quelle que soit la commune ou le mode choisi."
  },
  {
    "heading": "Retours",
    "text": "Sous 14 jours après réception, produits non ouverts et dans leur emballage d'origine. Écrivez à service@velynaliving.com en indiquant votre numéro de commande : nous vous transmettons l'adresse de dépôt."
  },
  {
    "heading": "Remboursements",
    "text": "Sous 7 jours ouvrés après réception du retour, par le moyen utilisé lors de la commande. Les frais de retour restent à votre charge, sauf erreur de préparation ou article endommagé de notre fait."
  }
];

export default function Page() {
  return (
    <>
      <section className="section-tight" style={{ paddingTop: "clamp(56px, 8vw, 120px)" }}>
        <p className="eyebrow" style={{ marginBottom: 24 }}>
          Livraison et retours
        </p>
        <h1 className="display" style={{ maxWidth: "24ch", fontSize: "clamp(34px, 4.6vw, 76px)" }}>
          Livraison <span className="italic">et retours</span>
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
