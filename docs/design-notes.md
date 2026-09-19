# Velyna Living — Spécification issue du design

Source : projet Claude Design `Velynaliving.dc.html` + `support.js` (relevé le 2026-09-07).
Ce document décrit **ce que le produit doit faire**. Il sert de référence pour modéliser les données et construire l'app.

## Vue d'ensemble

Site e-commerce d'une maison de parfums d'ambiance + matcha, à Abidjan (Côte d'Ivoire).

- **Deux marques (« maisons »)** : _Maison Velyná_ (parfums d'intérieur 250 ml) et _Velynákaï_ (matcha).
- **Devise** : F CFA (affichage possible en €, taux 1 € = 655,957 F CFA). Montants en entiers.
- **Front-office public** (boutique, journal, panier, commande, suivi…) **+ back-office admin** (dashboard, commandes, produits, clients, articles, paramètres).

## Marques / maisons

Valeurs observées : `Maison Velyná`, `Velynákaï`. C'est un simple libellé sur le produit (pas une entité riche dans le design).

## Produits (6 au total)

5 parfums d'intérieur à **29 900 F CFA** + 1 matcha à **25 000 F CFA**.

Champs observés :

- `slug` (ex. `santal-atelier`, `matcha-ceremonial`) — unique, sert d'URL
- `nom` (ex. « Santal Atelier », « Matcha Latte »)
- `maison` (« Maison Velyná » / « Velynákaï »)
- `img`, `imgDetail` (optionnel), `fondDetail` (couleur optionnelle), `encre` (optionnel)
- `contenance` (« 250 ml », « 50 g »)
- `prix` (entier, F CFA)
- `ref` (référence SKU, ex. `MV-SA-250`, `VK-MC-050`)
- `stock` (entier)
- `statut` : `En ligne` | `Épuisé`
- `nouveaute` (rang de nouveauté, entier)
- `tete`, `coeur`, `fond` — les 3 niveaux de notes olfactives (chaîne libre)
- `piece` (pièce cible, ex. « La cuisine »)
- `usage` (usage conseillé, texte long)
- `ambiance` (ambiance, courte phrase)
- `desc` (description, texte long)

Produits : `santal-atelier`, `maison-riviera`, `fleur-de-lin`, `velours-dambre`, `minuit-poudre` (stock 0 → « Épuisé »), `matcha-ceremonial`.

## Articles / journal (blog)

Champs observés :

- `slug`, `titre`, `cat` (catégorie), `date`, `lecture` (« 6 min »), `img`, `vues` (entier), `statut` (`Publié` | `Brouillon`), `chapo`, `corps` (liste de blocs : paragraphe / titre H2 / citation).

Catégories : `Rituels`, `Fragrances`, `Bien-être`, `Art de vivre`, `La Maison`.

## Commandes

Champs observés :

- `id` au format `VL-2026-XXXX`
- `date`, `client` (nom complet), `email`, `tel`, `commune`
- `montant` (entier F CFA, total)
- `paiement` : `Orange Money` | `MTN Money` | `Moov Money` | `Wave` | `Carte bancaire` | `Paiement à la livraison`
- `statut` : `Nouvelle` | `En préparation` | `Expédiée` | `Livrée` | `Annulée` | `Remboursée`
- `articles` : liste de `[slug, quantité]`
- `frais` (frais de livraison, entier)
- `historique` : liste de `[date/heure, événement]`

## Clients

Dérivé des commandes dans le design : `nom`, `email`, `tel`, `commune`, nombre de commandes, total dépensé.

## Règles métier (importantes)

- **Livraison** : Abidjan 2 000 F (24-48 h) · Intérieur 5 000 F (3-5 j) · Retrait boutique Cocody gratuit (24 h).
- **Livraison offerte dès 50 000 F CFA** d'achat.
- **Code promo** : `VELYNA10` = -10 %.
- **Retours** sous 14 jours, remboursement sous 7 jours ouvrés.
- **Téléphone** : format `+225 07 00 00 00 00` (voir `phoneCI` dans `packages/shared`).
- **Communes** (14) : Cocody, Plateau, Marcory, Treichville, Yopougon, Abobo, Adjamé, Attécoubé, Koumassi, Port-Bouët, Bingerville, Songon, Anyama, Autre.

## Tunnel de commande (3 étapes)

1. **Coordonnées** : prénom, nom, email, téléphone.
2. **Livraison** : adresse, commune (liste), instructions (optionnel), mode de livraison.
3. **Paiement** : choix de l'opérateur.

## Suivi de commande

Par numéro `VL-2026-XXXX` + email.

## Back-office admin

- **Connexion** (démo : `admin@velynaliving.com` / `velyna2026`).
- **Dashboard** : KPI (CA du mois, commandes du mois, panier moyen, commandes en attente), graphique ventes 30 j, répartition CA par maison, top 5 produits, dernières commandes, alertes stock (≤ 6).
- **Commandes** : liste filtrable par statut + recherche, détail d'une commande, changement de statut, notes internes.
- **Produits** : liste avec ajustement de stock (+/-), édition d'un produit.
- **Clients** : liste dérivée des commandes.
- **Articles** : liste du journal.
- **Paramètres** : onglets Général / Livraison / Paiement / Notifications / Utilisateurs.

## Pages publiques

`home`, `maisons`, `maison-velyna`, `velyna-kai`, `boutique` (catalogue + filtre maison + tri), `produit`, `journal`, `article`, `panier`, `commande` (tunnel), `confirmation`, `suivi-commande`, `la-maison`, `contact`, `faq`, `livraison-retours`, `mentions-legales`, `cgv`, `confidentialite`, `404`.
