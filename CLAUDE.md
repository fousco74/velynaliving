# Velyna Living

Site e-commerce d'une maison de parfum (Abidjan, Côte d'Ivoire). Devise XOF (F CFA, entiers), paiement mobile money, téléphone ivoirien +225.

## Stack (monorepo pnpm — packageManager pnpm@11.15.1)

- `apps/api` — Express 5 + Prisma 7 + Zod 4 (+ dotenv, tsx). Port 4001.
- `apps/web` — Next.js 16 App Router (port 3002). **Tailwind v4** ; le thème est dans `@theme`
  en tête de `app/globals.css` (pas de `tailwind.config.js` en v4).
- `packages/shared` — **fichier unique** `src/index.ts` (pas d'import interne : le bundler Next ne résout pas les `.js` de NodeNext). Contient les schémas Zod et `computeTotals`, la source de vérité des montants utilisée par l'API **et** le panier.
- Postgres 16 via `docker-compose.yml` (développement, hôte 5434, db/user `velyna`).
  La pile complète de production est dans `docker-compose.prod.yml`.
- **L'API tourne avec `tsx`, jamais compilée** — y compris en production, où `tsx` est donc une
  dépendance de production. `@velyna/shared` expose du TypeScript brut (`main: ./src/index.ts`),
  et c'est précisément ce qui permet à Next de le transpiler : le compiler casserait le front.

## Commandes utiles

```bash
pnpm dev          # lance api + web en parallèle
pnpm db:up        # démarre postgres (docker)
pnpm db:down
pnpm typecheck    # tsc --noEmit partout
pnpm lint         # eslint partout — attrape ce que tsc ne voit pas (règles react-hooks)
pnpm format       # prettier
```

```bash
# Exploitation (depuis apps/api)
pnpm --filter @velyna/api admin:create <email> <mot-de-passe>   # créer/réinitialiser un admin
pnpm --filter @velyna/api journal:seed                          # le journal seul (inclus dans db:seed)
pnpm --filter @velyna/api uploads:sweep                         # images orphelines (simulation)
pnpm --filter @velyna/api uploads:sweep -- --apply              # …et suppression
```

Déploiement : voir `docs/deploiement.md`.

## Git

- Remote : `origin` → `github.com/fousco74/velynaliving`, branche `main`.
- Identité des commits : `KONE Fousseni <konefousseni66@gmail.com>`.
- **Aucune ligne `Co-Authored-By` dans les messages de commit** — retirée de tout l'historique
  le 16/09/2026 à la demande de l'utilisateur. Ne pas la réintroduire.
- Messages en français, corps expliquant le _pourquoi_ quand le diff ne suffit pas.

## Règles de collaboration

- L'assistant **écrit le code** (règle de mentorat levée le 15/09/2026, à la demande de l'utilisateur).
- Expliquer les choix d'architecture après coup, en dev senior : le _pourquoi_, les compromis, les pièges.
- Avancer par **phases**. Voir le détail des phases et la position courante en mémoire (`current-state`).

## État (16/09/2026)

Site public complet + **back-office admin terminé** : auth, commandes (statuts, paiement),
maisons, produits, stock, tableau de bord, journal. Tout en CRUD.

- Commande **en invité** — pas de compte client. `User` = comptes admin uniquement.
- **Aucune intégration de paiement** : l'étape 3 enregistre l'opérateur choisi, `Payment.status = PENDING`.
- Journal **en base** et administrable. Corps d'article en texte : ligne vide = nouveau bloc,
  `## ` = intertitre, `> ` = citation (`parseArticleBody` dans `packages/shared`).
  Reprise du contenu : incluse dans `pnpm --filter @velyna/api db:seed`, ou
  `journal:seed` pour le journal seul (idempotent dans les deux cas).

**Déploiement prêt** : `docker-compose.prod.yml` (Postgres + migrations + API + front),
Dockerfiles, et `docs/deploiement.md` qui couvre les deux cibles — VPS avec Docker, ou
Laravel Forge (qui ne sait pas déployer un compose : chemin natif, daemons supervisés).

**Images statiques administrables** (`/admin/images`) : hero de l'accueil, blocs des deux marques,
vignettes du menu « Marques », pages marques, portraits de la fondatrice, logo, visuel 404.

Reste à faire : conversion Tailwind des pages restantes, intégration paiement.

## Règles non négociables

- Les montants ne viennent **jamais** du client : `POST /orders` ne reçoit que `[{slug, quantity}]`
  et recalcule tout via `computeTotals`.
- Écritures de commande dans un seul `prisma.$transaction`, stock décrémenté par `updateMany`
  conditionnel (`stock >= quantity`) pour éviter la survente.
- Réponses API : `{ data }` en succès, `{ error }` (chaîne) en échec, `issues` en plus si Zod.
- `prisma generate` **et** `prisma migrate` à chaque modif du schéma : la v7 ne chaîne plus les deux.
- **L'API doit être sur un sous-domaine du même domaine que le front.** Le cookie de session
  est en `SameSite=Lax` : il ne franchit pas deux domaines différents, et la connexion au
  back-office échouerait sans erreur visible.
- `NEXT_PUBLIC_API_URL` est inscrit dans le bundle **au build** : le changer impose de
  reconstruire le front, pas de le redémarrer. En face, `API_INTERNAL_URL` est lu à l'exécution
  et sert aux rendus serveur (réseau interne).
- Les images téléversées passent par le relais `/api/uploads/…` du front : URL relative, donc
  ni CORS, ni `remotePatterns`, ni dépendance au DNS public depuis le conteneur.
- `UPLOAD_DIR` doit pointer vers un emplacement **persistant et hors du dépôt**. Sans volume,
  chaque redéploiement efface les images.
- Toute route d'écriture vit sous `/admin`, derrière `requireAdmin`. Les seules écritures
  publiques sont volontaires : `POST /orders` (commande en invité), `POST /journal/:slug/view`
  (compteur de vues) et `POST /auth/login|logout`.
- Les images du back-office se téléversent (`POST /admin/uploads`, corps brut, pas de multipart).
  Elles sont écrites dans `UPLOAD_DIR` côté API et servies sur `/uploads/…` — **jamais** dans
  `apps/web/public/`, qui est du build et repart à zéro à chaque déploiement. Prévoir un volume
  persistant en production. Le format est vérifié par les **octets d'en-tête**, pas par le
  `Content-Type` : SVG refusé, un fichier déguisé en `.jpeg` aussi.
- Toute image venant de la base s'affiche via `imageSrc()` (`apps/web/lib/api.ts`) : `/assets/…`
  est servi par Next depuis `public/`, `/uploads/…` par le relais `/api/uploads/…` du front, qui
  va la chercher sur l'API. Ne jamais pointer un `<Image>` directement sur l'API : son optimiseur
  télécharge côté serveur et dépendrait alors du DNS public depuis le conteneur.
- Les couleurs se déclarent **uniquement** dans le bloc `@theme` de `app/globals.css`. Y toucher
  suffit à changer tout le site : les utilitaires Tailwind lisent ces tokens, et les anciennes
  variables (`--ink`, `--bg`…) en sont de simples alias.
- Le CSS maison reste enveloppé dans `@layer components` tant que la migration n'est pas finie :
  hors layer, il écraserait silencieusement les utilitaires Tailwind.
- Le catalogue des emplacements d'images du site est dans `SITE_IMAGE_SLOTS` (`packages/shared`),
  jamais en base : un emplacement existe parce qu'un composant l'affiche. La table `site_image` ne
  stocke que les **remplacements**, donc supprimer la ligne rétablit le visuel livré. `GET
  /site-images` renvoie toujours la carte complète (fusion faite côté API), et `getSiteImages()`
  retombe sur les valeurs livrées si l'API ne répond pas — il est appelé depuis la mise en page
  racine, donc sur chaque page du site.
- Un schéma PATCH ne se construit **jamais** par `.partial()` sur un schéma portant des `.default()` :
  Zod garde le default et un `PATCH {}` écrit une valeur que personne n'a demandée.
- Dans `pnpm-workspace.yaml`, `allowBuilds` et `onlyBuiltDependencies` doivent rester cohérentes :
  en pnpm 11 la première prime, et un paquet absent d'elle fait échouer tout `pnpm install` sur un
  store vide — clone neuf, CI, image Docker. Invisible en local, où le store a déjà tout compilé.

## Design source

Projet Claude Design `be565d45-bb1e-4513-80d1-f5eab8eabb58`, fichier `Velynaliving.dc.html` + assets. Accès via `/design-login`.
