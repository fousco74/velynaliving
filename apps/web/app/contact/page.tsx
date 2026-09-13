"use client";

import Link from "next/link";
import { useState } from "react";

const SUBJECTS = ["Commande", "Produits", "Partenariat", "Presse", "Autre"];

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <section style={{ padding: "clamp(56px, 8vw, 120px) var(--gutter) clamp(28px, 4vw, 52px)" }}>
        <p className="eyebrow" style={{ marginBottom: 24 }}>
          Contact
        </p>
        <h1 className="display" style={{ maxWidth: "18ch", fontSize: "clamp(38px, 5.6vw, 90px)" }}>
          Écrivez-nous, <span className="italic">on répond</span>
        </h1>
      </section>

      <section style={{ padding: "0 var(--gutter) clamp(64px, 9vw, 130px)" }}>
        <div className="grid12" style={{ borderTop: "1px solid var(--line)", paddingTop: 30 }}>
          {sent ? (
            <div style={{ gridColumn: "1 / span 7" }}>
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--serif)",
                  fontSize: "clamp(24px, 2.2vw, 34px)",
                  lineHeight: 1.15,
                  letterSpacing: "-0.03em",
                }}
              >
                Message reçu.
                <br />
                <span className="italic">Nous revenons vers vous sous 24 h ouvrées.</span>
              </p>
              <Link href="/boutique" className="btn" style={{ marginTop: 26 }}>
                Retour à la boutique
              </Link>
            </div>
          ) : (
            <form
              className="form-grid"
              style={{ gridColumn: "1 / span 7" }}
              onSubmit={(event) => {
                event.preventDefault();
                setSent(true);
              }}
            >
              <div className="field">
                <label htmlFor="k-nom">Nom</label>
                <input id="k-nom" name="nom" required placeholder="Aïcha Konaté" />
              </div>
              <div className="field">
                <label htmlFor="k-mail">E-mail</label>
                <input
                  id="k-mail"
                  name="mail"
                  type="email"
                  required
                  placeholder="prenom@exemple.com"
                />
              </div>
              <div className="field span2">
                <label htmlFor="k-objet">Objet</label>
                <select id="k-objet" name="objet" defaultValue={SUBJECTS[0]}>
                  {SUBJECTS.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field span2">
                <label htmlFor="k-msg">Message</label>
                <textarea
                  id="k-msg"
                  name="message"
                  rows={5}
                  required
                  placeholder="Dites-nous tout."
                  style={{ resize: "vertical", lineHeight: 1.6 }}
                />
              </div>
              <div className="span2">
                <button type="submit" className="btn btn-solid" style={{ padding: "17px 40px" }}>
                  Envoyer le message
                </button>
              </div>
            </form>
          )}

          <div
            style={{
              gridColumn: "9 / span 4",
              display: "flex",
              flexDirection: "column",
              gap: "clamp(24px, 3vw, 44px)",
            }}
          >
            <div>
              <p
                className="eyebrow"
                style={{
                  marginBottom: 12,
                  fontSize: 9,
                  letterSpacing: "0.26em",
                  color: "var(--muted-3)",
                }}
              >
                Service client
              </p>
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--serif)",
                  fontSize: "clamp(19px, 1.7vw, 26px)",
                  letterSpacing: "-0.02em",
                }}
              >
                bonjour@velynaliving.com
              </p>
              <p
                style={{ margin: "10px 0 0", fontSize: 17, lineHeight: 1.7, color: "var(--muted)" }}
              >
                +225 27 22 45 18 60
              </p>
            </div>

            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 22 }}>
              <p
                className="eyebrow"
                style={{
                  marginBottom: 12,
                  fontSize: 9,
                  letterSpacing: "0.26em",
                  color: "var(--muted-3)",
                }}
              >
                Horaires
              </p>
              <p style={{ margin: 0, fontSize: 17, lineHeight: 1.7, color: "var(--ink-3)" }}>
                Lundi au vendredi, 9 h – 18 h
                <br />
                Samedi, 10 h – 14 h
              </p>
            </div>

            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 22 }}>
              <p
                className="eyebrow"
                style={{
                  marginBottom: 12,
                  fontSize: 9,
                  letterSpacing: "0.26em",
                  color: "var(--muted-3)",
                }}
              >
                Adresse
              </p>
              <p style={{ margin: 0, fontSize: 17, lineHeight: 1.7, color: "var(--ink-3)" }}>
                MH Velyná Group
                <br />
                Rue des Jardins, Cocody
                <br />
                Abidjan, Côte d&apos;Ivoire
              </p>
            </div>

            <div
              style={{
                borderTop: "1px solid var(--line)",
                paddingTop: 22,
                display: "flex",
                flexWrap: "wrap",
                gap: "14px 26px",
              }}
            >
              <span className="tag" style={{ letterSpacing: "0.24em" }}>
                Instagram
              </span>
              <span className="tag" style={{ letterSpacing: "0.24em" }}>
                Pinterest
              </span>
              <Link href="/faq" className="tag" style={{ letterSpacing: "0.24em" }}>
                Voir la FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
