import Image from "next/image";
import Link from "next/link";
import { formatArticleDate, formatXOF, FREE_DELIVERY_THRESHOLD } from "@velyna/shared";
import { imageSrc, getJournal } from "@/lib/api";

export default async function HomePage() {
  // Les trois derniers articles publiés, tenus à jour depuis le back-office.
  const { articles } = await getJournal();
  const latest = articles.slice(0, 3);

  return (
    <>
      <section
        style={{
          position: "relative",
          height: "92vh",
          minHeight: 520,
          overflow: "hidden",
          background: "var(--bg-dark)",
        }}
      >
        <Image
          src="/assets/hero-ambiance.jpeg"
          alt="Univers VELYNÁLIVING"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "50% 45%" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(30,21,17,0.52) 0%, rgba(30,21,17,0.4) 34%, rgba(30,21,17,0.58) 62%, rgba(30,21,17,0.7) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 24px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontFamily: "var(--serif)",
              fontWeight: 400,
              color: "var(--bg)",
              fontSize: "clamp(46px, 10.5vw, 160px)",
              lineHeight: 0.92,
              letterSpacing: "-0.045em",
            }}
          >
            VELYNÁ<span className="italic">living</span>
          </h1>
          <p
            style={{
              margin: "26px 0 0",
              fontFamily: "var(--sans)",
              fontWeight: 200,
              fontSize: "clamp(10px, 1vw, 13px)",
              letterSpacing: "0.34em",
              textTransform: "uppercase",
              color: "var(--bg)",
            }}
          >
            Where comfort meets luxury
          </p>
        </div>
        <div
          className="drop-line"
          style={{
            position: "absolute",
            left: "50%",
            bottom: 42,
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              fontFamily: "var(--sans)",
              fontWeight: 200,
              fontSize: 9,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(250,247,242,0.72)",
            }}
          >
            Découvrir
          </span>
          <span
            style={{
              position: "relative",
              display: "block",
              width: 1,
              height: 58,
              overflow: "hidden",
              background: "rgba(250,247,242,0.22)",
            }}
          >
            <span
              style={{
                position: "absolute",
                inset: 0,
                background: "var(--bg)",
                animation: "velDrop 2600ms cubic-bezier(.4,0,.4,1) infinite",
              }}
            />
          </span>
        </div>
      </section>

      <section className="section">
        <div className="grid12">
          <p className="eyebrow" style={{ gridColumn: "1 / span 3" }}>
            Le manifeste
          </p>
          <div style={{ gridColumn: "4 / span 9" }}>
            <h2 className="h2" style={{ maxWidth: "26ch" }}>
              Le véritable luxe réside dans les{" "}
              <span className="italic">rituels du quotidien.</span>
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "clamp(28px, 3.5vw, 64px)",
                marginTop: "clamp(32px, 4.5vw, 68px)",
                paddingTop: "clamp(24px, 3vw, 44px)",
                borderTop: "1px solid var(--line)",
              }}
            >
              <p className="lead" style={{ margin: 0 }}>
                Une tasse de matcha préparée avec soin. Un parfum qui habille une pièce. Une
                atmosphère qui apaise l&apos;esprit. Parce que notre intérieur devrait être bien
                plus qu&apos;un simple lieu de vie.
              </p>
              <p className="lead" style={{ margin: 0 }}>
                VELYNÁLIVING est l&apos;univers lifestyle imaginé par MH VELYNÁ GROUP, une maison
                créative qui développe des marques inspirées par le bien-être, le design et
                l&apos;art de vivre. Une destination où chaque détail a du sens, rassemblant des
                marques aux identités fortes et une même exigence : des créations élégantes,
                authentiques et intemporelles.
              </p>
            </div>
            <p
              style={{
                margin: "clamp(28px, 3.5vw, 46px) 0 0",
                fontFamily: "var(--serif)",
                fontStyle: "italic",
                fontSize: "clamp(19px, 1.6vw, 24px)",
                lineHeight: 1.5,
                color: "var(--muted)",
              }}
            >
              Reste à savoir comment un intérieur y parvient.
            </p>
          </div>
        </div>
      </section>

      <BrandBlock
        eyebrow="Marque I"
        img="/assets/maison-velyna.jpeg"
        href="/maisons/maison-velyna"
        title={
          <>
            Maison
            <br />
            <span className="italic">Velyná</span>
          </>
        }
        text="Cinq signatures olfactives pour la maison — bois, ambres, muscs et iris, pensés comme des souvenirs que l'on habite."
        dark
      />

      <BrandBlock
        eyebrow="Marque II"
        img="/assets/maison-velyna-kai.jpeg"
        href="/maisons/velyna-kai"
        title={
          <>
            <span className="kai-word thin">Velyná</span>
            <span className="kai-word bold">kaï</span>
          </>
        }
        text="Un matcha de cérémonie et le rituel qui l'accompagne. Un instant suspendu, mesuré au geste près."
      />

      <section className="section">
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 24,
            borderTop: "1px solid var(--line)",
            paddingTop: 24,
            marginBottom: "clamp(32px, 5vw, 72px)",
          }}
        >
          <p className="eyebrow">Le journal</p>
          <Link href="/journal" className="eyebrow" style={{ letterSpacing: "0.24em" }}>
            Tous les articles
          </Link>
        </div>
        <div className="product-grid">
          {latest.map((article) => (
            <Link key={article.slug} href={`/journal/${article.slug}`} className="block">
              {article.imageUrl && (
                <Image
                  src={imageSrc(article.imageUrl)}
                  alt={article.title}
                  width={800}
                  height={533}
                  className="aspect-3/2 w-full object-cover"
                />
              )}
              <p className="mt-[18px] font-sans text-[10px] font-light tracking-[0.22em] text-muted-2 uppercase">
                {[article.category, formatArticleDate(article.publishedAt)]
                  .filter(Boolean)
                  .join(" — ")}
              </p>
              <h3 className="mt-3 font-serif text-[clamp(22px,2.2vw,34px)] leading-[1.16] font-normal tracking-[-0.03em]">
                {article.title}
              </h3>
              {article.excerpt && (
                <p className="mt-3 text-[17px] leading-[1.7] text-muted">{article.excerpt}</p>
              )}
            </Link>
          ))}
        </div>
      </section>

      <section className="section" style={{ background: "var(--bg-dark)", color: "var(--cream)" }}>
        <div className="grid12" style={{ alignItems: "center" }}>
          <div style={{ gridColumn: "1 / span 4" }}>
            <Image
              src="/assets/fondatrice.jpeg"
              alt="Mani Axelle Hermine, fondatrice de MH Velyná Group"
              width={600}
              height={800}
              style={{
                aspectRatio: "3 / 4",
                objectFit: "cover",
                objectPosition: "50% 18%",
                width: "100%",
                height: "auto",
              }}
            />
          </div>
          <div style={{ gridColumn: "6 / span 7" }}>
            <p className="eyebrow" style={{ color: "var(--rose)", marginBottom: 22 }}>
              CEO &amp; Founder — MH Velyná Group
            </p>
            <h2 className="h2">
              Mani Axelle <span className="italic">Hermine</span>
            </h2>
            <p
              style={{
                margin: "30px 0 0",
                maxWidth: "50ch",
                paddingLeft: 24,
                borderLeft: "1px solid rgba(201,180,154,0.55)",
                fontFamily: "var(--serif)",
                fontStyle: "italic",
                fontSize: "clamp(19px, 1.6vw, 25px)",
                lineHeight: 1.55,
                color: "#e4d3c6",
              }}
            >
              « La maison est le reflet de notre histoire. Créer des univers qui inspirent, apaisent
              et embellissent le quotidien est au cœur de ma vision. »
            </p>
            <Link href="/la-maison" className="btn btn-light" style={{ marginTop: 34 }}>
              Lire son histoire
            </Link>
          </div>
        </div>
      </section>

      <section
        className="section"
        style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--line)" }}
      >
        <div className="grid12" style={{ alignItems: "end" }}>
          <div style={{ gridColumn: "1 / span 6" }}>
            <p className="eyebrow" style={{ marginBottom: 24 }}>
              L&apos;invitation
            </p>
            <h2 className="h2">
              Six créations,
              <br />
              deux marques,
              <br />
              <span className="italic">un même art de vivre.</span>
            </h2>
          </div>
          <div style={{ gridColumn: "8 / span 5" }}>
            <p className="lead" style={{ margin: "0 0 30px", maxWidth: "48ch" }}>
              Cinq fragrances d&apos;intérieur et un matcha de cérémonie, livrés à Abidjan sous 24 à
              48 h. Livraison offerte dès {formatXOF(FREE_DELIVERY_THRESHOLD)}.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
              <Link href="/boutique" className="btn btn-solid">
                Voir la boutique
              </Link>
              <Link href="/maisons" className="btn">
                Les marques
              </Link>
              <Link href="/contact" className="btn btn-soft">
                Nous écrire
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const BrandBlock = ({
  eyebrow,
  img,
  href,
  title,
  text,
  dark = false,
}: {
  eyebrow: string;
  img: string;
  href: string;
  title: React.ReactNode;
  text: string;
  dark?: boolean;
}) => (
  <article
    style={{
      position: "relative",
      minHeight: "82vh",
      display: "flex",
      alignItems: "center",
      background: dark ? "var(--bg-dark)" : "#efede3",
      overflow: "hidden",
    }}
  >
    <div style={{ position: "absolute", inset: 0 }}>
      <Image
        src={img}
        alt=""
        fill
        sizes="100vw"
        style={{ objectFit: "cover", objectPosition: dark ? "62% 50%" : "22% 50%" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: dark
            ? "linear-gradient(100deg, rgba(28,19,15,0.92) 0%, rgba(28,19,15,0.72) 44%, rgba(28,19,15,0.15) 80%)"
            : "linear-gradient(90deg, rgba(247,243,238,0) 0%, rgba(247,243,238,0.35) 18%, rgba(247,243,238,0.95) 46%, rgba(250,248,244,1) 66%)",
        }}
      />
    </div>
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "auto",
        maxWidth: 620,
        marginLeft: dark ? "var(--gutter)" : "auto",
        marginRight: dark ? "auto" : "var(--gutter)",
        padding: "clamp(56px, 8vw, 112px) var(--gutter)",
      }}
    >
      <p
        className="eyebrow"
        style={{ marginBottom: 24, color: dark ? "var(--rose)" : "var(--kai-soft)" }}
      >
        {eyebrow}
      </p>
      <h2
        style={{
          margin: 0,
          fontFamily: "var(--serif)",
          fontWeight: 400,
          color: dark ? "var(--bg)" : "var(--ink)",
          fontSize: "clamp(38px, 5.2vw, 84px)",
          lineHeight: 0.96,
          letterSpacing: "-0.035em",
        }}
      >
        {title}
      </h2>
      <p
        style={{
          margin: "28px 0 0",
          maxWidth: "38ch",
          fontSize: "clamp(17px, 1.35vw, 20px)",
          lineHeight: 1.75,
          color: dark ? "rgba(250,247,242,0.84)" : "#4a4e43",
        }}
      >
        {text}
      </p>
      <Link href={href} className={`btn ${dark ? "btn-light" : ""}`} style={{ marginTop: 34 }}>
        Découvrir la marque
      </Link>
    </div>
  </article>
);
