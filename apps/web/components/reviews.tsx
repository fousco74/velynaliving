"use client";

import { useState } from "react";
import { formatRating } from "@velyna/shared";
import { getProductReviews, type PublicReview, type ReviewPage } from "@/lib/api";
import { ReviewForm } from "@/components/review-form";
import { Stars } from "@/components/stars";

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Section « Avis clients » de la fiche produit.
 *
 * La première page arrive rendue côté serveur (indexable, sans chargement) ;
 * les suivantes se chargent à la demande.
 */
export const Reviews = ({
  slug,
  productName,
  initial,
}: {
  slug: string;
  productName: string;
  initial: ReviewPage;
}) => {
  const { summary } = initial;
  const [reviews, setReviews] = useState<PublicReview[]>(initial.reviews);
  const [page, setPage] = useState(initial.page);
  const [loading, setLoading] = useState(false);
  const [writing, setWriting] = useState(false);

  const loadMore = async () => {
    setLoading(true);
    try {
      const next = await getProductReviews(slug, page + 1);
      setReviews((current) => [...current, ...next.reviews]);
      setPage(next.page);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="avis"
      aria-labelledby="avis-titre"
      className="scroll-mt-24 border-t border-line px-(--gutter) py-[clamp(56px,7vw,104px)]"
    >
      <div className="grid gap-y-12 md:grid-cols-12 md:gap-x-[clamp(24px,4vw,64px)]">
        <div className="md:col-span-4">
          <p className="eyebrow mb-5">Avis clients</p>
          <h2 id="avis-titre" className="sr-only">
            Avis clients sur {productName}
          </h2>

          {summary.count > 0 ? (
            <>
              <div className="flex items-end gap-4">
                <span className="font-serif text-[clamp(52px,5vw,76px)] leading-none tracking-[-0.04em]">
                  {formatRating(summary.average)}
                </span>
                <div className="pb-2">
                  <Stars value={summary.average} size={16} />
                  <p className="mt-1.5 mb-0 text-base text-muted">sur {summary.count} avis</p>
                </div>
              </div>

              <ul className="mt-7 mb-0 list-none space-y-2 p-0" aria-label="Répartition des notes">
                {([5, 4, 3, 2, 1] as const).map((star) => {
                  const n = summary.distribution[star];
                  return (
                    <li key={star} className="grid grid-cols-[34px_1fr_28px] items-center gap-3">
                      <span className="font-sans text-[11px] font-light tracking-[0.14em] text-muted-2">
                        {star} ★
                      </span>
                      <span className="h-[3px] bg-line-soft" aria-hidden="true">
                        <span
                          className="block h-full bg-ink"
                          style={{ width: `${(n / summary.count) * 100}%` }}
                        />
                      </span>
                      <span className="text-right font-sans text-[11px] font-light text-muted-2">
                        {n}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <p className="m-0 font-serif text-[clamp(22px,2vw,30px)] leading-tight tracking-[-0.02em]">
              Aucun avis pour l&apos;instant.
              <br />
              <span className="italic">Partagez le vôtre.</span>
            </p>
          )}

          {!writing && (
            <button type="button" className="btn mt-8" onClick={() => setWriting(true)}>
              Donner mon avis
            </button>
          )}

          <p className="mt-6 mb-0 max-w-[40ch] text-[15px] leading-[1.6] text-muted-2">
            Les avis sont publiés après relecture, qu&apos;ils soient positifs ou négatifs. Le badge
            « Achat vérifié » signale un client dont la commande a été confirmée.
          </p>
        </div>

        <div className="md:col-span-8 md:col-start-5 lg:col-span-7 lg:col-start-6">
          {writing && (
            <div className="mb-12">
              <ReviewForm slug={slug} productName={productName} />
            </div>
          )}

          {reviews.length > 0 && (
            <ol className="m-0 list-none p-0">
              {reviews.map((review) => (
                <li
                  key={review.id}
                  className="border-t border-line py-7 first:pt-0 first:border-t-0"
                >
                  <article>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <Stars value={review.rating} />
                      {review.title && (
                        <h3 className="m-0 font-serif text-[clamp(19px,1.5vw,22px)] font-normal tracking-[-0.02em]">
                          {review.title}
                        </h3>
                      )}
                    </div>

                    <p className="mt-3 mb-0 max-w-[65ch] text-[18px] leading-[1.72] whitespace-pre-line text-ink-2">
                      {review.body}
                    </p>

                    <p className="mt-4 mb-0 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-[11px] font-light tracking-[0.14em] text-muted-2 uppercase">
                      <span className="text-ink">{review.author}</span>
                      {review.verified && (
                        <span className="inline-flex items-center gap-1.5 text-kai">
                          <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden="true">
                            <path
                              d="M4 12.5l5 5L20 6.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Achat vérifié
                        </span>
                      )}
                      <time dateTime={review.date}>{dateFmt.format(new Date(review.date))}</time>
                    </p>

                    {review.reply && (
                      <div className="mt-5 border-l border-line-strong pl-5">
                        <p className="m-0 font-sans text-[10px] font-medium tracking-[0.22em] text-ink uppercase">
                          Réponse de Velyná
                        </p>
                        <p className="mt-2 mb-0 max-w-[60ch] text-[17px] leading-[1.7] whitespace-pre-line text-muted">
                          {review.reply}
                        </p>
                      </div>
                    )}
                  </article>
                </li>
              ))}
            </ol>
          )}

          {page < initial.pages && (
            <button
              type="button"
              className="btn btn-soft mt-4"
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? "Chargement…" : "Voir plus d'avis"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
