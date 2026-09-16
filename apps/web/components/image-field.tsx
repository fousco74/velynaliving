"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { imageSrc, uploadImage } from "@/lib/api";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  required?: boolean;
};

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

/**
 * Champ image du back-office : téléversement par bouton ou glisser-déposer,
 * avec le chemin resté modifiable à la main.
 *
 * Le champ texte n'est pas là par paresse : les visuels livrés avec le site
 * (`/assets/…`) ne se téléversent pas, et un administrateur doit pouvoir
 * réutiliser un fichier déjà déposé sans le renvoyer.
 */
export const ImageField = ({ id, label, value, onChange, hint, required }: Props) => {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const send = async (file: File | undefined) => {
    if (!file) return;

    setBusy(true);
    setError("");

    try {
      const { url } = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Téléversement impossible.");
    } finally {
      setBusy(false);
      // Réinitialisé pour que redéposer le même fichier redéclenche l'événement.
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void send(event.dataTransfer.files[0]);
        }}
        data-dragging={dragging}
        className="flex items-center gap-4 border border-dashed border-line-strong bg-surface-soft p-3 transition-colors data-[dragging=true]:border-rose data-[dragging=true]:bg-cream"
      >
        {value ? (
          <Image
            src={imageSrc(value)}
            alt=""
            width={72}
            height={72}
            className="size-18 shrink-0 bg-line-soft object-cover"
          />
        ) : (
          <span className="flex size-18 shrink-0 items-center justify-center bg-line-soft font-sans text-[9px] tracking-[0.2em] text-muted-2 uppercase">
            vide
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="btn"
              onClick={() => input.current?.click()}
              disabled={busy}
            >
              {busy ? "Envoi…" : value ? "Remplacer" : "Téléverser"}
            </button>

            {value && (
              <button type="button" className="btn" onClick={() => onChange("")} disabled={busy}>
                Retirer
              </button>
            )}
          </div>

          <p className="admin-hint mt-2 mb-0">
            Glissez un fichier ici, ou cliquez. JPEG, PNG, WebP ou AVIF, 5 Mo maximum.
          </p>
        </div>

        <input
          ref={input}
          id={id}
          type="file"
          accept={ACCEPT}
          hidden
          onChange={(event) => void send(event.target.files?.[0])}
        />
      </div>

      {error && <p className="field-error mt-2">{error}</p>}

      <input
        aria-label={`${label} — chemin`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="/assets/santal-atelier.jpeg"
        required={required}
        className="mt-2 font-mono text-[13px]"
      />

      {hint && <p className="admin-hint">{hint}</p>}
    </div>
  );
};
