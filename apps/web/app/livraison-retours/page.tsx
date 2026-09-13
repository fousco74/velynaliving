import type { Metadata } from "next";

export const metadata: Metadata = { title: "Livraison et retours" };

const OPTIONS = [
  {
    label: "Abidjan",
    price: "2 000 F CFA",
    text: "Livré en 24 à 48 h dans toutes les communes : Cocody, Plateau, Marcory, Treichville, Yopougon, Abobo, Adjamé, Koumassi, Port-Bouët, Bingerville, Songon.",
  },
  {
    label: "Intérieur du pays",
    price: "5 000 F CFA",
    text: "3 à 5 jours ouvrés, via nos partenaires transporteurs. Un numéro de suivi vous est transmis au départ du colis.",
  },
  {
    label: "Retrait en boutique",
    price: "Gratuit",
    text: "Rue des Jardins, Cocody. Votre commande est prête sous 24 h, du lundi au samedi.",
  },
];

export default function LivraisonPage() {
  return (
    <>
      <section
        style={{ padding: "clamp(56px, 8vw, 120px) var(--gutter) clamp(28px, 4vw, 52px)" }}
      >
        <p className="eyebrow" style={{ marginBottom: 24 }}>
          Service client
        </p>
        <h1 className="display" style={{ maxWidth: "22ch", fontSize: "clamp(38px, 5.6vw, 90px)" }}>
          Livraison <span className="italic">et retours</span>
        </h1>
      </section>

      <section style={{ padding: "0 var(--gutter) clamp(48px, 6vw, 96px)" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "clamp(24px, 3vw, 56px)",
            borderTop: "1px solid var(--line)",
            paddingTop: 28,
          }}
        >
          {OPTIONS.map((option) => (
            <div key={option.label}>
              <p className="eyebrow" style={{ marginBottom: 14, letterSpacing: "0.24em" }}>
                {option.label}
              </p>
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--serif)",
                  fontSize: "clamp(23px, 2vw, 32px)",
                  letterSpacing: "-0.025em",
                }}
              >
                {option.price}
              </p>
              <p style={{ margin: "12px 0 0", fontSize: 17, lineHeight: 1.75, color: "var(--ink-3)" }}>
                {option.text}
              </p>
            </div>
          ))}
        </div>
        <p className="eyebrow" style={{ marginTop: 26, letterSpacing: "0.2em" }}>
          Livraison offerte dès 50 000 F CFA d&apos;achat
        </p>
      </section>

      <section style={{ padding: "0 var(--gutter) clamp(64px, 9vw, 130px)" }}>
        <div className="grid12" style={{ borderTop: "1px solid var(--line)", paddingTop: 28 }}>
          <p className="eyebrow" style={{ gridColumn: "1 / span 3", letterSpacing: "0.3em" }}>
            Retours
          </p>
          <div style={{ gridColumn: "5 / span 7" }} className="prose">
            <h2 className="h3" style={{ marginBottom: 18 }}>
              Quatorze jours pour changer d&apos;avis
            </h2>
            <p style={{ fontSize: 18 }}>
              Vous disposez de quatorze jours à compter de la réception pour nous retourner un
              article, à condition qu&apos;il n&apos;ait pas été ouvert et qu&apos;il soit dans son
              emballage d&apos;origine. Les produits alimentaires descellés, dont le matcha, ne
              peuvent être repris pour des raisons d&apos;hygiène.
            </p>
            <p style={{ fontSize: 18 }}>
              Écrivez à bonjour@velynaliving.com en indiquant votre numéro de commande. Nous vous
              transmettons une étiquette de retour et l&apos;adresse de dépôt. Les frais de retour
              restent à votre charge, sauf erreur de préparation ou article endommagé de notre fait.
            </p>
            <p style={{ fontSize: 18 }}>
              Le remboursement intervient sous sept jours ouvrés après réception et contrôle du
              colis, sur le moyen de paiement d&apos;origine. Un e-mail vous le confirme.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
