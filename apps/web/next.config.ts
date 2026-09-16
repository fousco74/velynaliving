import type { NextConfig } from "next";

/**
 * Les images téléversées depuis le back-office sont servies par l'API, pas
 * par Next : son optimiseur doit donc être autorisé à aller les chercher.
 * Le motif est dérivé de l'URL de l'API pour rester juste en production.
 */
const api = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001");

const nextConfig: NextConfig = {
  // Le package partagé est distribué en TypeScript brut : Next doit le compiler.
  transpilePackages: ["@velyna/shared"],
  images: {
    /**
     * Next refuse par défaut d'optimiser une image dont l'hôte résout vers une
     * IP privée — une protection contre le SSRF, où un `url` arbitraire ferait
     * de l'optimiseur un relais vers le réseau interne.
     *
     * Ici l'API est justement sur le réseau privé : en développement
     * (localhost) comme en production derrière docker-compose. Sans ce
     * drapeau, toute image téléversée reste invisible.
     *
     * Ce qui rend la chose sûre, c'est `remotePatterns` juste en dessous :
     * l'optimiseur n'accepte qu'un seul hôte, le nôtre, et un seul chemin,
     * /uploads. Aucune URL arbitraire ne passe.
     */
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: api.protocol.replace(":", "") as "http" | "https",
        hostname: api.hostname,
        ...(api.port && { port: api.port }),
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
