# Velyna Living

Site e-commerce d'une maison de parfum (Abidjan, Côte d'Ivoire). Devise XOF (F CFA, entiers), paiement mobile money, téléphone ivoirien +225.

## Stack (monorepo pnpm — packageManager pnpm@11.15.1)

- `apps/api` — Express 5 + Prisma 7 + Zod 4 (+ dotenv, tsx). Port 4001.
- `apps/web` — Next.js 16 App Router (port 3002). **Tailwind v4** ; le thème est dans `@theme`
  en tête de `app/globals.css` (pas de `tailwind.config.js` en v4).
- `packages/shared` — **fichier unique** `src/index.ts` (pas d'import interne : le bundler Next ne résout pas les `.js` de NodeNext). Contient les schémas Zod et `computeTotals`, la source de vérité des montants utilisée par l'API **et** le panier.
- Postgres 16 via `docker-compose.yml` (hôte 5434, db/user `velyna`).

## Commandes utiles

```bash
pnpm dev          # lance api + web en parallèle
pnpm db:up        # démarre postgres (docker)
pnpm db:down
pnpm typecheck    # tsc --noEmit partout
pnpm lint         # eslint partout — attrape ce que tsc ne voit pas (règles react-hooks)
pnpm format       # prettier
```

## Règles de collaboration

- L'assistant **écrit le code** (règle de mentorat levée le 15/09/2026, à la demande de l'utilisateur).
- Expliquer les choix d'architecture après coup, en dev senior : le _pourquoi_, les compromis, les pièges.
- Avancer par **phases**. Voir le détail des phases et la position courante en mémoire (`current-state`).

## État (15/09/2026)

Site public complet + **back-office admin terminé** : auth, commandes (statuts, paiement),
maisons, produits, stock, tableau de bord, journal. Tout en CRUD.

- Commande **en invité** — pas de compte client. `User` = comptes admin uniquement.
- **Aucune intégration de paiement** : l'étape 3 enregistre l'opérateur choisi, `Payment.status = PENDING`.
- Journal **en base** et administrable. Corps d'article en texte : ligne vide = nouveau bloc,
  `## ` = intertitre, `> ` = citation (`parseArticleBody` dans `packages/shared`).
  Reprise du contenu : `pnpm --filter @velyna/api journal:seed` (idempotent).

Reste à faire : conversion Tailwind des pages restantes, intégration paiement, déploiement.

## Règles non négociables

- Les montants ne viennent **jamais** du client : `POST /orders` ne reçoit que `[{slug, quantity}]`
  et recalcule tout via `computeTotals`.
- Écritures de commande dans un seul `prisma.$transaction`, stock décrémenté par `updateMany`
  conditionnel (`stock >= quantity`) pour éviter la survente.
- Réponses API : `{ data }` en succès, `{ error }` (chaîne) en échec, `issues` en plus si Zod.
- `prisma generate` **et** `prisma migrate` à chaque modif du schéma : la v7 ne chaîne plus les deux.
- Toute route d'écriture vit sous `/admin`, derrière `requireAdmin`. Les seules écritures
  publiques sont volontaires : `POST /orders` (commande en invité), `POST /journal/:slug/view`
  (compteur de vues) et `POST /auth/login|logout`.
- Les images du back-office se téléversent (`POST /admin/uploads`, corps brut, pas de multipart).
  Elles sont écrites dans `UPLOAD_DIR` côté API et servies sur `/uploads/…` — **jamais** dans
  `apps/web/public/`, qui est du build et repart à zéro à chaque déploiement. Prévoir un volume
  persistant en production. Le format est vérifié par les **octets d'en-tête**, pas par le
  `Content-Type` : SVG refusé, un fichier déguisé en `.jpeg` aussi.
- Toute image venant de la base s'affiche via `imageSrc()` (`apps/web/lib/api.ts`) : `/assets/…`
  est servi par Next, `/uploads/…` par l'API.
- Les couleurs se déclarent **uniquement** dans le bloc `@theme` de `app/globals.css`. Y toucher
  suffit à changer tout le site : les utilitaires Tailwind lisent ces tokens, et les anciennes
  variables (`--ink`, `--bg`…) en sont de simples alias.
- Le CSS maison reste enveloppé dans `@layer components` tant que la migration n'est pas finie :
  hors layer, il écraserait silencieusement les utilitaires Tailwind.
- Un schéma PATCH ne se construit **jamais** par `.partial()` sur un schéma portant des `.default()` :
  Zod garde le default et un `PATCH {}` écrit une valeur que personne n'a demandée.

## Design source

Projet Claude Design `be565d45-bb1e-4513-80d1-f5eab8eabb58`, fichier `Velynaliving.dc.html` + assets. Accès via `/design-login`.
