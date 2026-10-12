import { formatRating } from "@velyna/shared";

const PATH = "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z";

/**
 * Note sur 5 en étoiles SVG, demi-étoiles comprises. Purement visuel : la
 * valeur est donnée aux lecteurs d'écran par `aria-label`.
 */
export const Stars = ({ value, size = 14 }: { value: number; size?: number }) => (
  <span
    role="img"
    aria-label={`${formatRating(value)} sur 5`}
    className="inline-flex shrink-0 gap-[2px] align-middle text-ink"
  >
    {[1, 2, 3, 4, 5].map((index) => {
      // Remplissage de l'étoile : 0, 50 ou 100 %, arrondi au demi-point.
      const fill = Math.max(0, Math.min(1, Math.round((value - index + 1) * 2) / 2));
      return (
        <svg key={index} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <defs>
            <linearGradient id={`star-${index}-${fill}`}>
              <stop offset={`${fill * 100}%`} stopColor="currentColor" />
              <stop offset={`${fill * 100}%`} stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            d={PATH}
            fill={`url(#star-${index}-${fill})`}
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      );
    })}
  </span>
);
