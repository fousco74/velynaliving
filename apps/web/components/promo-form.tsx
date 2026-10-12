"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  describePromo,
  normalizePromoCode,
  PROMO_TYPES,
  PROMO_TYPE_LABELS,
  type PromoType,
} from "@velyna/shared";
import { ApiError, createPromoCode, updatePromoCode, type AdminPromoCode } from "@/lib/api";

/** Les nombres restent des chaînes tant qu'on tape : un champ vide n'est pas 0. */
type FormState = {
  code: string;
  label: string;
  type: PromoType;
  value: string;
  startsAt: string;
  endsAt: string;
  minSubTotal: string;
  maxUses: string;
  oncePerCustomer: boolean;
  active: boolean;
};

const EMPTY: FormState = {
  code: "",
  label: "",
  type: "PERCENT",
  value: "",
  startsAt: "",
  endsAt: "",
  minSubTotal: "",
  maxUses: "",
  oncePerCustomer: false,
  active: true,
};

/** Les bornes sont stockées en UTC, l'heure d'Abidjan : tronquer l'ISO donne le bon jour. */
const toDateInput = (value: string | null) => (value ? value.slice(0, 10) : "");

const fromPromo = (promo: AdminPromoCode): FormState => ({
  code: promo.code,
  label: promo.label,
  type: promo.type,
  value: promo.type === "FREE_DELIVERY" ? "" : String(promo.value),
  startsAt: toDateInput(promo.startsAt),
  endsAt: toDateInput(promo.endsAt),
  minSubTotal: promo.minSubTotal === null ? "" : String(promo.minSubTotal),
  maxUses: promo.maxUses === null ? "" : String(promo.maxUses),
  oncePerCustomer: promo.oncePerCustomer,
  active: promo.active,
});

/** Vide → null : « pas de limite ». */
const optionalInt = (value: string) => (value.trim() === "" ? null : Number(value));

const toPayload = (form: FormState) => ({
  label: form.label.trim(),
  type: form.type,
  value: form.type === "FREE_DELIVERY" ? 0 : Number(form.value || 0),
  startsAt: form.startsAt || null,
  endsAt: form.endsAt || null,
  minSubTotal: optionalInt(form.minSubTotal),
  maxUses: optionalInt(form.maxUses),
  oncePerCustomer: form.oncePerCustomer,
  active: form.active,
});

const VALUE_LABELS: Record<PromoType, string> = {
  PERCENT: "Remise (%)",
  AMOUNT: "Remise (F CFA)",
  FREE_DELIVERY: "",
};

export const PromoForm = ({ promo }: { promo?: AdminPromoCode }) => {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(promo ? fromPromo(promo) : EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [issues, setIssues] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setIssues([]);
    setNotice("");

    try {
      if (promo) {
        await updatePromoCode(promo.id, toPayload(form));
        setNotice("Code enregistré.");
        router.refresh();
      } else {
        const created = await createPromoCode({ code: form.code, ...toPayload(form) });
        router.replace(`/admin/codes-promo/${created.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible.");
      if (err instanceof ApiError && err.issues) {
        setIssues(err.issues.map((issue) => `${issue.path.join(".")} — ${issue.message}`));
      }
    } finally {
      setBusy(false);
    }
  };

  const preview =
    form.type === "FREE_DELIVERY" || Number(form.value) > 0
      ? describePromo({ type: form.type, value: Number(form.value) })
      : null;

  return (
    <form onSubmit={submit}>
      {notice && <p className="admin-notice">{notice}</p>}
      {error && <p className="field-error">{error}</p>}
      {issues.length > 0 && (
        <ul className="admin-issues">
          {issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      )}

      <section className="admin-panel">
        <h2 className="admin-subtitle">Offre</h2>
        <div className="admin-grid">
          <div className="field">
            <label htmlFor="p-code">Code</label>
            <input
              id="p-code"
              value={form.code}
              onChange={(event) => set("code", normalizePromoCode(event.target.value))}
              placeholder="NOEL26"
              disabled={Boolean(promo)}
              required
              autoComplete="off"
            />
            <p className="admin-hint">
              {promo
                ? "Non modifiable : il a peut-être déjà été diffusé."
                : "Ce que les clients saisiront. Lettres, chiffres, - ou _."}
            </p>
          </div>

          <div className="field">
            <label htmlFor="p-label">Événement</label>
            <input
              id="p-label"
              value={form.label}
              onChange={(event) => set("label", event.target.value)}
              placeholder="Noël 2026"
              required
            />
            <p className="admin-hint">Affiché au client quand le code est accepté.</p>
          </div>

          <div className="field">
            <label htmlFor="p-type">Type de remise</label>
            <select
              id="p-type"
              value={form.type}
              onChange={(event) => set("type", event.target.value as PromoType)}
            >
              {PROMO_TYPES.map((value) => (
                <option key={value} value={value}>
                  {PROMO_TYPE_LABELS[value]}
                </option>
              ))}
            </select>
            {preview && <p className="admin-hint">Aperçu : {preview}</p>}
          </div>

          {form.type !== "FREE_DELIVERY" && (
            <div className="field">
              <label htmlFor="p-value">{VALUE_LABELS[form.type]}</label>
              <input
                id="p-value"
                type="number"
                min={1}
                max={form.type === "PERCENT" ? 100 : undefined}
                step={1}
                value={form.value}
                onChange={(event) => set("value", event.target.value)}
                required
              />
              <p className="admin-hint">
                {form.type === "PERCENT"
                  ? "Appliqué au sous-total des produits."
                  : "Déduit du sous-total, jamais au-delà."}
              </p>
            </div>
          )}

          <div className="field">
            <label htmlFor="p-active">État</label>
            <select
              id="p-active"
              value={form.active ? "1" : "0"}
              onChange={(event) => set("active", event.target.value === "1")}
            >
              <option value="1">Actif</option>
              <option value="0">Désactivé</option>
            </select>
            <p className="admin-hint">Désactivé, le code est refusé même pendant sa période.</p>
          </div>
        </div>
      </section>

      <section className="admin-panel">
        <h2 className="admin-subtitle">Période de validité</h2>
        <div className="admin-grid">
          <div className="field">
            <label htmlFor="p-start">Premier jour</label>
            <input
              id="p-start"
              type="date"
              value={form.startsAt}
              onChange={(event) => set("startsAt", event.target.value)}
            />
            <p className="admin-hint">Vide : valable immédiatement.</p>
          </div>

          <div className="field">
            <label htmlFor="p-end">Dernier jour (inclus)</label>
            <input
              id="p-end"
              type="date"
              value={form.endsAt}
              min={form.startsAt || undefined}
              onChange={(event) => set("endsAt", event.target.value)}
            />
            <p className="admin-hint">Vide : sans date de fin. Valable jusqu&apos;à 23 h 59.</p>
          </div>
        </div>
      </section>

      <section className="admin-panel">
        <h2 className="admin-subtitle">Conditions</h2>
        <div className="admin-grid">
          <div className="field">
            <label htmlFor="p-min">Montant minimum d&apos;achat (F CFA)</label>
            <input
              id="p-min"
              type="number"
              min={1}
              step={1}
              value={form.minSubTotal}
              onChange={(event) => set("minSubTotal", event.target.value)}
            />
            <p className="admin-hint">Vide : aucun minimum.</p>
          </div>

          <div className="field">
            <label htmlFor="p-max">Nombre d&apos;utilisations maximum</label>
            <input
              id="p-max"
              type="number"
              min={1}
              step={1}
              value={form.maxUses}
              onChange={(event) => set("maxUses", event.target.value)}
            />
            <p className="admin-hint">
              Vide : illimité.
              {promo && ` Déjà utilisé ${promo.usedCount} fois.`}
            </p>
          </div>

          <div className="field">
            <label htmlFor="p-once">Par client</label>
            <select
              id="p-once"
              value={form.oncePerCustomer ? "1" : "0"}
              onChange={(event) => set("oncePerCustomer", event.target.value === "1")}
            >
              <option value="0">Sans limite</option>
              <option value="1">Une seule fois</option>
            </select>
            <p className="admin-hint">Vérifié sur l&apos;adresse e-mail de la commande.</p>
          </div>
        </div>
      </section>

      <div className="admin-form-actions">
        <button type="submit" className="btn btn-solid" disabled={busy}>
          {busy ? "Enregistrement…" : promo ? "Enregistrer" : "Créer le code"}
        </button>
        <Link href="/admin/codes-promo" className="btn">
          Retour à la liste
        </Link>
      </div>
    </form>
  );
};
