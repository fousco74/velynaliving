import type { Metadata } from "next";

export const metadata: Metadata = { title: "Politique de confidentialité" };

const SECTIONS: { heading: string; text: string }[] = [
  {
    "heading": "Données collectées",
    "text": "Lors d'une commande, nous collectons vos nom, prénom, adresse e-mail, numéro de téléphone, adresse de livraison et commune. Ces données sont strictement nécessaires au traitement de votre commande."
  },
  {
    "heading": "Finalités",
    "text": "Vos données servent à préparer et livrer votre commande, vous contacter pour le règlement, et répondre à vos demandes. Elles ne sont jamais revendues."
  },
  {
    "heading": "Conservation",
    "text": "Les données de commande sont conservées le temps nécessaire au suivi commercial et comptable, puis archivées conformément aux obligations légales."
  },
  {
    "heading": "Vos droits",
    "text": "Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Écrivez à service@velynaliving.com depuis l'adresse utilisée lors de la commande."
  },
  {
    "heading": "Cookies",
    "text": "Le site utilise le stockage local de votre navigateur pour mémoriser le contenu de votre panier. Cette donnée reste sur votre appareil et ne nous est jamais transmise."
  }
];

export default function Page() {
  return (
    <>
      <section className="section-tight" style={{ paddingTop: "clamp(56px, 8vw, 120px)" }}>
        <p className="eyebrow" style={{ marginBottom: 24 }}>
          Confidentialité
        </p>
        <h1 className="display" style={{ maxWidth: "24ch", fontSize: "clamp(34px, 4.6vw, 76px)" }}>
          Politique de <span className="italic">confidentialité</span>
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
