"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Film d'ambiance en boucle muette.
 *
 * - Ne joue que lorsqu'il est à l'écran : en bas de page, il ne consomme ni
 *   bande passante ni batterie tant qu'on n'y est pas.
 * - `prefers-reduced-motion` : jamais de lecture automatique, l'affiche reste.
 * - Bouton pause/lecture toujours présent (WCAG 2.2.2 : tout mouvement de plus
 *   de 5 s doit pouvoir être arrêté).
 * - Muet, sinon les navigateurs refusent la lecture automatique.
 */
export const AmbientVideo = ({
  src,
  poster,
  label,
  className = "",
}: {
  src: string;
  poster?: string;
  label: string;
  className?: string;
}) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  // Mis en pause par la personne : le défilement ne doit plus le relancer.
  const pausedByUser = useRef(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          if (!pausedByUser.current) void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;

    if (video.paused) {
      pausedByUser.current = false;
      void video.play().catch(() => {});
    } else {
      pausedByUser.current = true;
      video.pause();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="block h-auto w-full"
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Mettre la vidéo en pause" : "Lire la vidéo"}
        className="absolute right-3 bottom-3 grid size-10 cursor-pointer place-items-center rounded-full border-0 bg-[rgba(43,35,32,0.55)] text-white backdrop-blur-sm transition-colors hover:bg-[rgba(43,35,32,0.8)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="4" width="5" height="16" rx="1" fill="currentColor" />
            <rect x="14" y="4" width="5" height="16" rx="1" fill="currentColor" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 4.5v15l12.5-7.5z" fill="currentColor" />
          </svg>
        )}
      </button>
    </div>
  );
};
