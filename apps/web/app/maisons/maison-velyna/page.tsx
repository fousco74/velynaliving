import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { formatXOF } from "@velyna/shared";
import { imageSrc, getProductsDetailed, getSiteImages } from "@/lib/api";

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
  const [products, siteImages] = await Promise.all([
    getProductsDetailed({ house: "maison-velyna", sort: "nouveaute" }),
    getSiteImages(),
  ]);

  return (
    <>
      <section
        className="grid12"
        style={{
          alignItems: "end",
          padding: "clamp(56px, 8vw, 120px) var(--gutter) clamp(40px, 6vw, 88px)",
        }}
      >
        <div className="md:col-span-6 md:col-start-1">
          <p className="eyebrow" style={{ marginBottom: 24 }}>
            Marque I — Fragrances d&apos;intérieur
          </p>
          <h1
            className="display"
            style={{ fontSize: "clamp(36px, 6.6vw, 106px)", lineHeight: 0.94 }}
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
        <figure className="m-0 md:col-span-5 md:col-start-8">
          <Image
            src={imageSrc(siteImages["maison-velyna-hero"])}
            alt="Les cinq parfums Maison Velyná alignés"
            width={900}
            height={1200}
            priority
            sizes="(max-width: 860px) 100vw, 40vw"
            className="max-h-[58vh] w-full object-cover object-[50%_100%] md:max-h-[72vh]"
            style={{ height: "auto" }}
          />
          <figcaption className="eyebrow" style={{ marginTop: 14, letterSpacing: "0.22em" }}>
            La collection complète — 250 ml
          </figcaption>
        </figure>
      </section>

      {products.map((product, index) => {
        /*
         * Les rangées alternent : image à gauche, puis à droite. Le placement
         * vit dans des classes à paliers (md: ≥861px, lg: ≥1025px) et non plus
         * en style inline — sous 861px la grille passe à une colonne et les
         * deux blocs doivent simplement s'empiler, image d'abord.
         */
        const left = index % 2 === 0;
        return (
          <section
            key={product.slug}
            className="grid12 border-t border-line lg:min-h-[82vh]"
            style={{
              alignItems: "center",
              padding: "clamp(40px, 6vw, 88px) var(--gutter)",
            }}
          >
            <div
              className={
                left
                  ? "md:col-span-6 md:col-start-1 md:row-start-1"
                  : "md:col-span-6 md:col-start-7 md:row-start-1 lg:mt-[clamp(0px,5vw,80px)]"
              }
            >
              <Image
                src={imageSrc(product.img)}
                alt={product.name}
                width={900}
                height={1125}
                sizes="(max-width: 860px) 100vw, 50vw"
                className="aspect-4/5 w-full bg-[#ede7df] object-cover"
                style={{ height: "auto" }}
              />
            </div>

            <div
              className={
                left
                  ? "md:col-span-5 md:col-start-8 md:row-start-1 lg:col-span-4"
                  : "md:col-span-5 md:col-start-1 md:row-start-1 lg:col-span-4 lg:col-start-2"
              }
            >
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
                className="grid grid-cols-[62px_1fr] gap-x-5 gap-y-3 border-t border-line"
                style={{
                  margin: "30px 0 0",
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
          <div className="md:col-span-4 md:col-start-1">
            <p className="eyebrow" style={{ marginBottom: 20, letterSpacing: "0.3em" }}>
              Le mode d&apos;emploi
            </p>
            <h2 className="h2" style={{ fontSize: "clamp(28px, 3vw, 46px)" }}>
              L&apos;art du parfum <span className="italic">d&apos;intérieur</span>
            </h2>
          </div>
          {/* min(100%, 220px) : sans le min(), une colonne de 220px reste exigée
              même quand la place manque, et la grille déborde de l'écran. */}
          <div
            className="grid gap-[clamp(20px,2.5vw,40px)] md:col-span-7 md:col-start-6"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))" }}
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
