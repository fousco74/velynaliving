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
    "Maison de parfums d'intérieur et matcha de cérémonie à Abidjan. Livraison offerte dès 50 000 F CFA.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${playfair.variable} ${jost.variable} ${garamond.variable}`}
      style={
        {
          "--serif": `var(--font-playfair), Georgia, serif`,
          "--sans": `var(--font-jost), "Helvetica Neue", Arial, sans-serif`,
          "--body": `var(--font-garamond), Georgia, serif`,
        } as React.CSSProperties
      }
    >
      <body>
        <CartProvider>
          <SiteChrome>{children}</SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}
