import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="grid12"
      style={{
        minHeight: "72vh",
        alignItems: "center",
        padding: "clamp(56px, 8vw, 120px) var(--gutter)",
      }}
    >
      <div style={{ gridColumn: "1 / span 6" }}>
        <p className="eyebrow" style={{ marginBottom: 24 }}>
          Erreur 404
        </p>
        <h1 className="display" style={{ fontSize: "clamp(38px, 5.4vw, 88px)" }}>
          Cette page <span className="italic">s&apos;est évaporée.</span>
        </h1>
        <p className="lead" style={{ margin: "26px 0 0", maxWidth: "48ch" }}>
          Comme une note de tête, elle a disparu plus vite que prévu. Revenons à quelque chose de
          plus tenace.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 32 }}>
          <Link href="/" className="btn btn-solid">
            Accueil
          </Link>
          <Link href="/boutique" className="btn btn-soft">
            Boutique
          </Link>
          <Link href="/journal" className="btn btn-soft">
            Journal
          </Link>
        </div>
      </div>
      <div style={{ gridColumn: "8 / span 5" }}>
        <Image
          src="/assets/minuit-poudre.jpeg"
          alt="Minuit Poudré"
          width={800}
          height={1000}
          sizes="(max-width: 860px) 100vw, 40vw"
          style={{
            width: "100%",
            height: "auto",
            aspectRatio: "4 / 5",
            objectFit: "cover",
            background: "#ede7df",
          }}
        />
      </div>
    </div>
  );
}
