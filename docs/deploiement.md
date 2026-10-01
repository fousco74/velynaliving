# Déploiement — préproduction puis production

Trois chemins sont supportés. Ils ne se mélangent pas : choisissez-en un.
Les deux premiers sont décrits ci-dessous, Vercel l'est au chemin C.

|                  | **VPS + Docker**     | **Laravel Forge**          |
| ---------------- | -------------------- | -------------------------- |
| Ce qui tourne    | 4 conteneurs         | Node sur l'hôte, supervisé |
| Base de données  | conteneur Postgres   | Postgres géré par Forge    |
| Reverse proxy    | à vous (nginx/Caddy) | nginx géré par Forge       |
| Certificats      | à vous               | Let's Encrypt en un clic   |
| Reproductibilité | forte                | moyenne                    |

> **Forge ne sait pas déployer un `docker-compose`.** Il pilote nginx, des
> daemons supervisés et Postgres sur l'hôte. Avec Forge, on ignore
> `docker-compose.prod.yml` et on suit le chemin B.

---

## 0. Contrainte à respecter avant tout

**L'API doit vivre sur un sous-domaine du même domaine que le front.**

```
front : https://velynaliving.ci
API   : https://api.velynaliving.ci        ✅
API   : https://velyna-api.example.com     ❌
```

Le cookie de session du back-office est en `SameSite=Lax`. Il circule entre
sous-domaines d'un même domaine, **jamais entre deux domaines différents**. Avec
une API sur un autre domaine, la connexion à `/admin` échouerait sans message
d'erreur : le navigateur se contenterait de ne pas envoyer le cookie, et l'API
répondrait 401 à chaque appel.

## 0 bis. Secrets à générer

```bash
openssl rand -base64 48   # SESSION_SECRET
openssl rand -base64 32   # POSTGRES_PASSWORD
```

Ne jamais les committer. `.env`, `.env.prod` sont déjà dans `.gitignore`.

---

## Chemin A — VPS avec Docker

### A1. Préparer la machine

```bash
ssh root@<ip>
adduser velyna && usermod -aG sudo velyna
# Docker (paquet officiel, pas celui de la distribution)
curl -fsSL https://get.docker.com | sh
usermod -aG docker velyna
# Pare-feu : seuls 22, 80 et 443 sont ouverts. Ni 4001, ni 3002, ni 5432.
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw enable
```

### A2. Récupérer le code et configurer

```bash
su - velyna
git clone <dépôt> velyna && cd velyna
cp .env.prod.example .env.prod
nano .env.prod          # domaines + secrets générés plus haut
```

Pour la **préproduction**, utilisez des sous-domaines dédiés :
`preprod.velynaliving.ci` et `api-preprod.velynaliving.ci`, avec leur propre
`.env.prod` et `-p velynapreprod` pour isoler volumes et conteneurs.

### A3. Démarrer

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
docker compose -f docker-compose.prod.yml --env-file .env.prod ps
```

Ordre garanti par le fichier : Postgres devient sain → `migrate` applique les
migrations et s'arrête → l'API démarre → le front démarre.

### A4. Reverse proxy sur l'hôte

Rien n'est exposé publiquement par les conteneurs : ils n'écoutent que sur
`127.0.0.1`. Exemple nginx, un fichier par domaine :

```nginx
server {
    server_name velynaliving.ci;
    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    server_name api.velynaliving.ci;
    # Doit dépasser UPLOAD_MAX_MB, sinon nginx coupe avant l'API.
    client_max_body_size 10M;
    location / {
        proxy_pass http://127.0.0.1:4001;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Puis `certbot --nginx -d velynaliving.ci -d api.velynaliving.ci`.

`X-Forwarded-For` n'est pas décoratif : sans lui, `TRUST_PROXY=1` fait voir à
l'API l'adresse du proxy pour tout le monde, et la limitation des tentatives de
connexion devient un quota partagé par tous les visiteurs.

### A5. Mettre à jour

```bash
git pull
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

⚠️ Si `PUBLIC_API_URL` change, `--build` est **obligatoire** : cette valeur est
inscrite dans le bundle navigateur au moment du build.

---

## Chemin B — Laravel Forge

Forge est prévu pour PHP ; Node y fonctionne très bien via les daemons, mais on
sort du chemin balisé. Tout se fait depuis l'interface, sauf mention contraire.

### B1. Serveur

1. **Create Server** → Ubuntu 24.04, cocher **PostgreSQL**.
2. **Server → Packages** : installer Node 24 (ou via nvm), puis en SSH :
   ```bash
   corepack enable && corepack prepare pnpm@11.15.1 --activate
   ```
3. **Server → Database** : créer la base `velyna` et son utilisateur, noter le
   mot de passe.

### B2. Les deux sites

| Site                  | Type                  | Rôle                               |
| --------------------- | --------------------- | ---------------------------------- |
| `velynaliving.ci`     | Static HTML / Next.js | porte le dépôt, proxy vers `:3000` |
| `api.velynaliving.ci` | Static HTML           | **aucun code**, proxy vers `:4000` |

Les ports diffèrent de ceux du chemin Docker (3002 / 4001) : ici ce sont ceux
de la configuration PM2 (B5), à reporter tels quels dans les `proxy_pass`.

Sur chaque site, **Edit Nginx Configuration** et remplacer le bloc `location /`
par le `proxy_pass` correspondant (voir A4, en-têtes compris ;
`client_max_body_size 10M` sur le site API).

Sur le site principal : **Git Repository** → dépôt, branche `main`,
**sans** installation de composer.

Puis **SSL → Let's Encrypt** sur les deux sites.

### B3. Le fichier `.env` du site

Forge gère **un** `.env` par site (**Site → Environment**), et le script de
déploiement le recopie vers les deux applications :

```bash
cp .env apps/api/.env
cp .env apps/web/.env
```

Un seul fichier porte donc la configuration de l'API _et_ du front :

```
NODE_ENV=production
DATABASE_URL=postgresql://velyna:<mot-de-passe>@127.0.0.1:5432/velyna
CORS_ORIGIN=https://velynaliving.ci
SESSION_SECRET=<openssl rand -base64 48>
SESSION_HOURS=12
UPLOAD_MAX_MB=5
TRUST_PROXY=1

# Chemin ABSOLU, hors du dossier de déploiement. Voir l'encadré de B4 :
# c'est la seule chose qui empêche les images de disparaître à chaque
# déploiement. Le dossier se crée une fois, à la main.
UPLOAD_DIR=/home/forge/velyna-uploads

# Inscrite dans le bundle navigateur AU BUILD — elle doit donc être présente
# dans ce fichier avant `next build`, ce que garantit le `cp` ci-dessus.
NEXT_PUBLIC_API_URL=https://api.velynaliving.ci

# Lue à l'EXÉCUTION par `next start`, pour les rendus serveur et le relais
# d'images : l'API est sur la même machine, autant la joindre en local plutôt
# que de ressortir par le DNS public, TLS et nginx pour un fichier local.
# Le port doit être celui que PM2 donne à l'API (voir B5).
API_INTERNAL_URL=http://127.0.0.1:4000
```

```bash
mkdir -p /home/forge/velyna-uploads
```

`PORT` n'y figure pas : PM2 le fournit à l'API et `next start --port` au front
(B5). C'est volontaire — `dotenv` n'écrase jamais une variable déjà présente
dans l'environnement, donc la valeur de PM2 gagne de toute façon.

### B4. Script de déploiement — releases atomiques

**Site → Deploy Script**. Forge crée un dossier neuf par déploiement
(`releases/<horodatage>`) et bascule le lien `current` dessus une fois le build
réussi : c'est ce qui rend le déploiement atomique.

```bash
$CREATE_RELEASE()

cd $FORGE_RELEASE_DIRECTORY

export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$PNPM_HOME/bin:$PATH"
export NEXT_TELEMETRY_DISABLED=1

cp .env apps/api/.env
cp .env apps/web/.env

pnpm install --frozen-lockfile
pnpm --filter @velyna/api exec prisma generate
pnpm --filter @velyna/api exec prisma migrate deploy
pnpm --filter @velyna/web build

$ACTIVATE_RELEASE()

# Config PM2 : voir B5.
```

> ⚠️ **Tout ce qui n'est pas dans le dépôt meurt avec la release.**
>
> Les anciennes releases sont purgées après quelques déploiements. Un
> `UPLOAD_DIR` relatif (la valeur par défaut, `uploads`) est résolu depuis le
> répertoire de lancement du service, soit `current/apps/api` — donc **dans**
> la release. Le déploiement suivant repart d'un dossier vide pendant que la
> base continue de référencer `/uploads/…` : les images du back-office
> disparaissent du site, puis les fichiers sont supprimés avec l'ancienne
> release. C'est pour cela que l'API refuse désormais de démarrer en
> production avec un `UPLOAD_DIR` relatif, ou qui traverse `releases/` ou
> `current`.

**Récupérer des images déjà perdues** — tant que les releases concernées n'ont
pas été purgées :

```bash
SITE=/home/forge/<site>          # ex. velynaliving-qgvhqp7v.on-forge.com
ls -d $SITE/releases/*/apps/api/uploads 2>/dev/null
mkdir -p /home/forge/velyna-uploads
cp -an $SITE/releases/*/apps/api/uploads/. /home/forge/velyna-uploads/ 2>/dev/null
```

`cp -a -n` préserve les dates et n'écrase rien : les noms de fichiers portent un
suffixe aléatoire, deux releases ne peuvent pas se contredire. Ce qui manque
encore se re-téléverse depuis `/admin` ; pour un emplacement statique
(`/admin/images`), supprimer le remplacement rétablit le visuel livré.

### B5. Processus — PM2

Deux processus, lancés depuis `current/apps/<app>` et réécrits à chaque
déploiement :

| Processus    | Répertoire         | Commande                                  | Port   |
| ------------ | ------------------ | ----------------------------------------- | ------ |
| `velyna-web` | `current/apps/web` | `next start --hostname 127.0.0.1 -p 3000` | `3000` |
| `velyna-api` | `current/apps/api` | `src/server.ts` (`node --import tsx`)     | `4000` |

```bash
pm2 startOrReload /home/forge/.pm2-conf/site-<id>.json --update-env
pm2 save
```

Les ports doivent correspondre à ceux des `proxy_pass` nginx (B2) et à
`API_INTERNAL_URL` (B3). `--update-env` est nécessaire : sans lui, PM2
relancerait les processus avec l'environnement du déploiement précédent.

La sortie « standalone » de Next n'est **pas** active ici (elle l'est
uniquement dans l'image Docker, via `STANDALONE=1`) : `next start` fonctionne.

Au démarrage, l'API journalise le dossier d'images réellement utilisé —
`pm2 logs velyna-api` répond donc directement à « où sont écrites les images ? ».

---

## Chemin C — Vercel (API en fonction serverless)

Deux projets Vercel sur le même dépôt : le front (Root Directory `apps/web`) et
l'API (Root Directory `apps/api`). Ce qui suit concerne l'API.

**Ce qui change par rapport à A et B**, et pourquoi :

- **L'API est bundlée.** `@vercel/node` ne transpile pas le TypeScript de
  `node_modules`, or `@velyna/shared` en est (TypeScript brut, voulu pour Next).
  `pnpm build:vercel` produit `dist/vercel/app.mjs` avec esbuild, `shared` et le
  client Prisma inclus ; `api/index.js` le réexporte. Tout est déclaré dans
  `apps/api/vercel.json` — rien à régler dans l'interface, hors Root Directory.
- **Les images vont dans Vercel Blob**, pas sur disque : une fonction n'a aucun
  disque persistant. Le chemin en base reste `/uploads/<nom>` ; l'API répond à
  `GET /uploads/<nom>` par une redirection vers le blob, que le relais du front
  suit. `UPLOAD_DIR` est ignoré.
- **Les migrations se jouent au build** (`prisma migrate deploy` dans
  `build:vercel`). `DATABASE_URL` doit donc être disponible à l'étape de build.

### C1. Stockage et base

- **Storage → Create → Blob**, puis le connecter au projet API : Vercel injecte
  `BLOB_READ_WRITE_TOKEN`.
- Une base Postgres accessible depuis Internet (Neon, Supabase…). Prendre l'URL
  **poolée** : chaque instance de la fonction ouvre son propre pool.

### C2. Variables d'environnement du projet API

```bash
DATABASE_URL=postgresql://…   # URL POOLÉE du fournisseur
DATABASE_POOL_MAX=2           # par instance — 10 × N instances épuiserait la base
CORS_ORIGIN=https://velynaliving.ci
SESSION_SECRET=…              # openssl rand -base64 48
SESSION_DOMAIN=velynaliving.ci
TRUST_PROXY=1                 # le proxy de Vercel
UPLOAD_STORAGE=blob           # sans le jeton Blob, l'API refuse de démarrer
```

`NODE_ENV=production` est posé par Vercel.

### C3. Domaines

La contrainte du § 0 vaut ici aussi : **`*.vercel.app` ne convient pas**,
`velynaliving.vercel.app` et `velynaliving-api.vercel.app` sont deux domaines
différents pour le navigateur. Rattacher `velynaliving.ci` au projet front et
`api.velynaliving.ci` au projet API.

Côté front, `NEXT_PUBLIC_API_URL` **et** `API_INTERNAL_URL` valent
`https://api.velynaliving.ci` : il n'y a pas de réseau interne entre deux projets
Vercel.

### C4. Limites connues

- **Le limiteur de tentatives de connexion est en mémoire**, donc compté par
  instance : sous charge, plusieurs instances chaudes multiplient le quota.
- **`uploads:sweep` se lance depuis un poste**, avec les variables du projet
  (`vercel env pull`) : il n'y a pas de shell sur une fonction.
- **Reprendre des images d'un disque** (passage de A/B à C) : les déposer une
  fois dans le store sous `uploads/<même nom>`, sans suffixe aléatoire. Les
  chemins en base restent valides tels quels.

---

## Après le premier déploiement, dans les deux cas

```bash
# Docker
docker compose -f docker-compose.prod.yml --env-file .env.prod exec api pnpm db:seed
docker compose -f docker-compose.prod.yml --env-file .env.prod exec api pnpm admin:create <email> <mot-de-passe>

# Forge — toujours depuis `current`, le lien vers la release active
cd /home/forge/<site>/current
pnpm --filter @velyna/api db:seed
pnpm --filter @velyna/api admin:create <email> <mot-de-passe>
```

`db:seed` couvre maisons, produits **et** journal. `journal:seed` existe
toujours pour rejouer le journal seul, mais n'est plus nécessaire ici.

Le seed est idempotent : le rejouer n'écrase rien — ni un prix corrigé depuis
le back-office, ni un article réécrit.

**Le mot de passe administrateur doit être changé** : celui utilisé pendant le
développement (`velyna-test-2026`) ne doit jamais atteindre la production.

### Ménage des images orphelines

Un fichier téléversé puis abandonné (formulaire fermé sans enregistrer) reste
dans le stockage (disque ou Vercel Blob, selon `UPLOAD_STORAGE`). Le balayage ne touche ni `/assets/`, ni les fichiers référencés (produits, journal, images du site),
ni ceux de moins de 24 h — sans ce délai, il supprimerait l'image en cours
d'insertion dans un formulaire encore ouvert.

```bash
pnpm --filter @velyna/api uploads:sweep              # simulation
pnpm --filter @velyna/api uploads:sweep -- --apply   # suppression
```

À mettre en cron hebdomadaire (Forge : **Scheduler**).

### Sauvegardes

Deux choses à sauvegarder, et elles sont indissociables :

```bash
# Docker
docker compose -f docker-compose.prod.yml --env-file .env.prod exec -T postgres \
  pg_dump -U velyna velyna | gzip > velyna-$(date +%F).sql.gz
docker run --rm -v velyna_uploads:/u -v "$PWD":/out alpine \
  tar czf /out/uploads-$(date +%F).tar.gz -C /u .
```

Une base restaurée sans ses images affiche des visuels cassés partout.

---

## Vérifier qu'un déploiement est réussi

```bash
curl -s https://api.velynaliving.ci/health            # {"status":"ok",...}
curl -so /dev/null -w '%{http_code}\n' https://velynaliving.ci/
curl -so /dev/null -w '%{http_code}\n' https://api.velynaliving.ci/admin/stats   # 401 attendu
```

Puis, dans un navigateur : se connecter à `/admin`, téléverser une image sur un
produit, vérifier qu'elle **s'affiche** en boutique. C'est le seul test qui
couvre toute la chaîne — proxy, cookie, CORS, volume, relais d'images.
