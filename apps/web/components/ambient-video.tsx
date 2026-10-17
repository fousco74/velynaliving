"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Film d'ambiance en boucle, muet au départ.
 *
 * - Ne joue que lorsqu'il est à l'écran : en bas de page, il ne consomme ni
 *   bande passante ni batterie tant qu'on n'y est pas.
 * - `prefers-reduced-motion` : jamais de lecture automatique, l'affiche reste.
 * - Bouton pause/lecture toujours présent (WCAG 2.2.2 : tout mouvement de plus
 *   de 5 s doit pouvoir être arrêté).
 * - Démarre muet, sinon les navigateurs refusent la lecture automatique. Le son
 *   s'active au bouton : un clic est le geste que les navigateurs exigent.
 *   Sorti de l'écran, le film se met en pause, donc le son ne suit pas la
 *   personne dans la page.
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
  const [muted, setMuted] = useState(true);
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

  const toggleSound = () => {
    const video = ref.current;
    if (!video) return;

    video.muted = !video.muted;
    // Activer le son d'un film arrêté sans le lancer laisserait croire que le
    // bouton ne fait rien.
    if (!video.muted && video.paused) {
      pausedByUser.current = false;
      void video.play().catch(() => {});
    }
  };

  const control =
    "grid size-10 cursor-pointer place-items-center rounded-full border-0 bg-[rgba(43,35,32,0.55)] text-white backdrop-blur-sm transition-colors hover:bg-[rgba(43,35,32,0.8)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

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
        // Synchronisé sur l'élément, pas sur le clic : l'état affiché ne peut
        // pas diverger de ce qu'on entend.
        onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
        className="block h-auto w-full"
      />
      <div className="absolute right-3 bottom-3 flex gap-2">
        <button
          type="button"
          onClick={toggleSound}
          aria-label={muted ? "Activer le son" : "Couper le son"}
          aria-pressed={!muted}
          className={control}
        >
          {muted ? (
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
              <path
                d="M16.5 9.5l5 5m0-5l-5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
              <path
                d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          )}
        </button>
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Mettre la vidéo en pause" : "Lire la vidéo"}
          className={control}
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
    </div>
  );
};
