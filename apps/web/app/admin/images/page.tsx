"use client";

import { useCallback, useEffect, useState } from "react";
import { ImageField } from "@/components/image-field";
import {
  getAdminSiteImages,
  resetSiteImage,
  updateSiteImage,
  type AdminSiteImage,
} from "@/lib/api";

/**
 * Remplacement des visuels livrés avec le site.
 *
 * On édite un EMPLACEMENT, pas un fichier : chaque carte connaît le chemin
 * d'origine et sait y revenir. L'enregistrement reste explicite — un chemin se
 * tape à la main autant qu'il se téléverse, et personne ne veut publier une
 * image sur l'accueil au troisième caractère saisi.
 */
const SlotCard = ({ slot, onSaved }: { slot: AdminSiteImage; onSaved: () => void }) => {
  const [path, setPath] = useState(slot.path);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // La valeur affichée suit la fiche rechargée, sans effet : on compare à un
  // état témoin pendant le rendu (même patron que site-header).
  const [shown, setShown] = useState(slot.path);
  if (slot.path !== shown) {
    setShown(slot.path);
    setPath(slot.path);
  }

  const dirty = path !== slot.path;

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError("");
    setDone(false);

    try {
      await action();
      setDone(true);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border border-line bg-surface p-5">
      <ImageField
        id={`site-image-${slot.key}`}
        label={slot.label}
        value={path}
        onChange={(value) => {
          setPath(value);
          setDone(false);
        }}
        hint={slot.hint}
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn btn-solid"
          disabled={busy || !dirty || !path}
          onClick={() => void run(() => updateSiteImage(slot.key, path))}
        >
          {busy ? "…" : "Enregistrer"}
        </button>

        {slot.custom && (
          <button
            type="button"
            className="btn"
            disabled={busy}
            onClick={() => void run(() => resetSiteImage(slot.key))}
          >
            Image d&apos;origine
          </button>
        )}

        <span className="admin-sub">
          {dirty
            ? "Modifié — pas encore enregistré"
            : slot.custom
              ? "Image remplacée"
              : "Image livrée avec le site"}
        </span>
      </div>

      {!slot.custom && !dirty && <p className="admin-hint mb-0">Origine : {slot.defaultPath}</p>}
      {done && !dirty && <p className="admin-hint mb-0">Enregistré.</p>}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
};

export default function AdminImagesPage() {
  const [slots, setSlots] = useState<AdminSiteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setSlots(await getAdminSiteImages());
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, []);

  /* Même exception assumée que les autres chargeurs du back-office : la règle
     `set-state-in-effect` ne distingue pas les setState posés après un await. */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const groups = [...new Set(slots.map((slot) => slot.group))];

  return (
    <>
      <header className="admin-head">
        <div>
          <p className="eyebrow">Apparence</p>
          <h1 className="admin-title">Images du site</h1>
        </div>
      </header>

      <p className="admin-notice">
        Ces visuels sont ceux qui ne dépendent d&apos;aucun produit ni article : ouverture de
        l&apos;accueil, blocs des deux marques, vignettes du menu, pages des marques. Le changement
        est visible dès le rechargement de la page publique.
      </p>

      {error && <p className="field-error">{error}</p>}

      {loading ? (
        <p className="eyebrow">Chargement…</p>
      ) : (
        groups.map((group) => (
          <section key={group} className="admin-section">
            <div className="admin-section-head">
              <h2 className="admin-subtitle">{group}</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {slots
                .filter((slot) => slot.group === group)
                .map((slot) => (
                  <SlotCard key={slot.key} slot={slot} onSaved={load} />
                ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}
