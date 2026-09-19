"use client";

import { usePathname } from "next/navigation";
import type { SiteImages } from "@velyna/shared";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

/**
 * Le back-office n'a ni l'en-tête ni le pied de page de la boutique.
 *
 * L'alternative idiomatique serait deux groupes de routes — `(site)` et
 * `(admin)` — avec chacun sa mise en page racine. Elle imposerait de déplacer
 * les 21 pages publiques et laisserait `not-found.tsx` sans chrome. Un seul
 * point de décision ici coûte moins cher et se défait en une minute le jour
 * où l'admin justifie sa propre racine.
 */
export const SiteChrome = ({
  children,
  siteImages,
}: {
  children: React.ReactNode;
  siteImages: SiteImages;
}) => {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return <>{children}</>;

  return (
    <div className="shell">
      <SiteHeader siteImages={siteImages} />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
};
