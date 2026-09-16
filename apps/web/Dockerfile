# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────────────────────────────────────
# Front Velyna — Next.js 16, sortie autonome
#
# ⚠️ NEXT_PUBLIC_API_URL est un ARG, pas une variable d'exécution : Next
# l'inscrit dans le bundle envoyé au navigateur au moment du build. Changer
# l'adresse de l'API impose donc de RECONSTRUIRE cette image — la modifier
# dans docker-compose n'aurait aucun effet.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:24-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

# ── Dépendances ──────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter @velyna/web...

# ── Build ────────────────────────────────────────────────────────────────────
FROM deps AS build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
# Active la sortie autonome (voir apps/web/next.config.ts).
ENV STANDALONE=1
COPY packages/shared packages/shared
COPY apps/web apps/web
RUN test -n "$NEXT_PUBLIC_API_URL" || (echo "NEXT_PUBLIC_API_URL manquant : le bundle client pointerait vers localhost." && exit 1)
RUN pnpm --filter @velyna/web build

# ── Exécution ────────────────────────────────────────────────────────────────
FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=3002
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
# La sortie autonome embarque son propre node_modules réduit : rien à installer.
COPY --from=build --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=node:node /app/apps/web/public ./apps/web/public
USER node
EXPOSE 3002
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3002)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "apps/web/server.js"]
