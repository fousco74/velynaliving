import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <section className="section-tight" style={{ paddingTop: "clamp(56px, 8vw, 120px)" }}>
        <p className="eyebrow" style={{ marginBottom: 24 }}>
          Contact
        </p>
        <h1 className="display" style={{ maxWidth: "20ch" }}>
          Nous <span className="italic">écrire</span>
        </h1>
      </section>

      <section style={{ padding: "0 var(--gutter) clamp(64px, 9vw, 130px)" }}>
        <div className="grid12" style={{ alignItems: "start" }}>
          <div style={{ gridColumn: "1 / span 5" }} className="prose">
            <p className="eyebrow" style={{ marginBottom: 18 }}>
              Coordonnées
            </p>
            <p>
              <strong>Service client</strong>
              <br />
              service@velynaliving.com
            </p>
            <p>
              <strong>Téléphone</strong>
              <br />
              +225 07 00 00 00 00
            </p>
            <p>
              <strong>Boutique</strong>
              <br />
              Cocody, Abidjan — Côte d&apos;Ivoire
              <br />
              Du lundi au samedi, 9 h — 18 h
            </p>
          </div>

          <div style={{ gridColumn: "7 / span 6" }}>
            <p className="eyebrow" style={{ marginBottom: 22 }}>
              Votre message
            </p>
            <form
              className="form-grid"
              action="mailto:service@velynaliving.com"
              method="post"
              encType="text/plain"
            >
              <div className="field">
                <label htmlFor="nom">Nom</label>
                <input id="nom" name="nom" required />
              </div>
              <div className="field">
                <label htmlFor="mail">E-mail</label>
                <input id="mail" name="mail" type="email" required />
              </div>
              <div className="field span2">
                <label htmlFor="sujet">Sujet</label>
                <input id="sujet" name="sujet" />
              </div>
              <div className="field span2">
                <label htmlFor="msg">Message</label>
                <textarea id="msg" name="msg" rows={5} required />
              </div>
              <div className="span2">
                <button type="submit" className="btn btn-solid">
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
