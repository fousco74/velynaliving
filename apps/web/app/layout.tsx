import type { Metadata } from "next";
import { EB_Garamond, Jost, Playfair_Display } from "next/font/google";
import { CartProvider } from "@/components/cart-provider";
import { SiteChrome } from "@/components/site-chrome";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
  variable: "--font-jost",
  display: "swap",
});

const garamond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-garamond",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VELYNÁLIVING — Where comfort meets luxury",
    template: "%s — VELYNÁLIVING",
  },
  description:
    "Maison de parfums d'intérieur et de matcha à Abidjan. Livraison offerte dès 50 000 F CFA.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Les familles sont assemblées dans le thème (app/globals.css) : ici on ne
    // publie que les variables de next/font.
    <html lang="fr" className={`${playfair.variable} ${jost.variable} ${garamond.variable}`}>
      <body className="font-body bg-surface text-ink antialiased">
        <CartProvider>
          <SiteChrome>{children}</SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}
