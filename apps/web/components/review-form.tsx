"use client";

import { useState } from "react";
import { REVIEW_BODY_MAX, REVIEW_BODY_MIN } from "@velyna/shared";
import { ApiError, submitReview } from "@/lib/api";

type Errors = Partial<Record<"name" | "email" | "rating" | "body" | "form", string>>;

const RATING_WORDS = ["", "Décevant", "Moyen", "Bien", "Très bien", "Exceptionnel"];

/**
 * Dépôt d'un avis. Il part en modération : rien n'apparaît sur la fiche avant
 * validation, et le formulaire le dit avant comme après l'envoi.
 */
export const ReviewForm = ({ slug, productName }: { slug: string; productName: string }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (name: string) => String(data.get(name) ?? "").trim();

    setBusy(true);
    setErrors({});

    try {
      await submitReview(slug, {
        name: text("name"),
        email: text("email"),
        rating,
        body: body.trim(),
        website: text("website") || undefined,
      });
      setSent(true);
    } catch (err) {
      const next: Errors = {};
      if (err instanceof ApiError) {
        // Erreur rattachée à un champ : Zod (`issues`) ou contrôle métier (`field`).
        for (const issue of err.issues ?? []) {
          const key = issue.path[0] as keyof Errors;
          next[key] ??= issue.message;
        }
        if (err.field) next[err.field as keyof Errors] = err.message;
        if (Object.keys(next).length === 0) next.form = err.message;
      } else {
        next.form = "Envoi impossible, réessayez.";
      }
      setErrors(next);
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="border-t border-line pt-6" role="status">
        <p className="m-0 font-serif text-[clamp(21px,1.8vw,26px)] tracking-[-0.02em]">
          Merci pour votre avis.
        </p>
        <p className="mt-3 mb-0 text-[17px] leading-[1.7] text-muted">
          Il sera publié après relecture par notre équipe, généralement sous 48 h.
        </p>
      </div>
    );
  }

  const shown = hover || rating;

  return (
    <form onSubmit={submit} noValidate className="border-t border-line pt-6">
      <p className="m-0 font-serif text-[clamp(21px,1.8vw,26px)] tracking-[-0.02em]">
        Votre avis sur {productName}
      </p>

      <fieldset className="mt-6 mb-0 border-0 p-0">
        <legend className="mb-2 font-sans text-[9px] font-light tracking-[0.26em] text-muted-3 uppercase">
          Votre note
        </legend>
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="cursor-pointer" onMouseEnter={() => setHover(value)}>
              <input
                type="radio"
                name="rating"
                value={value}
                checked={rating === value}
                onChange={() => setRating(value)}
                className="peer sr-only"
              />
              <span className="sr-only">
                {value} sur 5 — {RATING_WORDS[value]}
              </span>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="rounded-sm text-ink peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2"
              >
                <path
                  d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"
                  fill={value <= shown ? "currentColor" : "transparent"}
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
            </label>
          ))}
          <span className="ml-3 text-base text-muted" aria-hidden="true">
            {RATING_WORDS[shown]}
          </span>
        </div>
        {errors.rating && <p className="field-error">{errors.rating}</p>}
      </fieldset>

      <div className="form-grid mt-6">
        <div className="field">
          <label htmlFor="r-name">Nom complet — publié en « Prénom N. »</label>
          <input id="r-name" name="name" autoComplete="name" maxLength={100} required />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>
        <div className="field">
          <label htmlFor="r-email">E-mail — jamais publié</label>
          <input id="r-email" name="email" type="email" autoComplete="email" required />
          <p className="mt-1.5 mb-0 text-[15px] text-muted-2">
            Celui de votre commande : votre avis portera le badge « Achat vérifié ».
          </p>
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>
      </div>

      <div className="field mt-6">
        <label htmlFor="r-body">Votre avis</label>
        <textarea
          id="r-body"
          name="body"
          rows={5}
          maxLength={REVIEW_BODY_MAX}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          className="resize-y border border-line-strong px-3.5 py-3 leading-[1.6]"
          required
        />
        <p className="mt-1.5 mb-0 text-right text-[14px] text-muted-3" aria-live="polite">
          {body.trim().length < REVIEW_BODY_MIN
            ? `Encore ${REVIEW_BODY_MIN - body.trim().length} caractères minimum`
            : `${body.length} / ${REVIEW_BODY_MAX}`}
        </p>
        {errors.body && <p className="field-error">{errors.body}</p>}
      </div>

      {/* Champ piège : invisible et hors tabulation, seuls les robots le remplissent. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="r-website">Site web</label>
        <input id="r-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {errors.form && <p className="field-error">{errors.form}</p>}

      <button type="submit" className="btn btn-solid mt-7" disabled={busy}>
        {busy ? "Envoi…" : "Publier mon avis"}
      </button>
    </form>
  );
};
