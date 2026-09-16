# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────────────────────────────────────
# API Velyna — Express 5 + Prisma 7
#
# L'API tourne avec tsx, pas en JavaScript compilé : @velyna/shared est
# distribué en TypeScript brut (`main: ./src/index.ts`), et c'est précisément
# ce qui permet à Next de le transpiler. Le compiler pour l'API casserait le
# build du front. tsx est donc une dépendance de production, assumée.
#
# Debian slim plutôt qu'Alpine : le moteur de migration Prisma s'accommode mal
# de musl/openssl. Quelques mégaoctets de plus contre zéro surprise au déploiement.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:24-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
# openssl : Prisma le cherche pour choisir son moteur et refuse de générer
# sans lui. ca-certificates : indispensable pour joindre une base en TLS.
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app

# ── Dépendances ──────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
# Les outils de migration (CLI prisma) restent présents : l'image sert aussi à
# jouer `migrate deploy`. Élaguer les devDependencies économiserait peu et
# imposerait une seconde image.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter @velyna/api...

# ── Client Prisma ────────────────────────────────────────────────────────────
FROM deps AS build
COPY packages/shared packages/shared
COPY apps/api apps/api
# prisma7.config.ts importe src/config/env.ts, qui refuse de démarrer sans
# configuration valide. Valeurs factices : la génération du client ne se
# connecte à aucune base, elle ne fait qu'écrire src/generated/prisma.
RUN DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build" \
    CORS_ORIGIN="http://localhost" \
    SESSION_SECRET="generation-du-client-uniquement-32-caracteres" \
    pnpm --filter @velyna/api prisma:generate

# ── Exécution ────────────────────────────────────────────────────────────────
FROM build AS runtime
ENV NODE_ENV=production
ENV PORT=4001
# Le dossier est monté sur un volume en production ; le créer ici garantit
# qu'il appartient à l'utilisateur non privilégié même sans volume.
RUN mkdir -p /app/apps/api/uploads && chown -R node:node /app/apps/api/uploads
USER node
EXPOSE 4001
# Un conteneur qui ne répond plus doit être redémarré, pas laissé en place.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4001)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
WORKDIR /app/apps/api
CMD ["pnpm", "start"]
