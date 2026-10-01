// Point d'entrée de la fonction Vercel : le bundle produit par
// `pnpm build:vercel` (scripts/build-vercel.mjs). Volontairement en JS — un
// `.ts` ici serait retranspilé par @vercel/node, sans résoudre @velyna/shared.
export { default } from "../dist/vercel/app.mjs";
