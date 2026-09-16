"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PRODUCT_STATUSES, PRODUCT_STATUS_LABELS, formatXOF } from "@velyna/shared";
import {
  ApiError,
  createProduct,
  getAdminHouses,
  updateProduct,
  type AdminHouse,
  type AdminProductFull,
  type ProductPayload,
} from "@/lib/api";

type FormState = {
  slug: string;
  name: string;
  ref: string;
  houseSlug: string;
  price: string;
  capacity: string;
  stock: string;
  img: string;
  status: "ONLINE" | "DRAFT";
  newRank: string;
  headNote: string;
  heartNote: string;
  backgroundNote: string;
  piece: string;
  ambiance: string;
  usage: string;
  description: string;
  imgDetail: string;
  detailBackground: string;
  inkColor: string;
};

const EMPTY: FormState = {
  slug: "",
  name: "",
  ref: "",
  houseSlug: "",
  price: "",
  capacity: "",
  stock: "0",
  img: "",
  status: "DRAFT",
  newRank: "",
  headNote: "",
  heartNote: "",
  backgroundNote: "",
  piece: "",
  ambiance: "",
  usage: "",
  description: "",
  imgDetail: "",
  detailBackground: "",
  inkColor: "",
};

/** La base stocke `null`, le formulaire manipule `""` : la conversion est ici. */
const fromProduct = (product: AdminProductFull): FormState => ({
  slug: product.slug,
  name: product.name,
  ref: product.ref,
  houseSlug: product.house.slug,
  price: String(product.price),
  capacity: product.capacity,
  stock: String(product.stock),
  img: product.img,
  status: product.status,
  newRank: product.newRank === null ? "" : String(product.newRank),
  headNote: product.headNote ?? "",
  heartNote: product.heartNote ?? "",
  backgroundNote: product.backgroundNote ?? "",
  piece: product.piece ?? "",
  ambiance: product.ambiance ?? "",
  usage: product.usage ?? "",
  description: product.description ?? "",
  imgDetail: product.imgDetail ?? "",
  detailBackground: product.detailBackground ?? "",
  inkColor: product.inkColor ?? "",
});

const toSlug = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toPayload = (form: FormState): ProductPayload => ({
  slug: form.slug.trim(),
  name: form.name.trim(),
  ref: form.ref.trim(),
  houseSlug: form.houseSlug,
  price: Number(form.price),
  capacity: form.capacity.trim(),
  stock: Number(form.stock),
  img: form.img.trim(),
  status: form.status,
  // Champ vide → null : le rang de nouveauté est optionnel.
  newRank: form.newRank.trim() === "" ? null : Number(form.newRank),
  headNote: form.headNote.trim(),
  heartNote: form.heartNote.trim(),
  backgroundNote: form.backgroundNote.trim(),
  piece: form.piece.trim(),
  ambiance: form.ambiance.trim(),
  usage: form.usage.trim(),
  description: form.description.trim(),
  imgDetail: form.imgDetail.trim(),
  detailBackground: form.detailBackground.trim(),
  inkColor: form.inkColor.trim(),
});

export const ProductForm = ({ product }: { product?: AdminProductFull }) => {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(product ? fromProduct(product) : EMPTY);
  const [houses, setHouses] = useState<AdminHouse[]>([]);
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [issues, setIssues] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    getAdminHouses()
      .then((list) => {
        setHouses(list);
        // Création : présélectionner la première maison évite un envoi vide.
        const first = list[0];
        setForm((current) =>
          current.houseSlug || !first ? current : { ...current, houseSlug: first.slug },
        );
      })
      .catch(() => setError("Impossible de charger les maisons."));
  }, []);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setIssues([]);
    setNotice("");

    try {
      const payload = toPayload(form);

      if (product) {
        const updated = await updateProduct(product.slug, payload);
        setNotice("Produit enregistré.");
        // Le slug fait partie de l'URL : s'il change, on suit.
        if (updated.slug !== product.slug) router.replace(`/admin/produits/${updated.slug}`);
        else router.refresh();
      } else {
        const created = await createProduct(payload);
        router.replace(`/admin/produits/${created.slug}`);
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

  const price = Number(form.price);

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
        <h2 className="admin-subtitle">Identité</h2>
        <div className="admin-grid">
          <div className="field">
            <label htmlFor="p-name">Nom</label>
            <input
              id="p-name"
              value={form.name}
              onChange={(event) => {
                set("name", event.target.value);
                if (!slugTouched) set("slug", toSlug(event.target.value));
              }}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="p-slug">Slug (URL publique)</label>
            <input
              id="p-slug"
              value={form.slug}
              onChange={(event) => {
                setSlugTouched(true);
                set("slug", event.target.value);
              }}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="p-ref">Référence</label>
            <input
              id="p-ref"
              value={form.ref}
              onChange={(event) => set("ref", event.target.value)}
              placeholder="MV-SA-250"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="p-house">Maison</label>
            <select
              id="p-house"
              value={form.houseSlug}
              onChange={(event) => set("houseSlug", event.target.value)}
              required
            >
              {houses.map((house) => (
                <option key={house.slug} value={house.slug}>
                  {house.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="p-price">Prix (F CFA, entier)</label>
            <input
              id="p-price"
              type="number"
              min={1}
              step={1}
              value={form.price}
              onChange={(event) => set("price", event.target.value)}
              required
            />
            {price > 0 && <p className="admin-hint">Affiché : {formatXOF(price)}</p>}
          </div>

          <div className="field">
            <label htmlFor="p-capacity">Contenance</label>
            <input
              id="p-capacity"
              value={form.capacity}
              onChange={(event) => set("capacity", event.target.value)}
              placeholder="250 ml"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="p-stock">Stock</label>
            <input
              id="p-stock"
              type="number"
              min={0}
              step={1}
              value={form.stock}
              onChange={(event) => set("stock", event.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="p-status">Visibilité</label>
            <select
              id="p-status"
              value={form.status}
              onChange={(event) => set("status", event.target.value as "ONLINE" | "DRAFT")}
            >
              {PRODUCT_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {PRODUCT_STATUS_LABELS[value]}
                </option>
              ))}
            </select>
            <p className="admin-hint">Un brouillon n&apos;apparaît pas dans la boutique.</p>
          </div>

          <div className="field">
            <label htmlFor="p-rank">Rang de nouveauté</label>
            <input
              id="p-rank"
              type="number"
              min={1}
              step={1}
              value={form.newRank}
              onChange={(event) => set("newRank", event.target.value)}
              placeholder="vide = non classé"
            />
            <p className="admin-hint">1 = le plus récent. Détermine le tri « nouveauté ».</p>
          </div>
        </div>
      </section>

      <section className="admin-panel">
        <h2 className="admin-subtitle">Visuels</h2>
        <div className="admin-grid">
          <div className="field">
            <label htmlFor="p-img">Image principale</label>
            <input
              id="p-img"
              value={form.img}
              onChange={(event) => set("img", event.target.value)}
              placeholder="/assets/santal-atelier.jpeg"
              required
            />
            <p className="admin-hint">
              Fichier déposé dans <code className="admin-code">apps/web/public/assets/</code>
            </p>
          </div>

          <div className="field">
            <label htmlFor="p-imgd">Image de la fiche (optionnel)</label>
            <input
              id="p-imgd"
              value={form.imgDetail}
              onChange={(event) => set("imgDetail", event.target.value)}
              placeholder="/assets/velynakai-produit.jpeg"
            />
          </div>

          <div className="field">
            <label htmlFor="p-bg">Fond de la fiche (optionnel)</label>
            <input
              id="p-bg"
              value={form.detailBackground}
              onChange={(event) => set("detailBackground", event.target.value)}
              placeholder="#EFE9E1"
            />
          </div>

          <div className="field">
            <label htmlFor="p-ink">Couleur du texte (optionnel)</label>
            <input
              id="p-ink"
              value={form.inkColor}
              onChange={(event) => set("inkColor", event.target.value)}
              placeholder="#1B1A18"
            />
          </div>
        </div>

        {form.img.startsWith("/assets/") && (
          <div className="admin-preview">
            <Image src={form.img} alt="" width={120} height={120} style={{ objectFit: "cover" }} />
            <span className="admin-sub">Aperçu de l&apos;image principale</span>
          </div>
        )}
      </section>

      <section className="admin-panel">
        <h2 className="admin-subtitle">Notes olfactives</h2>
        <div className="admin-grid">
          <div className="field">
            <label htmlFor="p-head">Note de tête</label>
            <input
              id="p-head"
              value={form.headNote}
              onChange={(event) => set("headNote", event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="p-heart">Note de cœur</label>
            <input
              id="p-heart"
              value={form.heartNote}
              onChange={(event) => set("heartNote", event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="p-base">Note de fond</label>
            <input
              id="p-base"
              value={form.backgroundNote}
              onChange={(event) => set("backgroundNote", event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="p-piece">Pièce</label>
            <input
              id="p-piece"
              value={form.piece}
              onChange={(event) => set("piece", event.target.value)}
              placeholder="Toute la maison"
            />
          </div>
          <div className="field">
            <label htmlFor="p-amb">Ambiance</label>
            <input
              id="p-amb"
              value={form.ambiance}
              onChange={(event) => set("ambiance", event.target.value)}
              placeholder="L'atelier d'un artiste au petit matin"
            />
          </div>
        </div>
      </section>

      <section className="admin-panel">
        <h2 className="admin-subtitle">Textes</h2>
        <div className="field" style={{ marginBottom: 24 }}>
          <label htmlFor="p-desc">Description</label>
          <textarea
            id="p-desc"
            rows={5}
            value={form.description}
            onChange={(event) => set("description", event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="p-usage">Conseil d&apos;usage</label>
          <textarea
            id="p-usage"
            rows={4}
            value={form.usage}
            onChange={(event) => set("usage", event.target.value)}
          />
        </div>
      </section>

      <div className="admin-form-actions">
        <button type="submit" className="btn btn-solid" disabled={busy}>
          {busy ? "Enregistrement…" : product ? "Enregistrer" : "Créer le produit"}
        </button>
        <Link href="/admin/produits" className="btn">
          Retour à la liste
        </Link>
      </div>
    </form>
  );
};
