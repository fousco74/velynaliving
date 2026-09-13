import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { formatXOF } from "@velyna/shared";

export const metadata: Metadata = { title: "Les marques" };

export default function MaisonsPage() {
  return (
    <>
      <section
        className="grid12"
        style={{
          alignItems: "end",
          padding: "clamp(56px, 8vw, 120px) var(--gutter) clamp(32px, 5vw, 72px)",
        }}
      >
        <div style={{ gridColumn: "1 / span 7" }}>
          <p className="eyebrow" style={{ marginBottom: 24 }}>
            Les marques
          </p>
          <h1 className="display">
            Deux univers,
            <br />
            une <span className="italic">même exigence</span>
          </h1>
        </div>
        <p className="lead" style={{ gridColumn: "9 / span 4", margin: 0 }}>
          MH VELYNÁ GROUP développe des marques inspirées par le bien-être, le design et l&apos;art
          de vivre. Chaque maison garde sa voix ; ce qu&apos;elles partagent, c&apos;est
          l&apos;attention portée à la matière.
        </p>
      </section>

      <section style={{ padding: "0 var(--gutter) clamp(64px, 9vw, 130px)" }}>
        <BrandRow
          href="/maisons/maison-velyna"
          img="/assets/maison-velyna.jpeg"
          alt="Maison Velyná"
          eyebrow="Marque I — depuis 2024"
          eyebrowColor="var(--muted-2)"
          imgCol="1 / span 6"
          txtCol="8 / span 5"
          title={
            <>
              Maison <span className="italic">Velyná</span>
            </>
          }
          text="Fragrances d'intérieur et objets parfumés. Cinq signatures olfactives capables de créer des souvenirs et des émotions."
          specs={["5 parfums", "250 ml", formatXOF(29900)]}
        />

        <BrandRow
          href="/maisons/velyna-kai"
          img="/assets/velyna-kai.jpeg"
          alt="Velynákaï"
          eyebrow="Marque II — depuis 2025"
          eyebrowColor="var(--kai-soft)"
          imgCol="7 / span 6"
          txtCol="1 / span 5"
          title={
            <>
              <span className="kai-word thin">Velyná</span>
              <span className="kai-word bold">kaï</span>
            </>
          }
          text="Matcha premium et rituels de dégustation. Un instant suspendu, où qualité, esthétique et bien-être ne font qu'un."
          specs={["Matcha cérémonial", "50 g", formatXOF(25000)]}
        />
      </section>
    </>
  );
}

const BrandRow = ({
  href,
  img,
  alt,
  eyebrow,
  eyebrowColor,
  imgCol,
  txtCol,
  title,
  text,
  specs,
}: {
  href: string;
  img: string;
  alt: string;
  eyebrow: string;
  eyebrowColor: string;
  imgCol: string;
  txtCol: string;
  title: React.ReactNode;
  text: string;
  specs: string[];
}) => (
  <Link
    href={href}
    className="grid12 brand-row"
    style={{
      alignItems: "center",
      padding: "clamp(28px, 4vw, 56px) 0",
      borderTop: "1px solid var(--line)",
    }}
  >
    <div style={{ gridRow: 1, gridColumn: imgCol }}>
      <Image
        src={img}
        alt={alt}
        width={900}
        height={675}
        sizes="(max-width: 860px) 100vw, 50vw"
        style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", background: "#ede7df" }}
      />
    </div>
    <div style={{ gridRow: 1, gridColumn: txtCol }}>
      <p className="eyebrow" style={{ marginBottom: 20, letterSpacing: "0.3em", color: eyebrowColor }}>
        {eyebrow}
      </p>
      <h2
        style={{
          margin: 0,
          fontFamily: "var(--serif)",
          fontWeight: 400,
          fontSize: "clamp(30px, 3.4vw, 54px)",
          lineHeight: 1.02,
          letterSpacing: "-0.035em",
        }}
      >
        {title}
      </h2>
      <p className="lead" style={{ margin: "20px 0 0", maxWidth: "44ch" }}>
        {text}
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px 26px",
          marginTop: 22,
          fontFamily: "var(--sans)",
          fontWeight: 300,
          fontSize: 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: eyebrowColor,
        }}
      >
        {specs.map((spec) => (
          <span key={spec}>{spec}</span>
        ))}
      </div>
      <span className="btn" style={{ marginTop: 26 }}>
        Découvrir la marque
      </span>
    </div>
  </Link>
);
