import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Le package partagé est distribué en TypeScript brut : Next doit le compiler.
  transpilePackages: ["@velyna/shared"],
};

export default nextConfig;
