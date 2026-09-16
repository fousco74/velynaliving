"use client";

import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  formatXOF,
  type OrderStatus,
} from "@velyna/shared";
import type { PaymentStatusValue } from "@/lib/api";

/** Couleur par statut : le rouge est réservé aux sorties du parcours nominal. */
const ORDER_TONES: Record<OrderStatus, string> = {
  NEW: "info",
  PREPARING: "info",
  SHIPPED: "info",
  DELIVERED: "ok",
  CANCELLED: "bad",
  REFUNDED: "bad",
};

const PAYMENT_TONES: Record<PaymentStatusValue, string> = {
  PENDING: "wait",
  CONFIRMED: "ok",
  FAILED: "bad",
};

export const StatusPill = ({ status }: { status: OrderStatus }) => (
  <span className="pill" data-tone={ORDER_TONES[status]}>
    {ORDER_STATUS_LABELS[status]}
  </span>
);

export const PaymentPill = ({ status }: { status: PaymentStatusValue }) => (
  <span className="pill" data-tone={PAYMENT_TONES[status]}>
    {PAYMENT_STATUS_LABELS[status]}
  </span>
);

export const Money = ({ amount }: { amount: number }) => (
  <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatXOF(amount)}</span>
);

const dateTimeFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * suppressHydrationWarning : le serveur rend en UTC, le navigateur dans le
 * fuseau du lecteur. Sans cela, chaque date déclenche un avertissement
 * d'hydratation — et noierait les vrais.
 */
export const DateText = ({ value }: { value: string }) => (
  <span suppressHydrationWarning>{dateTimeFmt.format(new Date(value))}</span>
);
