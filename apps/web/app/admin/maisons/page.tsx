"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createHouse, deleteHouse, getAdminHouses, updateHouse, type AdminHouse } from "@/lib/api";

/** « Maison Velyná » → « maison-velyna ». Les accents sautent, pas les mots. */
const toSlug = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const HouseRow = ({ house, onChanged }: { house: AdminHouse; onChanged: () => void }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(house.name);
  const [slug, setSlug] = useState(house.slug);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const cancel = () => {
    setName(house.name);
    setSlug(house.slug);
    setError("");
    setEditing(false);
  };

  const save = async () => {
    setBusy(true);
    setError("");

    try {
      await updateHouse(house.slug, { name, slug });
      setEditing(false);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setError("");

    try {
      await deleteHouse(house.slug);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible.");
      setBusy(false);
    }
  };

  if (editing) {
    return (
      <tr>
        <td>
          <input
            className="admin-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-label="Nom de la maison"
          />
        </td>
        <td>
          <input
            className="admin-input"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            aria-label="Slug de la maison"
          />
          {error && <p className="field-error">{error}</p>}
        </td>
        <td className="num">{house._count.products}</td>
        <td>
          <div className="admin-actions">
            <button type="button" className="btn" onClick={save} disabled={busy}>
              {busy ? "…" : "Enregistrer"}
            </button>
            <button type="button" className="btn" onClick={cancel} disabled={busy}>
              Annuler
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>{house.name}</td>
      <td>
        <code className="admin-code">{house.slug}</code>
        {error && <p className="field-error">{error}</p>}
      </td>
      <td className="num">
        <Link href={`/admin/produits?house=${house.slug}`} className="link-underline">
          {house._count.products}
        </Link>
      </td>
      <td>
        <div className="admin-actions">
          <button type="button" className="btn" onClick={() => setEditing(true)} disabled={busy}>
            Modifier
          </button>
          <button
            type="button"
            className="btn"
            data-danger="true"
            onClick={remove}
            disabled={busy || house._count.products > 0}
            title={
              house._count.products > 0
                ? "Impossible : cette maison porte des produits"
                : "Supprimer la maison"
            }
          >
            Supprimer
          </button>
        </div>
      </td>
    </tr>
  );
};

export default function AdminHousesPage() {
  const [houses, setHouses] = useState<AdminHouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setHouses(await getAdminHouses());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);
    setCreateError("");

    try {
      await createHouse({ name: name.trim(), slug: slug.trim() });
      setName("");
      setSlug("");
      setSlugTouched(false);
      await load();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Création impossible.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <header className="admin-head">
        <div>
          <p className="eyebrow">Catalogue</p>
          <h1 className="admin-title">
            {houses.length} maison{houses.length > 1 ? "s" : ""}
          </h1>
        </div>
      </header>

      <section className="admin-panel">
        <h2 className="admin-subtitle">Nouvelle maison</h2>
        <form onSubmit={create} className="admin-form-inline">
          <div className="field">
            <label htmlFor="h-name">Nom</label>
            <input
              id="h-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                // Tant que l'admin n'a pas touché au slug, il suit le nom.
                if (!slugTouched) setSlug(toSlug(event.target.value));
              }}
              placeholder="Maison Velyná"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="h-slug">Slug</label>
            <input
              id="h-slug"
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              placeholder="maison-velyna"
              required
            />
          </div>
          <button type="submit" className="btn btn-solid" disabled={creating}>
            {creating ? "Création…" : "Créer"}
          </button>
        </form>
        {createError && <p className="field-error">{createError}</p>}
      </section>

      {error && <p className="field-error">{error}</p>}

      {loading ? (
        <p className="eyebrow">Chargement…</p>
      ) : (
        <div className="admin-table-wrap" style={{ marginTop: 34 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Slug</th>
                <th className="num">Produits</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {houses.map((house) => (
                <HouseRow key={house.slug} house={house} onChanged={load} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
