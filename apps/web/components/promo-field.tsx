"use client";

import { useState } from "react";
import { describePromo } from "@velyna/shared";
import { ApiError, checkPromo, type CheckedPromo } from "@/lib/api";

/**
 * Saisie d'un code promo, partagée par le panier et la commande.
 *
 * Les codes vivent en base (dates, limites) : seule l'API sait s'ils sont
 * valables. Le composant n'en garde que la règle, que le parent passe à
 * `computeTotals` — la commande revérifie tout de toute façon.
 */
export const PromoField = ({
  subTotal,
  value,
  onChange,
  error: externalError,
}: {
  subTotal: number;
  value: CheckedPromo | null;
  onChange: (promo: CheckedPromo | null) => void;
  /** Refus venu d'ailleurs (ex. à la validation de la commande). */
  error?: string;
}) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const apply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;

    setChecking(true);
    try {
      onChange(await checkPromo(input, subTotal));
      setError("");
      setInput("");
    } catch (err) {
      onChange(null);
      setError(err instanceof ApiError ? err.message : "Vérification impossible, réessayez.");
    } finally {
      setChecking(false);
    }
  };

  const shownError = error || externalError;

  return (
    <div className="mt-[18px]">
      {value ? (
        <div className="flex items-baseline justify-between gap-3.5 border-b border-line-strong pb-2.5">
          <p className="m-0 text-base text-kai-soft">
            <span className="font-sans text-[11px] font-semibold tracking-[0.2em] text-ink">
              {value.code}
            </span>{" "}
            — {value.label}, {describePromo(value)}
          </p>
          <button
            type="button"
            className="tag cursor-pointer border-0 bg-transparent"
            onClick={() => onChange(null)}
          >
            Retirer
          </button>
        </div>
      ) : (
        <form
          onSubmit={apply}
          className="flex items-baseline gap-3.5 border-b border-line-strong pb-2.5"
        >
          <label
            htmlFor="promo"
            className="shrink-0 font-sans text-[11px] font-semibold tracking-[0.22em] text-ink uppercase"
          >
            Code promo
          </label>
          <input
            id="promo"
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Votre code"
            autoComplete="off"
            className="min-w-0 flex-1 border-0 bg-transparent font-body text-lg outline-none"
          />
          <button
            type="submit"
            className="tag cursor-pointer border-0 bg-transparent font-semibold"
            disabled={checking}
          >
            {checking ? "…" : "Appliquer"}
          </button>
        </form>
      )}

      {shownError && <p className="field-error">{shownError}</p>}
    </div>
  );
};
