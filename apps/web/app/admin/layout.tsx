"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMe, logout, type AdminUser } from "@/lib/api";

const NAV = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/commandes", label: "Commandes" },
  { href: "/admin/produits", label: "Produits" },
  { href: "/admin/maisons", label: "Maisons" },
  { href: "/admin/journal", label: "Journal" },
  { href: "/admin/stock", label: "Stock" },
  { href: "/admin/images", label: "Images" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checked, setChecked] = useState(false);

  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    // La page de connexion n'a rien à vérifier, et elle rend ses enfants avant
    // même que `checked` ne soit consulté : aucun état à poser ici.
    if (isLogin) return;

    // La vraie garde est côté API : chaque route /admin exige le cookie de
    // session. Ce contrôle ne sert qu'à éviter d'afficher une coquille vide
    // à qui n'est pas connecté.
    getMe()
      .then(setUser)
      .catch(() => router.replace("/admin/login"))
      .finally(() => setChecked(true));
  }, [isLogin, pathname, router]);

  const signOut = async () => {
    await logout().catch(() => {});
    router.replace("/admin/login");
  };

  if (isLogin) return <div className="admin">{children}</div>;

  if (!checked || !user) {
    return (
      <div className="admin admin-center">
        <p className="eyebrow">Vérification de la session…</p>
      </div>
    );
  }

  return (
    <div className="admin">
      <header className="admin-bar">
        <Link href="/admin" className="admin-brand">
          VELYNÁ<span>administration</span>
        </Link>

        <nav className="admin-nav">
          {NAV.map((item) => {
            const active =
              item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

            return (
              <Link key={item.href} href={item.href} data-active={active}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="admin-session">
          <span>{user.email}</span>
          <button type="button" onClick={signOut}>
            Déconnexion
          </button>
        </div>
      </header>

      <main className="admin-main">{children}</main>
    </div>
  );
}
