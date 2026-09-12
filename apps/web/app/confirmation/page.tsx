"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import type { Order } from "@/lib/api";
import { OrderDetail } from "@/components/order-detail";

function ConfirmationContent() {
  const params = useSearchParams();
  const number = params.get("number");
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("velyna.lastOrder");
    if (raw) setOrder(JSON.parse(raw) as Order);
  }, []);

  return (
    <>
      <section className="section-tight" style={{ paddingTop: "clamp(56px, 8vw, 120px)" }}>
        <p className="eyebrow" style={{ marginBottom: 24 }}>
          Commande enregistrée
        </p>
        <h1 className="display" style={{ maxWidth: "26ch", fontSize: "clamp(36px, 5vw, 80px)" }}>
          Merci, votre commande <span className="italic">est enregistrée.</span>
        </h1>
        <p className="lead" style={{ margin: "26px 0 0", maxWidth: "56ch" }}>
          {number && (
            <>
              Votre numéro de commande est <strong>{number}</strong>. Conservez-le : il permet de
              suivre votre commande.
            </>
          )}
        </p>
        <p className="lead" style={{ margin: "14px 0 0", maxWidth: "56ch" }}>
          Nos équipes vous contactent pour finaliser le règlement et convenir de la livraison. Aucun
          montant n&apos;a été débité.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 32 }}>
          <Link href="/suivi-commande" className="btn btn-solid">
            Suivre ma commande
          </Link>
          <Link href="/boutique" className="btn">
            Retour à la boutique
          </Link>
        </div>
      </section>

      {order && (
        <section style={{ padding: "0 var(--gutter) clamp(64px, 9vw, 130px)" }}>
          <OrderDetail order={order} />
        </section>
      )}
    </>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<section className="section" />}>
      <ConfirmationContent />
    </Suspense>
  );
}
