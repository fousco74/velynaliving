"use client";

import Link from "next/link";
import { useState } from "react";

const FAQS = [
  {
    cat: "Commandes",
    q: "Comment passer commande ?",
    r: "Ajoutez vos articles au panier, puis suivez les trois étapes du tunnel : coordonnées, livraison, règlement. Un numéro au format VL-2026-0000 vous est attribué dès la validation.",
  },
  {
    cat: "Commandes",
    q: "Puis-je modifier ou annuler ma commande ?",
    r: "Tant que la commande n'est pas expédiée, écrivez-nous avec votre numéro : nous modifions ou annulons sans frais. Après expédition, la procédure de retour s'applique.",
  },
  {
    cat: "Commandes",
    q: "Proposez-vous des coffrets cadeaux ?",
    r: "Oui. À l'étape livraison, indiquez-le dans les instructions : emballage maison, carte manuscrite et envoi direct au destinataire, sans mention de prix.",
  },
  {
    cat: "Livraison",
    q: "Quels sont les délais et les tarifs ?",
    r: "Abidjan : 2 000 F CFA, livré en 24 à 48 h. Intérieur du pays : 5 000 F CFA, 3 à 5 jours ouvrés. Retrait en boutique à Cocody : gratuit, sous 24 h. Livraison offerte dès 50 000 F CFA d'achat.",
  },
  {
    cat: "Livraison",
    q: "Livrez-vous en dehors de la Côte d'Ivoire ?",
    r: "Pas encore en libre-service. Pour une expédition dans la sous-région, écrivez-nous : nous établissons un devis au poids réel.",
  },
  {
    cat: "Livraison",
    q: "Comment suivre mon colis ?",
    r: "Saisissez votre numéro de commande et l'e-mail utilisé lors de l'achat sur la page Suivi de commande.",
  },
  {
    cat: "Produits",
    q: "Combien de temps tient un parfum d'ambiance ?",
    r: "Deux pressions parfument une pièce de 20 m² pendant quatre à six heures. Un flacon de 250 ml couvre environ trois mois d'usage quotidien.",
  },
  {
    cat: "Produits",
    q: "Peut-on vaporiser sur les textiles ?",
    r: "Sur les textiles d'ameublement robustes, à 30 cm minimum. Jamais sur la soie, le velours clair ou le lin non traité.",
  },
  {
    cat: "Produits",
    q: "Comment conserver le matcha ?",
    r: "Boîte refermée, à l'abri de la lumière et de la chaleur. Une fois ouverte, la poudre garde toute sa vivacité pendant six semaines.",
  },
  {
    cat: "Produits",
    q: "Vos parfums conviennent-ils aux petits espaces ?",
    r: "Oui, en réduisant à une seule pression. Fleur de Lin et Maison Riviera sont les plus adaptés aux volumes réduits ; Velours d'Ambre demande une pièce d'au moins 20 m².",
  },
  {
    cat: "Retours",
    q: "Quelle est votre politique de retour ?",
    r: "Retours acceptés sous 14 jours, flacon non ouvert et emballage d'origine. Les frais de retour sont à votre charge, sauf erreur de notre part.",
  },
  {
    cat: "Retours",
    q: "Quand suis-je remboursée ?",
    r: "Sous 7 jours ouvrés après réception du retour, sur le moyen de paiement d'origine. Un e-mail confirme le remboursement.",
  },
];

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <section style={{ padding: "clamp(56px, 8vw, 120px) var(--gutter) clamp(28px, 4vw, 52px)" }}>
        <p className="eyebrow" style={{ marginBottom: 24 }}>
          Questions fréquentes
        </p>
        <h1 className="display" style={{ maxWidth: "22ch", fontSize: "clamp(38px, 5.6vw, 90px)" }}>
          Tout ce que <span className="italic">l&apos;on nous demande</span>
        </h1>
      </section>

      <section style={{ padding: "0 var(--gutter) clamp(64px, 9vw, 130px)" }}>
        <div className="grid12">
          <div style={{ gridColumn: "1 / span 3" }}>
            <p className="eyebrow" style={{ marginBottom: 16, letterSpacing: "0.3em" }}>
              Quatre catégories
            </p>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.75, color: "var(--ink-3)" }}>
              Commandes, livraison, produits et retours. Si votre question n&apos;y figure pas,
              écrivez-nous : nous répondons sous 24 h ouvrées.
            </p>
            <Link
              href="/contact"
              className="link-underline"
              style={{ display: "inline-block", marginTop: 22, fontSize: 10 }}
            >
              Nous écrire
            </Link>
          </div>

          <div style={{ gridColumn: "5 / span 7" }}>
            {FAQS.map((item, index) => {
              const isOpen = open === index;
              return (
                <div
                  key={item.q}
                  className="faq-item"
                  style={{ borderTop: "1px solid var(--line)" }}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : index)}
                  >
                    <span
                      style={{
                        fontFamily: "var(--sans)",
                        fontWeight: 300,
                        fontSize: 9,
                        letterSpacing: "0.24em",
                        textTransform: "uppercase",
                        color: "var(--muted-3)",
                      }}
                    >
                      {item.cat}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--serif)",
                        fontSize: "clamp(19px, 1.7vw, 26px)",
                        lineHeight: 1.25,
                        letterSpacing: "-0.025em",
                      }}
                    >
                      {item.q}
                    </span>
                    <span style={{ fontSize: 16, color: "var(--muted-3)" }}>
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="faq-answer">
                      <p
                        style={{
                          margin: 0,
                          maxWidth: "62ch",
                          fontSize: 17,
                          lineHeight: 1.8,
                          color: "var(--ink-2)",
                        }}
                      >
                        {item.r}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{ borderTop: "1px solid var(--line)" }} />
          </div>
        </div>
      </section>
    </>
  );
}
