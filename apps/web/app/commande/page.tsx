"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  COMMUNES_ABIDJAN,
  computeTotals,
  DELIVERY_OPTIONS,
  formatXOF,
  FREE_DELIVERY_THRESHOLD,
  OPERATOR_LABELS,
  OPERATORS,
  type DeliveryMethod,
  type Operator,
} from "@velyna/shared";
import { useCart } from "@/components/cart-provider";
import { imageSrc, createOrder } from "@/lib/api";

const STEPS = ["Coordonnées", "Livraison", "Règlement"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+225 \d{2} \d{2} \d{2} \d{2} \d{2}$/;

type Form = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  municipality: string;
  instruction: string;
};

const EMPTY: Form = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  municipality: "",
  instruction: "",
};

function CommandeContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { lines, ready, clear } = useCart();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [delivery, setDelivery] = useState<DeliveryMethod>("ABIDJAN");
  const [operator, setOperator] = useState<Operator>("WAVE");
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const promo = params.get("promo");
  const totals = computeTotals(
    lines.map((line) => ({ unitPrice: line.price, quantity: line.quantity })),
    delivery,
    promo,
  );

  const set =
    (key: keyof Form) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((current) => ({ ...current, [key]: event.target.value }));
      setErrors((current) => ({ ...current, [key]: undefined }));
    };

  const validateStep = () => {
    const next: Partial<Record<keyof Form, string>> = {};

    if (step === 0) {
      if (!form.firstName.trim()) next.firstName = "Prénom requis";
      if (!form.lastName.trim()) next.lastName = "Nom requis";
      if (!EMAIL_RE.test(form.email)) next.email = "Adresse e-mail invalide";
      if (!PHONE_RE.test(form.phone)) next.phone = "Format attendu : +225 07 00 00 00 00";
    }

    if (step === 1) {
      if (delivery !== "PICKUP" && !form.address.trim()) next.address = "Adresse requise";
      if (!form.municipality) next.municipality = "Choisissez une commune";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validateStep()) return;

    setSubmitting(true);
    setServerError("");

    try {
      const order = await createOrder({
        items: lines.map((line) => ({ slug: line.slug, quantity: line.quantity })),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim() || undefined,
        municipality: form.municipality,
        instruction: form.instruction.trim() || undefined,
        deliveryMethod: delivery,
        operator,
        promoCode: promo ?? undefined,
      });

      // On vide le panier seulement après la confirmation du serveur.
      clear();
      sessionStorage.setItem("velyna.lastOrder", JSON.stringify(order));
      router.push(`/confirmation?number=${order.number}`);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Une erreur est survenue.");
      setSubmitting(false);
    }
  };

  if (ready && lines.length === 0) {
    return (
      <section className="section">
        <h1 className="h2">Votre panier est vide.</h1>
        <p className="lead" style={{ margin: "18px 0 30px" }}>
          Ajoutez une création avant de passer commande.
        </p>
        <Link href="/boutique" className="btn">
          Découvrir la boutique
        </Link>
      </section>
    );
  }

  return (
    <>
      <section className="section-tight" style={{ paddingTop: "clamp(56px, 8vw, 120px)" }}>
        <p className="eyebrow" style={{ marginBottom: 24 }}>
          Commande
        </p>
        <h1 className="display" style={{ fontSize: "clamp(36px, 5vw, 76px)" }}>
          Finaliser <span className="italic">votre commande</span>
        </h1>
      </section>

      <section style={{ padding: "0 var(--gutter) clamp(64px, 9vw, 130px)" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "clamp(12px, 2vw, 32px)",
            marginBottom: "clamp(32px, 4vw, 60px)",
          }}
        >
          {STEPS.map((label, index) => (
            <div
              key={label}
              style={{
                borderTop: `1px solid ${index <= step ? "var(--ink)" : "var(--line)"}`,
                paddingTop: 14,
              }}
            >
              <p
                className="tag"
                style={{ color: index <= step ? "var(--ink)" : "var(--muted-3)", margin: 0 }}
              >
                0{index + 1} — {label}
              </p>
            </div>
          ))}
        </div>

        <div className="grid12" style={{ alignItems: "start" }}>
          <div style={{ gridColumn: "1 / span 7" }}>
            {step === 0 && (
              <>
                <h2 className="h3" style={{ marginBottom: 28 }}>
                  Vos coordonnées
                </h2>
                <div className="form-grid">
                  <Field
                    id="firstName"
                    label="Prénom"
                    placeholder="Aïcha"
                    value={form.firstName}
                    onChange={set("firstName")}
                    error={errors.firstName}
                  />
                  <Field
                    id="lastName"
                    label="Nom"
                    placeholder="Konaté"
                    value={form.lastName}
                    onChange={set("lastName")}
                    error={errors.lastName}
                  />
                  <Field
                    id="email"
                    label="E-mail"
                    type="email"
                    placeholder="prenom@exemple.com"
                    value={form.email}
                    onChange={set("email")}
                    error={errors.email}
                  />
                  <Field
                    id="phone"
                    label="Téléphone"
                    type="tel"
                    placeholder="+225 07 00 00 00 00"
                    value={form.phone}
                    onChange={set("phone")}
                    error={errors.phone}
                  />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="h3" style={{ marginBottom: 28 }}>
                  Livraison
                </h2>
                <div className="form-grid">
                  <div className="span2">
                    <Field
                      id="address"
                      label="Adresse"
                      placeholder="Rue des Jardins, Résidence Velyná, Villa 4"
                      value={form.address}
                      onChange={set("address")}
                      error={errors.address}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="municipality">Commune</label>
                    <select
                      id="municipality"
                      value={form.municipality}
                      onChange={set("municipality")}
                    >
                      <option value="">Choisir une commune</option>
                      {COMMUNES_ABIDJAN.map((commune) => (
                        <option key={commune} value={commune}>
                          {commune}
                        </option>
                      ))}
                    </select>
                    {errors.municipality && <p className="field-error">{errors.municipality}</p>}
                  </div>
                  <Field
                    id="instruction"
                    label="Instructions"
                    placeholder="Portail vert, appeler en arrivant"
                    value={form.instruction}
                    onChange={set("instruction")}
                  />
                </div>

                <p className="eyebrow" style={{ margin: "36px 0 16px", letterSpacing: "0.26em" }}>
                  Mode de livraison
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {(Object.keys(DELIVERY_OPTIONS) as DeliveryMethod[]).map((key) => {
                    const option = DELIVERY_OPTIONS[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        className="choice"
                        data-selected={delivery === key}
                        onClick={() => setDelivery(key)}
                      >
                        <span className="choice-name">{option.label}</span>
                        <span className="choice-detail">
                          {option.detail} — {option.cost === 0 ? "Gratuit" : formatXOF(option.cost)}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="eyebrow" style={{ marginTop: 16, letterSpacing: "0.18em" }}>
                  Livraison offerte dès {formatXOF(FREE_DELIVERY_THRESHOLD)}
                </p>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="h3" style={{ marginBottom: 28 }}>
                  Règlement
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 12,
                  }}
                >
                  {OPERATORS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      className="choice"
                      data-selected={operator === key}
                      onClick={() => setOperator(key)}
                    >
                      <span className="choice-name">{OPERATOR_LABELS[key]}</span>
                    </button>
                  ))}
                </div>
                <p className="lead" style={{ margin: "24px 0 0", maxWidth: "56ch" }}>
                  Aucun montant n&apos;est débité en ligne. Nous vous contactons après validation
                  pour finaliser le règlement par le moyen choisi.
                </p>
                {serverError && (
                  <p className="field-error" style={{ fontSize: 17 }}>
                    {serverError}
                  </p>
                )}
              </>
            )}

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                marginTop: 36,
                paddingTop: 24,
                borderTop: "1px solid var(--line)",
              }}
            >
              {step > 0 && (
                <button
                  type="button"
                  className="btn btn-soft"
                  onClick={() => setStep((s) => s - 1)}
                >
                  Étape précédente
                </button>
              )}
              {step < 2 ? (
                <button
                  type="button"
                  className="btn btn-solid"
                  onClick={() => validateStep() && setStep((s) => s + 1)}
                >
                  {step === 0 ? "Continuer vers la livraison" : "Continuer vers le règlement"}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-solid"
                  onClick={submit}
                  disabled={submitting}
                >
                  {submitting ? "Enregistrement…" : `Valider — ${formatXOF(totals.total)}`}
                </button>
              )}
            </div>
          </div>

          <aside
            style={{ gridColumn: "9 / span 4", borderTop: "1px solid var(--line)", paddingTop: 24 }}
          >
            <p className="eyebrow" style={{ marginBottom: 20, letterSpacing: "0.26em" }}>
              Votre commande
            </p>

            {lines.map((line) => (
              <div
                key={line.slug}
                style={{
                  display: "grid",
                  gridTemplateColumns: "56px 1fr auto",
                  gap: 14,
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid var(--line-soft)",
                }}
              >
                <Image
                  src={imageSrc(line.img)}
                  alt={line.name}
                  width={120}
                  height={160}
                  style={{
                    width: "100%",
                    height: "auto",
                    aspectRatio: "3 / 4",
                    objectFit: "cover",
                  }}
                />
                <div>
                  <p style={{ margin: 0, fontFamily: "var(--serif)", fontSize: 18 }}>{line.name}</p>
                  <p
                    className="eyebrow"
                    style={{ marginTop: 6, fontSize: 9, letterSpacing: "0.2em" }}
                  >
                    {line.capacity} × {line.quantity}
                  </p>
                </div>
                <span style={{ fontFamily: "var(--sans)", fontSize: 11, whiteSpace: "nowrap" }}>
                  {formatXOF(line.price * line.quantity)}
                </span>
              </div>
            ))}

            <div className="summary-row" style={{ paddingTop: 14 }}>
              <span>Sous-total</span>
              <span>{formatXOF(totals.subTotal)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="summary-row">
                <span>Code {promo}</span>
                <span>−{formatXOF(totals.discount)}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Livraison</span>
              <span>{totals.deliveryCost === 0 ? "Offerte" : formatXOF(totals.deliveryCost)}</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>{formatXOF(totals.total)}</span>
            </div>
            <p className="eyebrow" style={{ marginTop: 8, letterSpacing: "0.18em" }}>
              Règlement — {OPERATOR_LABELS[operator]}
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}

const Field = ({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
  placeholder?: string;
}) => (
  <div className="field">
    <label htmlFor={id}>{label}</label>
    <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} />
    {error && <p className="field-error">{error}</p>}
  </div>
);

export default function CommandePage() {
  return (
    <Suspense fallback={<section className="section" />}>
      <CommandeContent />
    </Suspense>
  );
}
