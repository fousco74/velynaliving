import { mkdir } from "node:fs/promises";
import { build } from "esbuild";

/**
 * Bundle de l'API pour Vercel — et pour Vercel seulement.
 *
 * Partout ailleurs l'API tourne avec tsx. Sur Vercel, `@vercel/node` transpile
 * les `.ts` du projet mais pas ceux de `node_modules` : `@velyna/shared`, livré
 * en TypeScript brut, y devient introuvable au démarrage (ERR_MODULE_NOT_FOUND).
 * Le compiler casserait le front, qui le transpile lui-même.
 *
 * On inclut donc dans le bundle tout le code « maison » — `src/`, le client
 * Prisma généré (importé en relatif) et `@velyna/shared` — et on laisse les
 * vraies dépendances externes : Vercel les trace dans `node_modules`. Bundler
 * aussi express & co. en ESM ferait échouer leurs `require` dynamiques.
 */
const INLINE = new Set(["@velyna/shared"]);

await build({
  entryPoints: ["src/index.ts"],
  outfile: "dist/vercel/app.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  sourcemap: true,
  logLevel: "info",
  plugins: [
    {
      name: "externaliser-les-dependances",
      setup(build) {
        // Import « nu » (ni relatif, ni absolu) : un paquet de node_modules.
        build.onResolve({ filter: /^[^./]/ }, (args) =>
          INLINE.has(args.path) ? undefined : { path: args.path, external: true },
        );
      },
    },
  ],
});

// Vercel exige un dossier de sortie statique. On le veut VIDE : tout fichier
// qui s'y trouverait passerait avant la réécriture vers la fonction.
await mkdir("public", { recursive: true });
