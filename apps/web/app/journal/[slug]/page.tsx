import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { formatArticleDate, parseArticleBody } from "@velyna/shared";
import { imageSrc, ApiError, getArticle, getJournal, type JournalArticle } from "@/lib/api";
import { ArticleView } from "@/components/article-view";

/**
 * Le journal est administrable : un article publié doit apparaître sans
 * redéploiement. On lit donc la base à la demande, sans generateStaticParams.
 */
const load = async (slug: string): Promise<JournalArticle | null> => {
  try {
    return await getArticle(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
};

export async function generateMetadata({
  params,
}: PageProps<"/journal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await load(slug);

  return {
    title: article?.title ?? "Article",
    description: article?.excerpt ?? undefined,
  };
}

export default async function ArticlePage({ params }: PageProps<"/journal/[slug]">) {
  const { slug } = await params;
  const article = await load(slug);
  if (!article) notFound();

  const { articles } = await getJournal();
  const others = articles.filter((item) => item.slug !== article.slug).slice(0, 3);
  const blocks = parseArticleBody(article.body);

  return (
    <article>
      <ArticleView slug={article.slug} />

      <header className="mx-auto max-w-[780px] px-gutter pt-[clamp(48px,7vw,104px)] pb-[clamp(28px,3.5vw,48px)] text-center">
        {article.category && (
          <p className="mb-[22px] font-sans text-[10px] font-light tracking-[0.3em] text-muted-2 uppercase">
            {article.category}
          </p>
        )}
        <h1 className="m-0 font-serif text-[clamp(32px,4.4vw,70px)] leading-[1.03] font-normal tracking-[-0.04em]">
          {article.title}
        </h1>
        {article.excerpt && (
          <p className="mx-auto mt-6 max-w-[44ch] font-serif text-[clamp(18px,1.5vw,23px)] leading-[1.55] text-muted italic">
            {article.excerpt}
          </p>
        )}
        <p className="mt-6 font-sans text-[10px] font-light tracking-[0.24em] text-muted-3 uppercase">
          {[
            formatArticleDate(article.publishedAt),
            article.readingTime && `${article.readingTime} de lecture`,
          ]
            .filter(Boolean)
            .join(" — ")}
        </p>
      </header>

      {article.imageUrl && (
        <div className="mx-gutter">
          <Image
            src={imageSrc(article.imageUrl)}
            alt={article.title}
            width={1600}
            height={700}
            priority
            sizes="100vw"
            className="aspect-16/7 w-full bg-[#ede7df] object-cover"
          />
        </div>
      )}

      <div className="mx-auto max-w-[720px] px-gutter pt-[clamp(32px,4.5vw,68px)]">
        {blocks.map((block, index) => {
          if (block.kind === "h2") {
            return (
              <h2
                key={index}
                className="mt-10 mb-4 font-serif text-[clamp(24px,2.1vw,32px)] leading-[1.14] font-normal tracking-[-0.03em]"
              >
                {block.text}
              </h2>
            );
          }

          if (block.kind === "quote") {
            return (
              <blockquote key={index} className="my-9 border-l border-[#c9b49a] pl-[26px]">
                <p className="m-0 font-serif text-[clamp(21px,1.8vw,28px)] leading-[1.5] italic">
                  {block.text}
                </p>
              </blockquote>
            );
          }

          return (
            <p
              key={index}
              className="mb-[22px] text-[clamp(18px,1.4vw,20px)] leading-[1.82] text-pretty text-ink-2"
            >
              {block.text}
            </p>
          );
        })}
      </div>

      {others.length > 0 && (
        <section className="px-gutter py-[clamp(56px,8vw,120px)]">
          <div className="mb-[clamp(28px,4vw,56px)] flex items-baseline justify-between gap-6 border-t border-line pt-6">
            <p className="font-sans text-[10px] font-light tracking-[0.32em] text-muted-2 uppercase">
              À lire aussi
            </p>
            <Link
              href="/journal"
              className="font-sans text-[10px] font-light tracking-[0.24em] text-muted-2 uppercase"
            >
              Tous les articles
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-[clamp(24px,3vw,52px)] sm:grid-cols-2 lg:grid-cols-3">
            {others.map((item) => (
              <Link key={item.slug} href={`/journal/${item.slug}`} className="block">
                {item.imageUrl && (
                  <Image
                    src={imageSrc(item.imageUrl)}
                    alt={item.title}
                    width={800}
                    height={533}
                    sizes="(max-width: 560px) 100vw, 33vw"
                    className="aspect-3/2 w-full bg-[#ede7df] object-cover"
                  />
                )}
                <p className="mt-4 font-sans text-[10px] font-light tracking-[0.22em] text-muted-2 uppercase">
                  {[item.category, item.readingTime].filter(Boolean).join(" — ")}
                </p>
                <h3 className="mt-2.5 font-serif text-[clamp(22px,2.2vw,34px)] leading-[1.16] font-normal tracking-[-0.03em]">
                  {item.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
