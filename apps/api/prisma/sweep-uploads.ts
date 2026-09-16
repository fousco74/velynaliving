import { readdir, stat, unlink } from "node:fs/promises";
import { join } from "node:path";
import { disconnect, prisma } from "../src/db.js";
import { UPLOAD_DIR } from "../src/lib/uploads.js";

/**
 * Ménage des images téléversées que plus personne ne référence.
 *
 *   pnpm --filter @velyna/api uploads:sweep            → simulation
 *   pnpm --filter @velyna/api uploads:sweep -- --apply → supprime
 *
 * Pourquoi un balayage, et pas une suppression au moment du remplacement : le
 * champ « chemin » du back-office est éditable à dessein, pour réutiliser un
 * visuel déjà déposé. Deux produits peuvent donc légitimement pointer vers le
 * même fichier, et supprimer parce qu'UNE ligne cesse d'y faire référence
 * casserait l'autre — silencieusement, et sans retour possible.
 *
 * Le délai de grâce n'est pas une précaution de confort : le téléversement
 * part dès le choix du fichier, bien avant l'enregistrement du formulaire.
 * Sans lui, le balayage supprimerait l'image que l'administrateur est en train
 * d'insérer dans un formulaire encore ouvert.
 */
const GRACE_HOURS = 24;

const PREFIX = "/uploads/";

const main = async () => {
  const apply = process.argv.includes("--apply");
  const cutoff = Date.now() - GRACE_HOURS * 3600 * 1000;

  const [products, articles] = await Promise.all([
    prisma.product.findMany({ select: { img: true, imgDetail: true } }),
    prisma.journal.findMany({ select: { imageUrl: true } }),
  ]);

  // Seuls les chemins /uploads/ nous concernent : /assets/ est versionné.
  const referenced = new Set<string>();

  const keep = (path: string | null) => {
    if (path?.startsWith(PREFIX)) referenced.add(path.slice(PREFIX.length));
  };

  for (const product of products) {
    keep(product.img);
    keep(product.imgDetail);
  }

  for (const article of articles) keep(article.imageUrl);

  const files = await readdir(UPLOAD_DIR).catch(() => [] as string[]);

  let kept = 0;
  let young = 0;
  const orphans: { name: string; bytes: number }[] = [];

  for (const name of files) {
    if (referenced.has(name)) {
      kept += 1;
      continue;
    }

    const info = await stat(join(UPLOAD_DIR, name));
    if (!info.isFile()) continue;

    // Déposé récemment : un formulaire est peut-être encore ouvert dessus.
    if (info.mtimeMs > cutoff) {
      young += 1;
      continue;
    }

    orphans.push({ name, bytes: info.size });
  }

  console.log(`Dossier          : ${UPLOAD_DIR}`);
  console.log(`Fichiers         : ${files.length}`);
  console.log(`Référencés       : ${kept}`);
  console.log(`Trop récents     : ${young} (moins de ${GRACE_HOURS} h, épargnés)`);
  console.log(`Orphelins        : ${orphans.length}`);

  if (orphans.length === 0) {
    console.log("\nRien à supprimer.");
    return;
  }

  const total = orphans.reduce((sum, file) => sum + file.bytes, 0);
  console.log(`Espace récupérable : ${(total / 1024 / 1024).toFixed(1)} Mo\n`);

  for (const file of orphans) {
    console.log(`  ${apply ? "supprimé" : "à supprimer"}  ${file.name}`);
    if (apply) await unlink(join(UPLOAD_DIR, file.name));
  }

  if (!apply) {
    console.log("\nSimulation. Relancez avec --apply pour supprimer.");
  }
};

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(disconnect);
