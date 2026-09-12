# Données de seed — Velyna Living

Extrait du design `Velynaliving.dc.html` (tableau `PRODUITS`) le 2026-09-11.
Sert de source pour `apps/api/prisma/seed.ts`. **Ce fichier est une référence de données, pas du code applicatif.**

## Maisons (2)

| nom | slug suggéré |
| --- | --- |
| Maison Velyná | `maison-velyna` |
| Velynákaï | `velyna-kai` |

## Produits (6)

### Champs structurés

| slug | nom | maison | ref | prix (XOF) | contenance | stock | statut | nouveaute |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `santal-atelier` | Santal Atelier | Maison Velyná | `MV-SA-250` | 29900 | 250 ml | 42 | En ligne | 3 |
| `maison-riviera` | Maison Riviera | Maison Velyná | `MV-MR-250` | 29900 | 250 ml | 28 | En ligne | 2 |
| `fleur-de-lin` | Fleur de Lin | Maison Velyná | `MV-FL-250` | 29900 | 250 ml | 6 | En ligne | 5 |
| `velours-dambre` | Velours d'Ambre | Maison Velyná | `MV-VA-250` | 29900 | 250 ml | 35 | En ligne | 1 |
| `minuit-poudre` | Minuit Poudré | Maison Velyná | `MV-MP-250` | 29900 | 250 ml | 0 | Épuisé | 4 |
| `matcha-ceremonial` | Matcha Latte | Velynákaï | `VK-MC-050` | 25000 | 50 g | 61 | En ligne | 6 |

### Images

| slug | img | imgDetail | fondDetail | encre |
| --- | --- | --- | --- | --- |
| `santal-atelier` | `assets/santal-atelier.jpeg` | — | — | — | 
| `maison-riviera` | `assets/maison-riviera.jpeg` | — | — | — | 
| `fleur-de-lin` | `assets/fleur-de-lin.jpeg` | — | — | — | 
| `velours-dambre` | `assets/velours-dambre.jpeg` | — | — | — | 
| `minuit-poudre` | `assets/minuit-poudre.jpeg` | — | — | — | 
| `matcha-ceremonial` | `assets/velyna-kai.jpeg` | `assets/velynakai-produit.jpeg` | `#7C8446` | `#F4F5E8` | 

> Les fichiers `.jpeg` vivent dans le projet design (dossier `assets/`). À exporter vers `apps/web/public/produits/`.

### Textes longs

#### Santal Atelier — `santal-atelier`

- **tête** : Bergamote, cardamome, cuir
- **cœur** : Bois de santal, iris, violette
- **fond** : Cèdre, ambre, papyrus
- **piece** : Toute la maison
- **ambiance** : L'atelier d'un artiste au petit matin
- **usage** : Une composition intemporelle qui trouve naturellement sa place dans toute la maison. Ses notes boisées et sophistiquées apportent une sensation de calme, d'élégance et de caractère.
- **desc** : Un santal crémeux adouci d'un cuir presque tendre, relevé d'un poivre rose qui claque à l'ouverture. La fragrance s'installe lentement, comme une matière que l'on travaille à la main, et laisse derrière elle une chaleur boisée qui tient toute la journée.

#### Maison Riviera — `maison-riviera`

- **tête** : Citron vert, agrumes, pamplemousse
- **cœur** : Basilic, rose, cassis, thym
- **fond** : Patchouli, réglisse, ambre gris
- **piece** : La cuisine
- **ambiance** : Une terrasse méditerranéenne en fin de journée
- **usage** : Une fragrance fraîche et légère, idéale pour la cuisine. Sa diffusion plus aérienne accompagne parfaitement les moments après préparation des repas en apportant une sensation de fraîcheur.
- **desc** : L'écorce fraîche des agrumes rencontre la chair laiteuse de la figue. Le jasmin apporte une rondeur solaire, le bois flotté une salinité discrète. Une brise entre dans la pièce et n'en repart plus.

#### Fleur de Lin — `fleur-de-lin`

- **tête** : Bergamote, mandarine
- **cœur** : Citron, fleur d'oranger
- **fond** : Cèdre, vétiver
- **piece** : Le linge et les textiles
- **ambiance** : Du linge frais séchant à la fenêtre
- **usage** : La signature de la fraîcheur délicate. Pensée pour le linge et les textiles de la maison, elle sublime la literie, les oreillers, les rideaux, les serviettes, les canapés, les tapis ou encore les petits détails du quotidien.
- **desc** : La propreté comme un luxe. Des aldéhydes pétillants, un cœur de coton et de muguet, puis un musc blanc transparent qui prolonge la sensation de linge séché au vent. Le parfum des chambres claires et des dimanches lents.

#### Velours d'Ambre — `velours-dambre`

- **tête** : Agrumes, pamplemousse rond, pêche, tubéreuse
- **cœur** : Rose, osmanthe, jasmin, muguet
- **fond** : Patchouli, musc, cèdre, ambre gris
- **piece** : Le salon et les espaces de vie
- **ambiance** : Un salon feutré, une soirée d'hiver
- **usage** : Une fragrance enveloppante et chaleureuse, pensée comme une véritable empreinte pour toute la maison. Sa tenue remarquable lui permet de diffuser longtemps son aura élégante, créant une atmosphère raffinée et réconfortante du salon aux espaces de vie.
- **desc** : Des résines chaudes enveloppées de vanille sombre et de fève tonka. La cardamome empêche la douceur de devenir sucrée. Le sillage le plus profond de la maison, celui que l'on garde pour les soirées où l'on reçoit.

#### Minuit Poudré — `minuit-poudre`

- **tête** : Citron vert, orange, pamplemousse
- **cœur** : Poivre, violette, cannelle
- **fond** : Patchouli, cèdre, musc blanc
- **piece** : Les chambres
- **ambiance** : Le silence élégant d'une chambre à minuit
- **usage** : Un parfum délicat autour du musc, imaginé pour les espaces où l'on recherche douceur et apaisement. Il accompagne merveilleusement les chambres parentales, les chambres d'invités ou les espaces des enfants.
- **desc** : L'iris poudré, sensuel et retenu, posé sur un santal crémeux. Une féminité adulte qui ne se raconte pas : elle se remarque quand on quitte la pièce.

#### Matcha Latte — `matcha-ceremonial`

- **tête** : Attaque végétale, herbe fraîche
- **cœur** : Umami dense, noisette
- **fond** : Douceur lactée, longueur sucrée
- **piece** : Le rituel du matin
- **ambiance** : Un instant suspendu, mesuré au geste près
- **usage** : _(absent dans le design — le champ doit être optionnel)_
- **desc** : Feuilles de première récolte ombrées trois semaines avant la cueillette, puis broyées lentement à la meule de pierre. Une poudre vert jade, dense, sans amertume sèche, qui monte en mousse fine et tient longtemps en bouche.

## Remarques pour le schéma

- `matcha-ceremonial` **n'a pas de `usage`** → le champ doit être nullable en base.
- `minuit-poudre` a `stock: 0` et `statut: "Épuisé"` → statut dérivable du stock, ne pas stocker les deux.
- `imgDetail`, `fondDetail`, `encre` : présents uniquement sur le matcha → nullables.
- Les prix sont déjà des entiers XOF, aucune conversion à faire.
- `nouveaute` est un **rang** (1 = plus récent), pas un booléen.
