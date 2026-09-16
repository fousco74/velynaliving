"use client";

import Link from "next/link";
import { JournalForm } from "@/components/journal-form";

export default function NewArticlePage() {
  return (
    <>
      <header className="admin-head">
        <div>
          <Link href="/admin/journal" className="eyebrow link-underline">
            ← Journal
          </Link>
          <h1 className="admin-title" style={{ marginTop: 10 }}>
            Nouvel article
          </h1>
          <p className="admin-sub" style={{ marginTop: 8 }}>
            Créé en brouillon : rien n&apos;apparaît dans le journal public tant que vous ne passez
            pas la visibilité en publié.
          </p>
        </div>
      </header>

      <JournalForm />
    </>
  );
}
