import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { formatXOF } from "@velyna/shared";
import { imageSrc, getProductsDetailed } from "@/lib/api";

export const metadata: Metadata = {
  title: "Maison Velyná",
  description: "Fragrances d'intérieur — cinq signatures olfactives, 250 ml.",
};

const HOW_TO = [
  {
    title: "Doser",
    text: "Deux pressions pour vingt mètres carrés. La troisième ne renforce pas, elle sature.",
  },
  {
    title: "Placer",
    text: "Vers le haut de la pièce, à 30 cm minimum. Jamais sur la soie ni le lin non traité.",
  },
  {
    title: "Diffuser",
    text: "Quatre à six heures de tenue. Vaporisez vingt minutes avant de recevoir.",
  },
];

export default async function MaisonVelynaPage() {
  const products = await getProductsDetailed({ house: "maison-velyna", sort: "nouveaute" });

  return (
    <>
      <section
        className="grid12"
        style={{
          alignItems: "end",
          padding: "clamp(56px, 8vw, 120px) var(--gutter) clamp(40px, 6vw, 88px)",
        }}
      >
        <div style={{ gridColumn: "1 / span 6" }}>
          <p className="eyebrow" style={{ marginBottom: 24 }}>
            Marque I — Fragrances d&apos;intérieur
          </p>
          <h1
            className="display"
            style={{ fontSize: "clamp(40px, 6.6vw, 106px)", lineHeight: 0.94 }}
          >
            Maison <span className="italic">Velyná</span>
          </h1>
          <p
            className="lead"
            style={{ margin: "28px 0 0", maxWidth: "52ch", fontSize: "clamp(18px, 1.5vw, 21px)" }}
          >
            Une maison dédiée aux fragrances d&apos;intérieur et aux objets parfumés qui
            transforment chaque espace en une expérience sensorielle unique. Des parfums
            d&apos;ambiance imaginés comme des signatures olfactives élégantes, capables de créer
            des souvenirs et des émotions.
          </p>
        </div>
        <figure style={{ gridColumn: "8 / span 5", margin: 0 }}>
          <Image
            src="/assets/parfums.jpeg"
            alt="Les cinq parfums Maison Velyná alignés"
            width={900}
            height={1200}
            priority
            sizes="(max-width: 860px) 100vw, 40vw"
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "72vh",
              objectFit: "cover",
              objectPosition: "50% 100%",
            }}
          />
          <figcaption className="eyebrow" style={{ marginTop: 14, letterSpacing: "0.22em" }}>
            La collection complète — 250 ml
          </figcaption>
        </figure>
      </section>

      {products.map((product, index) => {
        const even = index % 2 === 0;
        return (
          <section
            key={product.slug}
            className="grid12 parfum-row"
            style={{
              alignItems: "center",
              minHeight: "82vh",
              padding: "clamp(40px, 6vw, 88px) var(--gutter)",
              borderTop: "1px solid rgba(201,180,154,0.5)",
            }}
          >
            <div
              style={{
                gridRow: 1,
                gridColumn: even ? "1 / span 6" : "7 / span 6",
                marginTop: even ? 0 : "clamp(0px, 5vw, 80px)",
              }}
            >
              <Image
                src={imageSrc(product.img)}
                alt={product.name}
                width={900}
                height={1125}
                sizes="(max-width: 860px) 100vw, 50vw"
                style={{
                  width: "100%",
                  height: "auto",
                  aspectRatio: "4 / 5",
                  objectFit: "cover",
                  background: "#ede7df",
                }}
              />
            </div>

            <div style={{ gridRow: 1, gridColumn: even ? "8 / span 4" : "2 / span 4" }}>
              <p className="eyebrow" style={{ marginBottom: 18, letterSpacing: "0.3em" }}>
                0{index + 1} — {product.capacity}
              </p>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "var(--serif)",
                  fontWeight: 400,
                  fontSize: "clamp(30px, 3.6vw, 58px)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.035em",
                }}
              >
                {product.name}
              </h2>
              {product.ambiance && (
                <p
                  style={{
                    margin: "22px 0 0",
                    maxWidth: "30ch",
                    fontFamily: "var(--serif)",
                    fontStyle: "italic",
                    fontSize: "clamp(18px, 1.5vw, 22px)",
                    lineHeight: 1.5,
                    color: "var(--muted)",
                  }}
                >
                  {product.ambiance}
                </p>
              )}

              <dl
                style={{
                  margin: "30px 0 0",
                  display: "grid",
                  gridTemplateColumns: "62px 1fr",
                  gap: "13px 20px",
                  borderTop: "1px solid var(--line)",
                  paddingTop: 22,
                  fontFamily: "var(--sans)",
                  fontWeight: 300,
                }}
              >
                <Note label="Tête" value={product.headNote} />
                <Note label="Cœur" value={product.heartNote} />
                <Note label="Fond" value={product.backgroundNote} />
              </dl>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "20px 28px",
                  marginTop: 30,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--sans)",
                    fontWeight: 300,
                    fontSize: 12,
                    letterSpacing: "0.16em",
                    color: "var(--muted)",
                  }}
                >
                  {formatXOF(product.price)}
                </span>
                <Link href={`/produit/${product.slug}`} className="btn">
                  Voir la fiche
                </Link>
              </div>
            </div>
          </section>
        );
      })}

      <section
        className="section"
        style={{ background: "var(--bg-soft)", borderTop: "1px solid rgba(201,180,154,0.5)" }}
      >
        <div className="grid12">
          <div style={{ gridColumn: "1 / span 4" }}>
            <p className="eyebrow" style={{ marginBottom: 20, letterSpacing: "0.3em" }}>
              Le mode d&apos;emploi
            </p>
            <h2 className="h2" style={{ fontSize: "clamp(28px, 3vw, 46px)" }}>
              L&apos;art du parfum <span className="italic">d&apos;intérieur</span>
            </h2>
          </div>
          <div
            style={{
              gridColumn: "6 / span 7",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "clamp(20px, 2.5vw, 40px)",
            }}
          >
            {HOW_TO.map((step) => (
              <div key={step.title} style={{ borderTop: "1px solid var(--line)", paddingTop: 22 }}>
                <p className="eyebrow" style={{ marginBottom: 12, letterSpacing: "0.24em" }}>
                  {step.title}
                </p>
                <p style={{ margin: 0, fontSize: 17, lineHeight: 1.72, color: "var(--ink-3)" }}>
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

const Note = ({ label, value }: { label: string; value: string | null }) =>
  value ? (
    <>
      <dt
        style={{
          fontSize: 9,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: "var(--muted-3)",
        }}
      >
        {label}
      </dt>
      <dd
        style={{
          margin: 0,
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--ink-3)",
        }}
      >
        {value}
      </dd>
    </>
  ) : null;
