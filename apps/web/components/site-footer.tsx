import Link from "next/link";

export const SiteFooter = () => (
  <footer className="footer">
    <div className="footer-grid">
      <div>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--serif)",
            fontSize: "clamp(22px, 1.9vw, 28px)",
            letterSpacing: "0.03em",
          }}
        >
          MH VELYNÁ <span className="italic">GROUP</span>
        </p>
        <p
          style={{
            margin: "18px 0 0",
            fontFamily: "var(--sans)",
            fontWeight: 200,
            fontSize: 10,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--ink-3)",
          }}
        >
          Where comfort meets luxury
        </p>
        <p
          style={{
            margin: "18px 0 0",
            maxWidth: "34ch",
            fontSize: 17,
            lineHeight: 1.7,
            color: "var(--ink-2)",
          }}
        >
          Cocody, Abidjan — Côte d&apos;Ivoire
        </p>
      </div>

      <div className="footer-col">
        <p>Les marques</p>
        <Link href="/maisons">Toutes les marques</Link>
        <Link href="/maisons/maison-velyna">Maison Velyná</Link>
        <Link href="/maisons/velyna-kai">
          <span className="kai-word thin">Velyná</span>
          <span className="kai-word bold">kaï</span>
        </Link>
        <Link href="/boutique">Boutique</Link>
      </div>

      <div className="footer-col">
        <p>Service client</p>
        <Link href="/contact">Nous écrire</Link>
        <Link href="/faq">Questions fréquentes</Link>
        <Link href="/livraison-retours">Livraison et retours</Link>
        <Link href="/suivi-commande">Suivi de commande</Link>
      </div>

      <div className="footer-col">
        <p>La maison</p>
        <Link href="/la-maison">MH Velyná Group</Link>
        <Link href="/journal">Le journal</Link>
        <Link href="/mentions-legales">Mentions légales</Link>
        <Link href="/cgv">CGV</Link>
      </div>
    </div>

    <div className="footer-bottom">
      <span>© 2026 MH Velyná Group — Prix en F CFA, toutes taxes comprises</span>
      <span style={{ display: "flex", flexWrap: "wrap", gap: 26 }}>
        <Link href="/mentions-legales">Mentions légales</Link>
        <Link href="/cgv">CGV</Link>
        <Link href="/confidentialite">Confidentialité</Link>
      </span>
    </div>
  </footer>
);
