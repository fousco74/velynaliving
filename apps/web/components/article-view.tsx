"use client";

import { useEffect, useRef } from "react";
import { countArticleView } from "@/lib/api";

/**
 * Incrémente le compteur de lectures d'un article.
 *
 * Volontairement côté navigateur : compter dans le GET de l'API gonflerait le
 * chiffre à chaque rendu serveur de Next (metadata, page, prefetch) sans qu'un
 * lecteur n'ait rien ouvert. Un échec est silencieux — une statistique ne doit
 * jamais casser l'affichage d'un article.
 */
export const ArticleView = ({ slug }: { slug: string }) => {
  const counted = useRef(false);

  useEffect(() => {
    // StrictMode monte le composant deux fois en développement.
    if (counted.current) return;
    counted.current = true;

    void countArticleView(slug).catch(() => {});
  }, [slug]);

  return null;
};
