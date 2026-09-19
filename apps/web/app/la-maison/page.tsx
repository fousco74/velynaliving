import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { imageSrc, getSiteImages } from "@/lib/api";

export const metadata: Metadata = { title: "À propos" };

const STATS = [
  ["2024", "Première marque"],
  ["2", "Marques lancées"],
  ["6", "Créations au catalogue"],
  ["48 h", "Livraison Abidjan"],
];

const PILLARS = [
  ["Ralentir", "Une ambiance sensorielle harmonieuse et une lumière adaptée."],
  ["Se recentrer", "Des parfums d'intérieur et des matières nobles qui apaisent."],
  ["Se ressourcer", "Une récupération optimisée, une stabilité émotionnelle renforcée."],
];

const BELIEFS = [
  {
    title: (
      <>
        L&apos;usage avant
        <br />
        <span className="italic">l&apos;apparence</span>
      </>
    ),
    text: "Un objet qui ne s'utilise pas tous les jours n'a pas sa place chez nous, quelle que soit sa beauté.",
  },
  {
    title: (
      <>
        Peu de références,
        <br />
        <span className="italic">longtemps</span>
      </>
    ),
    text: "Cinq parfums, un matcha. Pas de collection saisonnière, pas d'édition qui disparaît.",
  },
  {
    title: (
      <>
        Une origine
        <br />
        <span className="italic">nommée</span>
      </>
    ),
    text: "Chaque matière est sourcée chez un producteur identifié, et nous le nommons quand il l'accepte.",
  },
];

export default async function LaMaisonPage() {
  const siteImages = await getSiteImages();

  return (
    <>
      <section
        className="grid12"
        style={{
          alignItems: "end",
          padding: "clamp(48px, 7vw, 104px) var(--gutter) clamp(32px, 4.5vw, 68px)",
        }}
      >
        <div style={{ gridColumn: "1 / span 7" }}>
          <p className="eyebrow" style={{ marginBottom: 22 }}>
            MH Velyná Group
          </p>
          <h1 className="display" style={{ fontSize: "clamp(36px, 5.4vw, 86px)" }}>
            Une maison
            <br />
            qui <span className="italic">crée des marques</span>
          </h1>
          <p
            className="lead"
            style={{ margin: "28px 0 0", maxWidth: "54ch", fontSize: "clamp(18px, 1.5vw, 21px)" }}
          >
            MH VELYNÁ GROUP est une maison créative qui développe des marques inspirées par le
            bien-être, le design et l&apos;art de vivre. VELYNÁLIVING en est l&apos;univers
            lifestyle : une destination où chaque détail a du sens.
          </p>
        </div>
        <figure style={{ gridColumn: "9 / span 4", margin: 0 }}>
          <Image
            src={imageSrc(siteImages["la-maison-logo"])}
            alt="Logo MH Velyná Group"
            width={600}
            height={600}
            priority
            sizes="(max-width: 860px) 100vw, 30vw"
            style={{ width: "100%", height: "auto" }}
          />
        </figure>
      </section>

      <section style={{ padding: "0 var(--gutter) clamp(44px, 6vw, 88px)" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "clamp(24px, 3vw, 56px)",
            borderTop: "1px solid var(--line)",
            paddingTop: 26,
          }}
        >
          {STATS.map(([value, label]) => (
            <div key={label}>
              <p className="stat-value">{value}</p>
              <p className="eyebrow" style={{ marginTop: 12, letterSpacing: "0.22em" }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "0 var(--gutter) clamp(44px, 6vw, 88px)" }}>
        <div className="grid12" style={{ borderTop: "1px solid var(--line)", paddingTop: 28 }}>
          <p className="eyebrow" style={{ gridColumn: "1 / span 3", letterSpacing: "0.3em" }}>
            Vision &amp; histoire
          </p>
          <div style={{ gridColumn: "5 / span 7" }} className="prose">
            <h2
              className="h2"
              style={{ marginBottom: 26, maxWidth: "24ch", fontSize: "clamp(26px, 2.8vw, 44px)" }}
            >
              Des créations qui ont <span className="italic">une intention.</span>
            </h2>
            <p>
              VELYNÁLIVING n&apos;a pas commencé par un produit, mais par une insatisfaction : celle
              de devoir choisir entre des objets bien faits et des objets qui ont une intention. Les
              premiers existent en quantité, les seconds se comptent.
            </p>
            <p>
              Plutôt qu&apos;une marque unique appelée à tout absorber, le groupe a choisi une
              architecture de marques. Maison Velyná pour les fragrances d&apos;intérieur, Velynákaï
              pour le matcha et ses rituels. Deux grammaires distinctes, une même exigence de
              matière.
            </p>
            <p>
              Travailler depuis Abidjan n&apos;est pas anecdotique : le marché ivoirien attend un
              luxe qui parle sa langue, connaît ses climats et livre en quarante-huit heures. Cette
              proximité a façonné les formats, les prix et le service autant que l&apos;esthétique.
            </p>
          </div>
        </div>
      </section>

      <section
        className="section"
        style={{
          background: "#f2eee7",
          borderTop: "1px solid var(--line)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div className="grid12">
          <div style={{ gridColumn: "1 / span 5" }}>
            <p className="eyebrow" style={{ marginBottom: 22 }}>
              Notre approche
            </p>
            <h2 className="h2" style={{ fontSize: "clamp(28px, 3vw, 48px)" }}>
              Votre intérieur,
              <br />
              <span className="italic">votre sanctuaire.</span>
            </h2>
            <Link
              href="/journal/interieur-sanctuaire"
              className="link-underline"
              style={{ display: "inline-block", marginTop: 28, fontSize: 10 }}
            >
              Lire l&apos;article complet
            </Link>
          </div>
          <div style={{ gridColumn: "7 / span 6" }}>
            <p
              className="lead"
              style={{
                margin: "0 0 22px",
                maxWidth: "56ch",
                fontSize: "clamp(18px, 1.45vw, 21px)",
                color: "var(--ink-2)",
              }}
            >
              Nous passons une grande partie de nos journées à l&apos;extérieur, exposés à de
              multiples sollicitations. Nous dépensons continuellement notre énergie, qu&apos;elle
              soit physique, mentale ou émotionnelle, jusqu&apos;à parfois rentrer chez nous
              complètement épuisés.
            </p>
            <p className="lead" style={{ margin: "0 0 22px", maxWidth: "56ch" }}>
              Parce que notre intérieur devrait être bien plus qu&apos;un simple lieu de vie,
              VELYNÁliving a imaginé un univers sophistiqué, pensé pour le confort, l&apos;équilibre
              et le bien-être. À travers ses différentes marques, nous créons des espaces qui
              invitent à ralentir, à se recentrer et à retrouver une énergie profonde.
            </p>
            <p className="lead" style={{ margin: 0, maxWidth: "56ch" }}>
              En transformant votre intérieur en un véritable sanctuaire, vous optimisez votre
              récupération, améliorez votre concentration et renforcez votre stabilité émotionnelle.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "clamp(24px, 3.5vw, 72px)",
            marginTop: "clamp(36px, 4.5vw, 64px)",
            paddingTop: "clamp(24px, 3vw, 44px)",
            borderTop: "1px solid var(--line)",
          }}
        >
          {PILLARS.map(([title, text]) => (
            <div key={title}>
              <p
                className="eyebrow"
                style={{ marginBottom: 12, fontSize: 9, letterSpacing: "0.24em" }}
              >
                {title}
              </p>
              <p style={{ margin: 0, fontSize: 17, lineHeight: 1.7, color: "var(--ink-3)" }}>
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <p className="eyebrow" style={{ marginBottom: "clamp(24px, 3.5vw, 48px)" }}>
          Nos convictions
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "clamp(24px, 4vw, 64px)",
          }}
        >
          {BELIEFS.map((belief, index) => (
            <div key={index} style={{ borderTop: "1px solid var(--line)", paddingTop: 24 }}>
              <h2
                style={{
                  margin: "0 0 16px",
                  fontFamily: "var(--serif)",
                  fontWeight: 400,
                  fontSize: "clamp(22px, 2vw, 30px)",
                  lineHeight: 1.12,
                  letterSpacing: "-0.03em",
                }}
              >
                {belief.title}
              </h2>
              <p style={{ margin: 0, fontSize: 17, lineHeight: 1.75, color: "var(--ink-3)" }}>
                {belief.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ background: "var(--sand)", color: "var(--ink)" }}>
        <div className="grid12" style={{ alignItems: "start" }}>
          <div style={{ gridRow: 1, gridColumn: "1 / span 5" }}>
            <Image
              src={imageSrc(siteImages["la-maison-founder"])}
              alt="Mani Axelle Hermine, fondatrice de MH Velyná Group"
              width={800}
              height={1066}
              sizes="(max-width: 860px) 100vw, 40vw"
              style={{
                width: "100%",
                height: "auto",
                aspectRatio: "3 / 4",
                objectFit: "cover",
                objectPosition: "50% 18%",
                background: "#e8e2da",
              }}
            />
          </div>
          <div style={{ gridRow: 1, gridColumn: "7 / span 6" }}>
            <p
              className="eyebrow"
              style={{ marginBottom: 20, letterSpacing: "0.3em", color: "var(--ink-3)" }}
            >
              CEO &amp; Founder
            </p>
            <h2 className="h2" style={{ fontSize: "clamp(28px, 3.2vw, 50px)" }}>
              Mani Axelle <span className="italic">Hermine</span>
            </h2>
            <p
              style={{
                margin: "24px 0 0",
                maxWidth: "56ch",
                fontSize: "clamp(18px, 1.45vw, 20px)",
                lineHeight: 1.8,
                color: "var(--ink-2)",
              }}
            >
              L&apos;histoire de MH VELYNÁ GROUP est avant tout une histoire personnelle, née
              d&apos;une évolution naturelle et d&apos;une passion qui s&apos;est révélée au fil des
              années.
            </p>
            <p
              style={{
                margin: "20px 0 0",
                maxWidth: "56ch",
                fontSize: 18,
                lineHeight: 1.8,
                color: "var(--ink-3)",
              }}
            >
              En devenant adulte, MANI AXELLE HERMINE a découvert une véritable appréciation pour
              l&apos;univers de la maison : les matières, les détails, l&apos;harmonie des espaces
              et tout ce qui transforme un lieu de vie en un espace où l&apos;on se sent pleinement
              soi-même. Cette sensibilité grandissante a fait naître une envie profonde : créer un
              groupe capable de réunir des marques pensées autour de l&apos;art de vivre, de
              l&apos;élégance et du bien-être au quotidien.
            </p>
            <p
              style={{
                margin: "20px 0 0",
                maxWidth: "56ch",
                fontSize: 18,
                lineHeight: 1.8,
                color: "var(--ink-3)",
              }}
            >
              Guidée par sa créativité, son exigence et son amour du beau, elle souhaite transmettre
              une vision de l&apos;habitat où chaque détail compte, où chaque objet raconte une
              histoire et où la maison devient bien plus qu&apos;un lieu : une expression de soi.
            </p>
            <blockquote
              style={{
                margin: "30px 0 0",
                padding: "0 0 0 26px",
                borderLeft: "1px solid var(--line-ink)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  maxWidth: "46ch",
                  fontFamily: "var(--serif)",
                  fontStyle: "italic",
                  fontSize: "clamp(20px, 1.7vw, 26px)",
                  lineHeight: 1.5,
                  color: "var(--ink)",
                }}
              >
                « La maison est le reflet de notre histoire. Créer des univers qui inspirent,
                apaisent et embellissent le quotidien est au cœur de ma vision. »
              </p>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="section">
        <p className="eyebrow" style={{ marginBottom: "clamp(20px, 3vw, 36px)" }}>
          Les marques du groupe
        </p>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <BrandLine
            href="/maisons/maison-velyna"
            name={<>Maison Velyná</>}
            detail="Fragrances d'intérieur — 5 parfums, 250 ml"
          />
          <BrandLine
            href="/maisons/velyna-kai"
            name={
              <>
                <span className="kai-word thin">Velyná</span>
                <span className="kai-word bold">kaï</span>
              </>
            }
            detail="Matcha & rituels — 50 g"
            last
          />
        </div>
      </section>
    </>
  );
}

const BrandLine = ({
  href,
  name,
  detail,
  last = false,
}: {
  href: string;
  name: React.ReactNode;
  detail: string;
  last?: boolean;
}) => (
  <Link
    href={href}
    style={{
      display: "grid",
      gridTemplateColumns: "1fr auto",
      gap: 24,
      alignItems: "baseline",
      padding: "clamp(18px, 2.2vw, 28px) 0",
      borderTop: "1px solid var(--line)",
      borderBottom: last ? "1px solid var(--line)" : undefined,
    }}
  >
    <span>
      <span
        style={{
          display: "block",
          fontFamily: "var(--serif)",
          fontSize: "clamp(22px, 2.2vw, 34px)",
          letterSpacing: "-0.025em",
        }}
      >
        {name}
      </span>
      <span className="eyebrow" style={{ display: "block", marginTop: 8, letterSpacing: "0.22em" }}>
        {detail}
      </span>
    </span>
    <span className="eyebrow" style={{ letterSpacing: "0.22em", whiteSpace: "nowrap" }}>
      Découvrir
    </span>
  </Link>
);
