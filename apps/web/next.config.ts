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
