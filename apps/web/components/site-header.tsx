"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "./cart-provider";

const LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/boutique", label: "Boutique" },
  { href: "/journal", label: "Journal" },
  { href: "/la-maison", label: "A propos" },
  { href: "/contact", label: "Contact" },
];

export const SiteHeader = () => {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    setBrandsOpen(false);
  }, [pathname]);

  return (
    <header className="header">
      <div className="header-bar">
        <Link href="/" className="brand">
          <span>
            VELYNÁ
            <em className="italic" style={{ opacity: 0.75 }}>
              living
            </em>
          </span>
        </Link>

        <nav className={`nav${menuOpen ? " open" : ""}`}>
          {LINKS.slice(0, 1).map((link) => (
            <Link key={link.href} href={link.href} data-active={pathname === link.href}>
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setBrandsOpen((open) => !open)}
            data-active={brandsOpen || pathname.startsWith("/maisons")}
            aria-expanded={brandsOpen}
          >
            Marques
          </button>
          {LINKS.slice(1).map((link) => (
            <Link key={link.href} href={link.href} data-active={pathname.startsWith(link.href)}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <Link href="/suivi-commande" className="track">
            Suivi
          </Link>
          <Link href="/panier" className="cart-btn" aria-label="Panier">
            <svg width="16" height="17" viewBox="0 0 16 17" fill="none" aria-hidden="true">
              <path d="M2 5h12l-1 10.5H3L2 5Z" stroke="currentColor" strokeWidth="0.9" />
              <path d="M5.6 5V3.6a2.4 2.4 0 0 1 4.8 0V5" stroke="currentColor" strokeWidth="0.9" />
            </svg>
            <span>({ready ? count : 0})</span>
          </Link>
          <button
            type="button"
            className="burger"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true">
              <path d="M0 1h22M0 7h22M0 13h22" stroke="currentColor" strokeWidth="1" />
            </svg>
          </button>
        </div>
      </div>

      {brandsOpen && (
        <div className="submenu">
          <div className="submenu-inner">
            <Link href="/maisons/maison-velyna" className="submenu-card">
              <Image
                src="/assets/maison-velyna.jpeg"
                alt="Maison Velyná"
                width={640}
                height={480}
              />
              <p>Maison Velyná</p>
              <p>Fragrances d&apos;intérieur</p>
            </Link>
            <Link href="/maisons/velyna-kai" className="submenu-card">
              <Image
                src="/assets/maison-velyna-kai.jpeg"
                alt="Velynákaï"
                width={640}
                height={480}
              />
              <p>
                <span className="kai-word thin">Velyná</span>
                <span className="kai-word bold">kaï</span>
              </p>
              <p>Matcha &amp; rituels</p>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
