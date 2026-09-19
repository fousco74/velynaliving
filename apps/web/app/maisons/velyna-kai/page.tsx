import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { formatXOF } from "@velyna/shared";
import { imageSrc, getProducts, getSiteImages } from "@/lib/api";

export const metadata: Metadata = {
  title: "Velynákaï",
  description: "Matcha latte en poudre, 50 g — et le rituel qui l'accompagne.",
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
  const [[matcha], siteImages] = await Promise.all([
    getProducts({ house: "velyna-kai" }),
    getSiteImages(),
  ]);
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
            Matcha latte en poudre, en boîte de 50 g.
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
        <div className="relative min-h-[58vh] bg-[#7c8446] md:min-h-[640px] lg:min-h-[780px]">
          <Image
            src={imageSrc(siteImages["velyna-kai-hero"])}
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
        <div className="md:col-span-5 md:col-start-1">
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
          className="lead md:col-span-6 md:col-start-7"
          style={{
            margin: 0,
            maxWidth: "58ch",
            fontSize: "clamp(18px, 1.5vw, 21px)",
            color: "#3a3e33",
          }}
        >
          Le matcha est un thé vert japonais réduit en une poudre très fine. Là où le thé vert
          classique s&apos;infuse puis se retire, le matcha se fouette directement dans l&apos;eau
          et se boit entièrement, feuille comprise — d&apos;où sa densité en bouche et son énergie
          longue. Velynákaï en fait un rituel : un moment d&apos;équilibre et de sérénité, où
          qualité, esthétique et bien-être ne font qu&apos;un.
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
          <div className="relative min-h-[300px] sm:min-h-[340px] md:col-span-6 md:col-start-1 md:row-start-1">
            <Image
              src={imageSrc(siteImages["velyna-kai-product"])}
              alt="Matcha Latte Velynákaï"
              fill
              sizes="(max-width: 860px) 100vw, 50vw"
              style={{ objectFit: "contain" }}
            />
          </div>
          <div className="flex flex-col justify-center md:col-span-6 md:col-start-7 md:row-start-1 lg:col-span-5 lg:col-start-8">
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

      <section className="section">
        <div className="grid12" style={{ alignItems: "start" }}>
          <div className="md:col-span-5 md:col-start-1">
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
              className="grid grid-cols-[88px_1fr] gap-x-5 gap-y-3 border-t border-[rgba(163,175,150,0.5)]"
              style={{
                margin: "28px 0 0",
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

          <div className="md:col-span-6 md:col-start-7">
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
