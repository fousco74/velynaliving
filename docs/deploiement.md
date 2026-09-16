# Déploiement — préproduction puis production

Deux chemins sont supportés. Ils ne se mélangent pas : choisissez-en un.

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
| `velynaliving.ci`     | Static HTML / Next.js | porte le dépôt, proxy vers `:3002` |
| `api.velynaliving.ci` | Static HTML           | **aucun code**, proxy vers `:4001` |

Sur chaque site, **Edit Nginx Configuration** et remplacer le bloc `location /`
par le `proxy_pass` correspondant (voir A4, en-têtes compris ;
`client_max_body_size 10M` sur le site API).

Sur le site principal : **Git Repository** → dépôt, branche `main`,
**sans** installation de composer.

Puis **SSL → Let's Encrypt** sur les deux sites.

### B3. Configuration

En SSH, créer le fichier d'environnement de l'API — Forge gère un `.env` par
site, mais l'API lit le sien dans `apps/api/` :

```bash
cd /home/forge/velynaliving.ci
cp apps/api/.env.example apps/api/.env
nano apps/api/.env
```

Valeurs de production :

```
NODE_ENV=production
PORT=4001
DATABASE_URL=postgresql://velyna:<mot-de-passe>@127.0.0.1:5432/velyna
CORS_ORIGIN=https://velynaliving.ci
SESSION_SECRET=<openssl rand -base64 48>
SESSION_HOURS=12
UPLOAD_DIR=/home/forge/velyna-uploads
UPLOAD_MAX_MB=5
TRUST_PROXY=1
```

```bash
mkdir -p /home/forge/velyna-uploads
```

`UPLOAD_DIR` pointe **hors du dépôt** : les images téléversées sont des données,
elles ne doivent pas dépendre du dossier de déploiement.

### B4. Script de déploiement

**Site → Deploy Script** :

```bash
cd /home/forge/velynaliving.ci
git pull origin main

export PATH="$HOME/.local/share/pnpm:$PATH"
corepack enable

pnpm install --frozen-lockfile
pnpm --filter @velyna/api prisma:generate
pnpm --filter @velyna/api migrate:deploy

# ⚠️ Inscrit dans le bundle navigateur : doit être présent AU BUILD.
NEXT_PUBLIC_API_URL=https://api.velynaliving.ci pnpm --filter @velyna/web build

sudo -S supervisorctl restart all
```

### B5. Daemons

**Server → Daemons**, deux entrées, répertoire `/home/forge/velynaliving.ci`,
utilisateur `forge` :

| Commande                          | Rôle                   |
| --------------------------------- | ---------------------- |
| `pnpm --filter @velyna/api start` | API sur le port 4001   |
| `pnpm --filter @velyna/web start` | front sur le port 3002 |

La sortie « standalone » de Next n'est **pas** active ici (elle l'est
uniquement dans l'image Docker, via `STANDALONE=1`) : `next start` fonctionne.

---

## Après le premier déploiement, dans les deux cas

```bash
# Docker
docker compose -f docker-compose.prod.yml --env-file .env.prod exec api pnpm db:seed
docker compose -f docker-compose.prod.yml --env-file .env.prod exec api pnpm journal:seed
docker compose -f docker-compose.prod.yml --env-file .env.prod exec api pnpm admin:create <email> <mot-de-passe>

# Forge
cd /home/forge/velynaliving.ci
pnpm --filter @velyna/api db:seed
pnpm --filter @velyna/api journal:seed
pnpm --filter @velyna/api admin:create <email> <mot-de-passe>
```

Les deux seeds sont idempotents : les rejouer n'écrase rien.

**Le mot de passe administrateur doit être changé** : celui utilisé pendant le
développement (`velyna-test-2026`) ne doit jamais atteindre la production.

### Ménage des images orphelines

Un fichier téléversé puis abandonné (formulaire fermé sans enregistrer) reste
sur le disque. Le balayage ne touche ni `/assets/`, ni les fichiers référencés,
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
