# Velyna Living

Site e-commerce d'une maison de parfum (Abidjan, Côte d'Ivoire). Devise XOF (F CFA, entiers), paiement mobile money, téléphone ivoirien +225.

## Stack (monorepo pnpm — packageManager pnpm@11.15.1)

- `apps/api` — Express 5 + Prisma 7 + Zod 4 (+ dotenv, tsx). Port 4001.
- `apps/web` — Next.js 16 App Router (port 3002). CSS global maison (`app/globals.css`), pas de Tailwind.
- `packages/shared` — **fichier unique** `src/index.ts` (pas d'import interne : le bundler Next ne résout pas les `.js` de NodeNext). Contient les schémas Zod et `computeTotals`, la source de vérité des montants utilisée par l'API **et** le panier.
- Postgres 16 via `docker-compose.yml` (hôte 5434, db/user `velyna`).

## Commandes utiles

```bash
pnpm dev          # lance api + web en parallèle
pnpm db:up        # démarre postgres (docker)
pnpm db:down
pnpm typecheck    # tsc --noEmit partout
pnpm format       # prettier
```

## Règles de collaboration (mentorat)

- L'utilisateur **tape tout le code lui-même**. Ne pas générer le code à sa place.
- Rôle de l'assistant : expliquer le *pourquoi* + bonnes pratiques **avant**, guider si bloqué, **reviewer** après coup comme un dev senior.
- Avancer par **phases**. Voir le détail des phases et la position courante en mémoire (`current-state`).

## État (12/09/2026)

V1 livrée : site public complet (accueil, boutique, fiche produit, marques, journal, panier,
tunnel 3 étapes, confirmation, suivi, pages légales, 404), responsive mobile/tablette/desktop.

- Commande **en invité** — pas de compte client. `User` = comptes admin uniquement.
- **Aucune intégration de paiement** : l'étape 3 enregistre l'opérateur choisi, `Payment.status = PENDING`.
- Journal : contenu figé dans `apps/web/lib/articles.ts`, pas en base.

Reste à faire : back-office admin (auth, commandes, stock), intégration paiement, déploiement.

## Règles non négociables

- Les montants ne viennent **jamais** du client : `POST /orders` ne reçoit que `[{slug, quantity}]`
  et recalcule tout via `computeTotals`.
- Écritures de commande dans un seul `prisma.$transaction`, stock décrémenté par `updateMany`
  conditionnel (`stock >= quantity`) pour éviter la survente.
- Réponses API : `{ data }` en succès, `{ error }` (chaîne) en échec, `issues` en plus si Zod.
- `prisma generate` **et** `prisma migrate` à chaque modif du schéma : la v7 ne chaîne plus les deux.
- ⚠️ `POST /houses` n'est protégé par aucune auth — à sécuriser avant déploiement.

## Design source

Projet Claude Design `be565d45-bb1e-4513-80d1-f5eab8eabb58`, fichier `Velynaliving.dc.html` + assets. Accès via `/design-login`.
