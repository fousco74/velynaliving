import { disconnect, prisma } from "../src/db.js";

/**
 * Reprise du journal éditorial dans la base.
 *
 *   pnpm --filter @velyna/api journal:seed
 *
 * Le contenu vivait en dur dans `apps/web/lib/articles.ts` tant que le journal
 * n'était pas administrable. Ce script est la bascule, et il est idempotent :
 * il n'écrase pas un article déjà en base — un texte corrigé depuis le
 * back-office ne doit pas revenir à sa version figée si on le rejoue.
 */
const articles = [
  {
    slug: "fragrance-par-espace",
    title: "Une fragrance pour chaque espace de vie",
    category: "Fragrances",
    excerpt:
      "Chez MAISON VELYNÁ, chaque fragrance a été pensée comme une signature olfactive destinée à accompagner les différents espaces de vie.",
    imageUrl: "/assets/les-parfums.jpeg",
    readingTime: "6 min",
    views: 3204,
    publishedAt: "2026-09-02",
    body: "Chez MAISON VELYNÁ, chaque fragrance a été pensée comme une signature olfactive destinée à accompagner les différents espaces de vie. Nous avons imaginé une fragrance pour chaque moment de la maison.\n\nUne maison ne se parfume pas d'un seul geste : elle se compose. À chaque pièce son intensité, sa matière et son heure. Voici comment nous avons pensé la répartition des cinq signatures.\n\n> Il ne s'agit pas seulement de parfumer une pièce, mais de créer une émotion, une ambiance et un souvenir olfactif propre à chaque maison.\n\nChez MAISON VELYNÁ, chaque parfum raconte une histoire : celle d'un intérieur vivant, élégant et personnalisé.",
  },
  {
    slug: "interieur-sanctuaire",
    title: "Faire de son intérieur un sanctuaire",
    category: "Art de vivre",
    excerpt: "Parce que notre intérieur devrait être bien plus qu'un simple lieu de vie.",
    imageUrl: "/assets/hero-ambiance.jpeg",
    readingTime: "5 min",
    views: 2418,
    publishedAt: "2026-08-26",
    body: "Nous passons une grande partie de nos journées à l'extérieur, exposés à de multiples sollicitations. Nous dépensons continuellement notre énergie, qu'elle soit physique, mentale ou émotionnelle, jusqu'à parfois rentrer chez nous complètement épuisés.\n\nParce que notre intérieur devrait être bien plus qu'un simple lieu de vie, VELYNÁliving a imaginé un univers sophistiqué, pensé pour le confort, l'équilibre et le bien-être. À travers ses différentes marques, nous créons des espaces qui invitent à ralentir, à se recentrer et à retrouver une énergie profonde.\n\n## Les leviers du ressourcement\n\nNos solutions s'appuient sur des outils et des expériences qui favorisent le ressourcement : une ambiance sensorielle harmonieuse, un design raffiné, des parfums d'intérieur, des matières nobles, une décoration apaisante, une lumière adaptée, ainsi que des éléments de bien-être qui stimulent la sérénité et l'équilibre émotionnel.\n\n> En transformant votre intérieur en un véritable sanctuaire, vous optimisez votre récupération et renforcez votre stabilité émotionnelle.\n\nVous retrouvez ainsi toute l'énergie nécessaire pour accueillir chaque nouvelle journée avec confiance et maximiser votre productivité.\n\nChez VELYNÁliving, nous créons des environnements qui prennent soin de votre énergie afin que vous puissiez révéler le meilleur de vous-même, chez vous comme à l'extérieur.",
  },
  {
    slug: "art-du-matcha",
    title: "L'art de préparer un matcha parfait",
    category: "Rituels",
    excerpt: "Quatre minutes, une eau à 80°, et le silence qu'il faut autour.",
    imageUrl: "/assets/velyna-kai.jpeg",
    readingTime: "6 min",
    views: 1842,
    publishedAt: "2026-08-18",
    body: "Le matcha ne se boit pas dans la précipitation. Il demande une eau que l'on a laissée redescendre, un bol assez large pour que le fouet travaille, et l'acceptation d'un geste que l'on répète sans chercher à l'améliorer.\n\nContrairement au thé infusé, le matcha n'est pas filtré : on boit la feuille entière, réduite en poudre. Tout ce qui se passe dans le bol reste dans la tasse.\n\n## L'eau, d'abord\n\nUne eau bouillante brûle la poudre et libère une amertume sèche qui ne part plus. Portez à ébullition, puis attendez trois minutes hors du feu : vous serez autour de 80°, la fenêtre juste. Réchauffez le bol, videz-le, essuyez-le.\n\n## Tamiser n'est pas une coquetterie\n\nDeux chashaku passés au tamis fin donnent une poudre aérienne qui se disperse instantanément. Sans tamis, il reste des grumeaux que le fouet ne défera pas.\n\n> Le tamis décide de la texture finale. C'est le geste que l'on saute quand on est pressé, et celui qui manque toujours.\n\n## Le fouet, en W\n\nVersez un tiers de l'eau et déliez la poudre en pâte lisse. Ajoutez le reste, puis fouettez en W, poignet souple, avant-bras immobile. Jamais en cercles, qui écrasent la mousse au lieu de la lever.\n\n## Le geste principal : attendre\n\nReposez le bol et ne faites rien. Puis buvez en trois gorgées, dans les deux minutes. Au-delà, la mousse retombe et le matcha devient une autre boisson.",
  },
  {
    slug: "energie-sans-agitation",
    title: "Le matcha, une énergie sans agitation",
    category: "Bien-être",
    excerpt: "Pourquoi la même caféine produit un effet si différent d'un café.",
    imageUrl: "/assets/velyna-kai.jpeg",
    readingTime: "5 min",
    views: 1476,
    publishedAt: "2026-07-29",
    body: "Un bol de matcha contient à peu près autant de caféine qu'un espresso. Pourtant, l'effet ne ressemble en rien : pas de pic, pas de chute, pas de cette accélération un peu fébrile de la deuxième tasse.\n\n## La L-théanine, cet acide aminé discret\n\nLes feuilles ombrées avant la récolte concentrent un acide aminé, la L-théanine, qui donne au matcha son umami et sa rondeur. Elle modère l'absorption de la caféine : l'énergie monte plus lentement et redescend en pente douce.\n\n> Le matcha n'impose rien. Il installe un rythme, et c'est déjà beaucoup.\n\n## Le bon moment\n\nLe milieu de matinée et le début d'après-midi conviennent le mieux. Évitez le matcha à jeun. Une tasse par jour, préparée avec attention, produit plus d'effet que trois avalées entre deux dossiers.",
  },
];

const main = async () => {
  let created = 0;

  for (const article of articles) {
    const result = await prisma.journal.createMany({
      data: {
        ...article,
        // Midi UTC : à minuit, un lecteur à l'ouest de Greenwich verrait la veille.
        publishedAt: new Date(`${article.publishedAt}T12:00:00Z`),
        status: "PUBLISHED",
      },
      skipDuplicates: true,
    });

    created += result.count;
  }

  console.log(
    `Journal : ${created} article(s) créé(s), ${articles.length - created} déjà en base.`,
  );
};

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(disconnect);
