import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "La maison" };

export default function LaMaisonPage() {
  return (
    <>
      <section className="section-tight" style={{ paddingTop: "clamp(56px, 8vw, 120px)" }}>
        <p className="eyebrow" style={{ marginBottom: 24 }}>
          La maison
        </p>
        <h1 className="display" style={{ maxWidth: "22ch" }}>
          MH Velyná <span className="italic">Group</span>
        </h1>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="grid12" style={{ alignItems: "start" }}>
          <div style={{ gridColumn: "1 / span 5" }}>
            <Image
              src="/assets/fondatrice.jpeg"
              alt="Mani Axelle Hermine"
              width={800}
              height={1066}
              style={{
                width: "100%",
                aspectRatio: "3 / 4",
                objectFit: "cover",
                objectPosition: "50% 18%",
              }}
            />
          </div>
          <div style={{ gridColumn: "7 / span 6" }} className="prose">
            <p className="eyebrow" style={{ marginBottom: 20 }}>
              CEO &amp; Founder
            </p>
            <h2 className="h2">
              Mani Axelle <span className="italic">Hermine</span>
            </h2>
            <p
              style={{
                marginTop: 26,
                fontFamily: "var(--serif)",
                fontStyle: "italic",
                fontSize: "clamp(19px, 1.6vw, 25px)",
                lineHeight: 1.55,
                color: "var(--muted)",
                paddingLeft: 24,
                borderLeft: "1px solid var(--line)",
              }}
            >
              « La maison est le reflet de notre histoire. Créer des univers qui inspirent, apaisent
              et embellissent le quotidien est au cœur de ma vision. »
            </p>
            <p>
              MH VELYNÁ GROUP est une maison créative qui développe des marques inspirées par le
              bien-être, le design et l&apos;art de vivre. VELYNÁLIVING en est l&apos;univers
              lifestyle : une destination où chaque détail a du sens.
            </p>
            <p>
              Nous passons une grande partie de nos journées à l&apos;extérieur, exposés à de
              multiples sollicitations. Parce que notre intérieur devrait être bien plus qu&apos;un
              simple lieu de vie, nous imaginons des espaces qui invitent à ralentir, à se recentrer
              et à retrouver une énergie profonde.
            </p>
            <p>
              Nos créations réunissent une ambiance sensorielle harmonieuse, un design raffiné, des
              matières nobles et des parfums d&apos;intérieur composés avec exigence. Deux marques,
              une même vision de l&apos;élégance du quotidien.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 32 }}>
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
