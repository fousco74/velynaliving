import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Le package partagé est distribué en TypeScript brut : Next doit le compiler.
  transpilePackages: ["@velyna/shared"],

  /**
   * Sortie autonome, activée uniquement pour l'image Docker (STANDALONE=1).
   *
   * Elle produit un serveur qui n'embarque que les dépendances réellement
   * atteintes, au lieu d'emporter tout node_modules — précieux dans une image.
   * Mais elle s'exécute avec `node server.js`, pas avec `next start` : sur un
   * hébergement classique (Laravel Forge, PM2, systemd) qui lance `next start`,
   * on garde la sortie par défaut.
   *
   * `outputFileTracingRoot` doit désigner la racine du monorepo, sinon le
   * traçage s'arrête à apps/web et rate @velyna/shared.
   */
  ...(process.env.STANDALONE === "1" && {
    output: "standalone" as const,
    outputFileTracingRoot: join(dirname(fileURLToPath(import.meta.url)), "../.."),
  }),

  // Aucun `images.remotePatterns` : les images téléversées passent par le
  // relais /api/uploads, donc par une URL relative. Voir lib/api.ts.
};

export default nextConfig;
