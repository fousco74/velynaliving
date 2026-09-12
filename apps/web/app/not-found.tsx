import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section" style={{ minHeight: "58vh" }}>
      <p className="eyebrow" style={{ marginBottom: 24 }}>
        Erreur 404
      </p>
      <h1 className="display" style={{ maxWidth: "20ch", fontSize: "clamp(38px, 5.4vw, 86px)" }}>
        Cette page <span className="italic">n&apos;existe pas.</span>
      </h1>
      <p className="lead" style={{ margin: "26px 0 32px", maxWidth: "48ch" }}>
        Le lien est peut-être ancien, ou la création que vous cherchez n&apos;est plus au
        catalogue.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
        <Link href="/boutique" className="btn btn-solid">
          Voir la boutique
        </Link>
        <Link href="/" className="btn">
          Retour à l&apos;accueil
        </Link>
      </div>
    </section>
  );
}
