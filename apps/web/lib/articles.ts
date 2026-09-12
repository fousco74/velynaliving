export type ArticleBlock = { kind: "p" | "h2" | "quote"; text: string };

export type Article = {
  slug: string;
  title: string;
  category: string;
  date: string;
  readingTime: string;
  img: string;
  views: number;
  excerpt: string;
  body: ArticleBlock[];
};

/** Contenu éditorial figé : le journal n'est pas géré en base dans cette version. */
export const ARTICLES: Article[] = [
  {
    "slug": "fragrance-par-espace",
    "title": "Une fragrance pour chaque espace de vie",
    "category": "Fragrances",
    "date": "2 septembre 2026",
    "readingTime": "6 min",
    "img": "/assets/les-5-parfums.jpeg",
    "views": 3204,
    "excerpt": "Chez MAISON VELYNÁ, chaque fragrance a été pensée comme une signature olfactive destinée à accompagner les différents espaces de vie.",
    "body": [
      {
        "kind": "p",
        "text": "Chez MAISON VELYNÁ, chaque fragrance a été pensée comme une signature olfactive destinée à accompagner les différents espaces de vie. Nous avons imaginé une fragrance pour chaque moment de la maison."
      },
      {
        "kind": "p",
        "text": "Une maison ne se parfume pas d'un seul geste : elle se compose. À chaque pièce son intensité, sa matière et son heure. Voici comment nous avons pensé la répartition des cinq signatures."
      },
      {
        "kind": "quote",
        "text": "Il ne s'agit pas seulement de parfumer une pièce, mais de créer une émotion, une ambiance et un souvenir olfactif propre à chaque maison."
      },
      {
        "kind": "p",
        "text": "Chez MAISON VELYNÁ, chaque parfum raconte une histoire : celle d'un intérieur vivant, élégant et personnalisé."
      }
    ]
  },
  {
    "slug": "interieur-sanctuaire",
    "title": "Faire de son intérieur un sanctuaire",
    "category": "Art de vivre",
    "date": "26 août 2026",
    "readingTime": "5 min",
    "img": "/assets/hero-ambiance.jpeg",
    "views": 2418,
    "excerpt": "Parce que notre intérieur devrait être bien plus qu'un simple lieu de vie.",
    "body": [
      {
        "kind": "p",
        "text": "Nous passons une grande partie de nos journées à l'extérieur, exposés à de multiples sollicitations. Nous dépensons continuellement notre énergie, qu'elle soit physique, mentale ou émotionnelle, jusqu'à parfois rentrer chez nous complètement épuisés."
      },
      {
        "kind": "p",
        "text": "Parce que notre intérieur devrait être bien plus qu'un simple lieu de vie, VELYNÁliving a imaginé un univers sophistiqué, pensé pour le confort, l'équilibre et le bien-être. À travers ses différentes marques, nous créons des espaces qui invitent à ralentir, à se recentrer et à retrouver une énergie profonde."
      },
      {
        "kind": "h2",
        "text": "Les leviers du ressourcement"
      },
      {
        "kind": "p",
        "text": "Nos solutions s'appuient sur des outils et des expériences qui favorisent le ressourcement : une ambiance sensorielle harmonieuse, un design raffiné, des parfums d'intérieur, des matières nobles, une décoration apaisante, une lumière adaptée, ainsi que des éléments de bien-être qui stimulent la sérénité et l'équilibre émotionnel."
      },
      {
        "kind": "quote",
        "text": "En transformant votre intérieur en un véritable sanctuaire, vous optimisez votre récupération et renforcez votre stabilité émotionnelle."
      },
      {
        "kind": "p",
        "text": "Vous retrouvez ainsi toute l'énergie nécessaire pour accueillir chaque nouvelle journée avec confiance et maximiser votre productivité."
      },
      {
        "kind": "p",
        "text": "Chez VELYNÁliving, nous créons des environnements qui prennent soin de votre énergie afin que vous puissiez révéler le meilleur de vous-même, chez vous comme à l'extérieur."
      }
    ]
  },
  {
    "slug": "art-du-matcha",
    "title": "L'art de préparer un matcha parfait",
    "category": "Rituels",
    "date": "18 août 2026",
    "readingTime": "6 min",
    "img": "/assets/velyna-kai.jpeg",
    "views": 1842,
    "excerpt": "Quatre minutes, une eau à 80°, et le silence qu'il faut autour.",
    "body": [
      {
        "kind": "p",
        "text": "Le matcha ne se boit pas dans la précipitation. Il demande une eau que l'on a laissée redescendre, un bol assez large pour que le fouet travaille, et l'acceptation d'un geste que l'on répète sans chercher à l'améliorer."
      },
      {
        "kind": "p",
        "text": "Contrairement au thé infusé, le matcha n'est pas filtré : on boit la feuille entière, réduite en poudre. Tout ce qui se passe dans le bol reste dans la tasse."
      },
      {
        "kind": "h2",
        "text": "L'eau, d'abord"
      },
      {
        "kind": "p",
        "text": "Une eau bouillante brûle la poudre et libère une amertume sèche qui ne part plus. Portez à ébullition, puis attendez trois minutes hors du feu : vous serez autour de 80°, la fenêtre juste. Réchauffez le bol, videz-le, essuyez-le."
      },
      {
        "kind": "h2",
        "text": "Tamiser n'est pas une coquetterie"
      },
      {
        "kind": "p",
        "text": "Deux chashaku passés au tamis fin donnent une poudre aérienne qui se disperse instantanément. Sans tamis, il reste des grumeaux que le fouet ne défera pas."
      },
      {
        "kind": "quote",
        "text": "Le tamis décide de la texture finale. C'est le geste que l'on saute quand on est pressé, et celui qui manque toujours."
      },
      {
        "kind": "h2",
        "text": "Le fouet, en W"
      },
      {
        "kind": "p",
        "text": "Versez un tiers de l'eau et déliez la poudre en pâte lisse. Ajoutez le reste, puis fouettez en W, poignet souple, avant-bras immobile. Jamais en cercles, qui écrasent la mousse au lieu de la lever."
      },
      {
        "kind": "h2",
        "text": "Le geste principal : attendre"
      },
      {
        "kind": "p",
        "text": "Reposez le bol et ne faites rien. Puis buvez en trois gorgées, dans les deux minutes. Au-delà, la mousse retombe et le matcha devient une autre boisson."
      }
    ]
  },
  {
    "slug": "energie-sans-agitation",
    "title": "Le matcha, une énergie sans agitation",
    "category": "Bien-être",
    "date": "29 juillet 2026",
    "readingTime": "5 min",
    "img": "/assets/velyna-kai.jpeg",
    "views": 1476,
    "excerpt": "Pourquoi la même caféine produit un effet si différent d'un café.",
    "body": [
      {
        "kind": "p",
        "text": "Un bol de matcha contient à peu près autant de caféine qu'un espresso. Pourtant, l'effet ne ressemble en rien : pas de pic, pas de chute, pas de cette accélération un peu fébrile de la deuxième tasse."
      },
      {
        "kind": "h2",
        "text": "La L-théanine, cet acide aminé discret"
      },
      {
        "kind": "p",
        "text": "Les feuilles ombrées avant la récolte concentrent un acide aminé, la L-théanine, qui donne au matcha son umami et sa rondeur. Elle modère l'absorption de la caféine : l'énergie monte plus lentement et redescend en pente douce."
      },
      {
        "kind": "quote",
        "text": "Le matcha n'impose rien. Il installe un rythme, et c'est déjà beaucoup."
      },
      {
        "kind": "h2",
        "text": "Le bon moment"
      },
      {
        "kind": "p",
        "text": "Le milieu de matinée et le début d'après-midi conviennent le mieux. Évitez le matcha à jeun. Une tasse par jour, préparée avec attention, produit plus d'effet que trois avalées entre deux dossiers."
      }
    ]
  }
];

export const getArticle = (slug: string) => ARTICLES.find((article) => article.slug === slug);
