"use client";

import Link from "next/link";
import { ProductForm } from "@/components/product-form";

export default function NewProductPage() {
  return (
    <>
      <header className="admin-head">
        <div>
          <Link href="/admin/produits" className="eyebrow link-underline">
            ← Produits
          </Link>
          <h1 className="admin-title" style={{ marginTop: 10 }}>
            Nouveau produit
          </h1>
          <p className="admin-sub" style={{ marginTop: 8 }}>
            Créé en brouillon par défaut : rien n&apos;apparaît en boutique tant que vous ne passez
            pas la visibilité en ligne.
          </p>
        </div>
      </header>

      <ProductForm />
    </>
  );
}
