import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { formatArticleDate } from "@velyna/shared";
import { imageSrc, getJournal, type JournalCard } from "@/lib/api";

export const metadata: Metadata = { title: "Le journal" };

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** Catégorie — date — durée, en sautant ce que l'article n'a pas renseigné. */
const meta = (article: JournalCard) =>
  [article.category, formatArticleDate(article.publishedAt), article.readingTime]
    .filter(Boolean)
    .join(" — ");

export default async function JournalPage({ searchParams }: PageProps<"/journal">) {
  const params = await searchParams;
  const category = first(params.cat) ?? "Tous";

  // Les catégories renvoyées couvrent tout le journal publié, pas seulement la
  // sélection courante : sinon choisir un filtre ferait disparaître les autres.
  const { articles, categories } = await getJournal(category === "Tous" ? undefined : category);

  const tabs = ["Tous", ...categories];
  const [featured, ...rest] = articles;

  return (
    <>
      <section className="px-gutter pt-[clamp(56px,8vw,120px)] pb-[clamp(24px,3vw,44px)]">
        <p className="mb-6 font-sans text-[10px] font-light tracking-[0.32em] text-muted-2 uppercase">
          Le journal
        </p>
        <h1 className="m-0 max-w-[20ch] font-serif text-[clamp(38px,6vw,96px)] leading-[0.98] font-normal tracking-[-0.04em]">
          Notes sur <span className="italic">l&apos;art de vivre</span>
        </h1>
      </section>

      <section className="px-gutter pb-[clamp(64px,9vw,130px)]">
        <div className="mb-[clamp(28px,4vw,56px)] flex flex-wrap items-baseline justify-between gap-x-7 gap-y-4 border-y border-line py-4">
          <div className="flex flex-wrap gap-x-[26px] gap-y-3">
            {tabs.map((item) => (
              <Link
                key={item}
                href={item === "Tous" ? "/journal" : `/journal?cat=${encodeURIComponent(item)}`}
                data-active={category === item}
                className="border-b border-transparent pb-1 font-sans text-[10px] font-light tracking-[0.22em] text-muted uppercase data-[active=true]:border-ink"
              >
                {item}
              </Link>
            ))}
          </div>
          <span className="font-sans text-[10px] font-light tracking-[0.22em] text-muted-2 uppercase">
            {articles.length} article{articles.length > 1 ? "s" : ""}
          </span>
        </div>

        {articles.length === 0 && (
          <p className="py-16 text-center text-muted">Aucun article dans cette catégorie.</p>
        )}

        {featured && (
          <Link
            href={`/journal/${featured.slug}`}
            className="mb-[clamp(32px,5vw,72px)] grid grid-cols-1 items-center gap-[clamp(20px,3vw,64px)] lg:grid-cols-12"
          >
            <div className="lg:col-span-7 lg:row-start-1">
              {featured.imageUrl && (
                <Image
                  src={imageSrc(featured.imageUrl)}
                  alt={featured.title}
                  width={1200}
                  height={750}
                  priority
                  sizes="(max-width: 860px) 100vw, 58vw"
                  className="aspect-16/10 w-full bg-[#ede7df] object-cover"
                />
              )}
            </div>
            <div className="lg:col-span-4 lg:col-start-9 lg:row-start-1">
              <p className="mb-[18px] font-sans text-[10px] font-light tracking-[0.26em] text-muted-2 uppercase">
                {meta(featured)}
              </p>
              <h2 className="m-0 font-serif text-[clamp(26px,2.8vw,44px)] leading-[1.08] font-normal tracking-[-0.032em]">
                {featured.title}
              </h2>
              {featured.excerpt && (
                <p className="mt-5 text-[clamp(17px,1.4vw,20px)] leading-[1.78] text-pretty text-ink-3">
                  {featured.excerpt}
                </p>
              )}
              <span className="mt-[26px] inline-block cursor-pointer border border-ink px-7 py-[15px] text-center font-sans text-[11px] font-light tracking-[0.24em] uppercase transition-colors duration-[450ms] ease-velyna">
                Lire l&apos;article
              </span>
            </div>
          </Link>
        )}

        {rest.length > 0 && (
          <div className="grid grid-cols-1 gap-[clamp(24px,3vw,52px)] sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((article) => (
              <Link key={article.slug} href={`/journal/${article.slug}`} className="group block">
                {article.imageUrl && (
                  <Image
                    src={imageSrc(article.imageUrl)}
                    alt={article.title}
                    width={800}
                    height={533}
                    sizes="(max-width: 560px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="aspect-3/2 w-full bg-[#ede7df] object-cover"
                  />
                )}
                <p className="mt-[18px] font-sans text-[10px] font-light tracking-[0.22em] text-muted-2 uppercase">
                  {meta(article)}
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
        )}
      </section>
    </>
  );
}
