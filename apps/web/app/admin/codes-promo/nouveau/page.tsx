"use client";

import Link from "next/link";
import { PromoForm } from "@/components/promo-form";

export default function NewPromoCodePage() {
  return (
    <>
      <header className="admin-head">
        <div>
          <Link href="/admin/codes-promo" className="eyebrow link-underline">
            ← Codes promo
          </Link>
          <h1 className="admin-title" style={{ marginTop: 10 }}>
            Nouveau code
          </h1>
          <p className="admin-sub" style={{ marginTop: 8 }}>
            Un code par événement : anniversaire, Noël, fête des mères… Programmez-le à
            l&apos;avance, il ne s&apos;activera qu&apos;à son premier jour.
          </p>
        </div>
      </header>

      <PromoForm />
    </>
  );
}
