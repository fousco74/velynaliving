import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { formatXOF } from "@velyna/shared";
import { getProducts } from "@/lib/api";

export const metadata: Metadata = {
  title: "Velynákaï",
  description: "Matcha de cérémonie premium grade, 50 g — et le rituel qui l'accompagne.",
};

const RITUAL = [
  {
    num: "01",
    title: "Tamiser",
    text: "Deux chashaku au tamis fin : la poudre devient aérienne et sans grumeaux.",
  },
  {
    num: "02",
    title: "Verser",
    text: "70 ml d'eau à 80 °C. Jamais bouillante : l'amertume vient de la chaleur.",
  },
  {
    num: "03",
    title: "Fouetter",
    text: "En W, poignet souple, une minute, jusqu'à une mousse fine et stable.",
  },
  {
    num: "04",
    title: "Déguster",
    text: "Trois gorgées dans les deux minutes, avant que la mousse ne retombe.",
  },
];

const BENEFITS = [
  {
    title: "L-théanine",
    text: "L'acide aminé de l'ombrage modère l'absorption de la caféine : l'attention monte lentement et redescend en pente douce.",
  },
  {
    title: "Énergie sans à-coups",
    text: "Autant de caféine qu'un espresso, sans le pic ni la chute. Idéal en milieu de matinée ou en début d'après-midi.",
  },
  {
    title: "Feuille entière",
    text: "Le matcha n'est pas infusé mais mis en suspension : les catéchines restent dans la tasse plutôt que dans les feuilles usées.",
  },
];

const ORIGIN = [
  ["Origine", "Uji, Kyoto"],
  ["Récolte", "Ichibancha, mai"],
  ["Mouture", "Meule de pierre"],
];

export default async function VelynaKaiPage() {
  const [matcha] = await getProducts({ house: "velyna-kai" });
  if (!matcha) notFound();

  return (
    <div style={{ background: "#fbfaf6" }}>
      <section className="kai-hero" style={{ background: "#4a5228" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "clamp(40px, 6vw, 88px) clamp(20px, 4vw, 64px)",
          }}
        >
          <p className="eyebrow" style={{ marginBottom: 24, color: "rgba(244,245,232,0.78)" }}>
            Marque II — Matcha &amp; rituels
          </p>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(38px, 4.6vw, 76px)",
              lineHeight: 0.96,
              fontWeight: 400,
            }}
          >
            <span className="kai-word thin" style={{ color: "#f4f5e8" }}>
              Velyná
            </span>
            <span className="kai-word bold" style={{ color: "#f4f5e8" }}>
              kaï
            </span>
          </h1>
          <p
            style={{
              margin: "22px 0 0",
              maxWidth: "30ch",
              fontSize: "clamp(17px, 1.3vw, 20px)",
              lineHeight: 1.75,
              color: "rgba(244,245,232,0.82)",
            }}
          >
            Matcha latte de cérémonie, 100 % premium grade, en boîte de 50 g.
          </p>
          <Link
            href={`/produit/${matcha.slug}`}
            className="btn btn-light"
            style={{
              alignSelf: "flex-start",
              marginTop: 32,
              borderColor: "rgba(244,245,232,0.75)",
            }}
          >
            Voir le produit
          </Link>
        </div>
        <div style={{ position: "relative", background: "#7c8446", minHeight: 280 }}>
          <Image
            src="/assets/velynakai-produit.jpeg"
            alt="Boîte de Matcha Latte Velynákaï, 50 g"
            fill
            priority
            sizes="(max-width: 860px) 100vw, 58vw"
            style={{ objectFit: "cover", objectPosition: "50% 76%" }}
          />
        </div>
      </section>

      <section
        className="grid12"
        style={{
          alignItems: "start",
          padding: "clamp(56px, 7vw, 104px) var(--gutter) clamp(48px, 6vw, 88px)",
        }}
      >
        <div style={{ gridColumn: "1 / span 5" }}>
          <p className="eyebrow" style={{ marginBottom: 20, color: "#8f9a82" }}>
            L&apos;intention
          </p>
          <h2 className="h2" style={{ fontSize: "clamp(26px, 2.9vw, 46px)" }}>
            Un instant suspendu,
            <br />
            <span className="italic">mesuré au geste près.</span>
          </h2>
        </div>
        <p
          className="lead"
          style={{
            gridColumn: "7 / span 6",
            margin: 0,
            maxWidth: "58ch",
            fontSize: "clamp(18px, 1.5vw, 21px)",
            color: "#3a3e33",
          }}
        >
          Une collection de matchas premium et de rituels de dégustation conçus pour offrir un
          moment d&apos;équilibre, d&apos;énergie et de sérénité. Chaque création célèbre le plaisir
          d&apos;un instant suspendu, où qualité, esthétique et bien-être ne font qu&apos;un.
        </p>
      </section>

      <section style={{ padding: "0 var(--gutter) clamp(56px, 7vw, 104px)" }}>
        <div
          className="grid12"
          style={{
            alignItems: "stretch",
            borderTop: "1px solid rgba(163,175,150,0.5)",
            paddingTop: "clamp(28px, 3.5vw, 52px)",
          }}
        >
          <div
            style={{ gridRow: 1, gridColumn: "1 / span 6", minHeight: 340, position: "relative" }}
          >
            <Image
              src="/assets/velyna-kai.jpeg"
              alt="Matcha Latte Velynákaï"
              fill
              sizes="(max-width: 860px) 100vw, 50vw"
              style={{ objectFit: "cover", background: "#efede3" }}
            />
          </div>
          <div
            style={{
              gridRow: 1,
              gridColumn: "8 / span 5",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <p
              className="eyebrow"
              style={{ marginBottom: 16, letterSpacing: "0.3em", color: "#8f9a82" }}
            >
              Le produit
            </p>
            <h2 className="h2" style={{ fontSize: "clamp(26px, 2.9vw, 46px)" }}>
              Matcha <span className="italic">Latte</span>
            </h2>
            <p
              style={{
                margin: "20px 0 0",
                maxWidth: "46ch",
                fontSize: 18,
                lineHeight: 1.78,
                color: "#3a3e33",
              }}
            >
              Feuilles de première récolte ombrées trois semaines avant la cueillette, puis broyées
              lentement à la meule de pierre. Une poudre vert jade, dense, sans amertume sèche, qui
              monte en mousse fine et tient longtemps en bouche.
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "18px 28px",
                marginTop: 28,
                paddingTop: 22,
                borderTop: "1px solid rgba(163,175,150,0.5)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--sans)",
                  fontWeight: 300,
                  fontSize: 12,
                  letterSpacing: "0.16em",
                  color: "#4a4e43",
                }}
              >
                {matcha.capacity} — {formatXOF(matcha.price)}
              </span>
              <Link href={`/produit/${matcha.slug}`} className="btn">
                Voir la fiche
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        className="section"
        style={{
          background: "#f4f3ec",
          borderTop: "1px solid rgba(163,175,150,0.45)",
          borderBottom: "1px solid rgba(163,175,150,0.45)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px 32px",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: "clamp(32px, 4vw, 60px)",
          }}
        >
          <p className="eyebrow" style={{ color: "#8f9a82" }}>
            Le rituel
          </p>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--serif)",
              fontStyle: "italic",
              fontSize: "clamp(17px, 1.4vw, 21px)",
              color: "var(--muted)",
            }}
          >
            Quatre gestes, quatre minutes
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "clamp(24px, 3vw, 52px)",
            alignItems: "start",
          }}
        >
          {RITUAL.map((step) => (
            <div
              key={step.num}
              style={{ borderTop: "1px solid rgba(163,175,150,0.6)", paddingTop: 22 }}
            >
              <p
                className="eyebrow"
                style={{ marginBottom: 16, letterSpacing: "0.26em", color: "#8e9b84" }}
              >
                {step.num} — {step.title}
              </p>
              <p style={{ margin: 0, fontSize: 17, lineHeight: 1.72, color: "#3a3e33" }}>
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="grid12" style={{ alignItems: "start" }}>
          <div style={{ gridColumn: "1 / span 5" }}>
            <p
              className="eyebrow"
              style={{ marginBottom: 18, letterSpacing: "0.3em", color: "#8f9a82" }}
            >
              L&apos;origine
            </p>
            <h2 className="h2" style={{ fontSize: "clamp(24px, 2.6vw, 40px)", marginBottom: 20 }}>
              Feuille d&apos;ombre,
              <br />
              <span className="italic">première récolte</span>
            </h2>
            <p
              style={{
                margin: 0,
                maxWidth: "46ch",
                fontSize: 18,
                lineHeight: 1.78,
                color: "#3a3e33",
              }}
            >
              Les théiers sont ombrés trois semaines avant la cueillette : privée de lumière
              directe, la feuille concentre ses acides aminés et perd son amertume. Seule la
              première récolte de mai est retenue, puis broyée lentement à la meule de pierre pour
              ne pas chauffer la poudre.
            </p>
            <dl
              style={{
                margin: "28px 0 0",
                display: "grid",
                gridTemplateColumns: "88px 1fr",
                gap: "12px 20px",
                borderTop: "1px solid rgba(163,175,150,0.5)",
                paddingTop: 22,
                fontFamily: "var(--sans)",
                fontWeight: 300,
              }}
            >
              {ORIGIN.map(([label, value]) => (
                <div key={label} style={{ display: "contents" }}>
                  <dt
                    style={{
                      fontSize: 9,
                      letterSpacing: "0.24em",
                      textTransform: "uppercase",
                      color: "#8f9a82",
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
                      color: "#3a3e33",
                    }}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div style={{ gridColumn: "7 / span 6" }}>
            <p
              className="eyebrow"
              style={{ marginBottom: 18, letterSpacing: "0.3em", color: "#8f9a82" }}
            >
              Les bienfaits
            </p>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {BENEFITS.map((benefit, index) => (
                <div
                  key={benefit.title}
                  style={{
                    borderTop: "1px solid rgba(163,175,150,0.5)",
                    borderBottom:
                      index === BENEFITS.length - 1 ? "1px solid rgba(163,175,150,0.5)" : undefined,
                    padding: "20px 0",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 8px",
                      fontFamily: "var(--serif)",
                      fontSize: "clamp(20px, 1.7vw, 25px)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {benefit.title}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      maxWidth: "52ch",
                      fontSize: 17,
                      lineHeight: 1.72,
                      color: "#4a4e43",
                    }}
                  >
                    {benefit.text}
                  </p>
                </div>
              ))}
            </div>
            <Link
              href="/journal/art-du-matcha"
              className="link-underline"
              style={{
                display: "inline-block",
                marginTop: 26,
                fontSize: 10,
                borderColor: "rgba(163,175,150,0.9)",
              }}
            >
              Lire l&apos;article sur le rituel
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
