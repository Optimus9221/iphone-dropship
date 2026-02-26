"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/context";

type Product = {
  id: string;
  name: string;
  slug: string;
  model: string;
  storage: string;
  color: string;
  price: number;
  stock: number;
  isPublished: boolean;
  description: string | null;
  images: string[];
};

const emptyForm = () => ({
  name: "",
  model: "16",
  storage: "128GB",
  color: "Black",
  price: 899,
  stock: 10,
  isPublished: true,
  description: "",
  images: [] as string[],
});

export default function AdminProductsPage() {
  const { t } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [newImageUrl, setNewImageUrl] = useState("");

  const load = () => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => [])
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const addImage = () => {
    const url = newImageUrl.trim();
    if (url) {
      setForm((f) => ({ ...f, images: [...f.images, url] }));
      setNewImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        description: form.description || null,
      }),
    });
    if (res.ok) {
      setShowAdd(false);
      setForm(emptyForm());
      load();
    }
  };

  const handleUpdate = async (e: React.FormEvent, product: Product) => {
    e.preventDefault();
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        description: form.description || null,
      }),
    });
    if (res.ok) {
      setEditing(null);
      setForm(emptyForm());
      load();
    }
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      model: p.model,
      storage: p.storage,
      color: p.color,
      price: p.price,
      stock: p.stock,
      isPublished: p.isPublished,
      description: p.description ?? "",
      images: [...(p.images || [])],
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) load();
  };

  const ProductForm = ({
    onSubmit,
    onCancel,
    submitLabel,
  }: {
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    submitLabel: string;
  }) => (
    <form onSubmit={onSubmit} className="mt-6 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm text-zinc-500">{t("adminProductName")}</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="iPhone 16 128GB Black"
            className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-500">Model</label>
          <select
            value={form.model}
            onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
            className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-800"
          >
            <option value="15">15</option>
            <option value="16">16</option>
            <option value="17">17</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-zinc-500">Storage</label>
          <select
            value={form.storage}
            onChange={(e) => setForm((f) => ({ ...f, storage: e.target.value }))}
            className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-800"
          >
            <option value="128GB">128GB</option>
            <option value="256GB">256GB</option>
            <option value="512GB">512GB</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-zinc-500">Color</label>
          <input
            type="text"
            value={form.color}
            onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
            className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-500">{t("adminProductPrice")}</label>
          <input
            type="number"
            required
            min="1"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
            className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-500">{t("adminProductStock")}</label>
          <input
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
            className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm text-zinc-500">{t("adminProductDescription")}</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={4}
          className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-800"
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm text-zinc-500">{t("adminProductImages")}</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {form.images.map((url, i) => (
            <div key={i} className="group relative">
              <img src={url} alt="" className="h-16 w-16 rounded object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect fill='%23ddd' width='64' height='64'/><text x='50%' y='50%' fill='%23999' text-anchor='middle' dy='.3em' font-size='10'>?</text></svg>"; }} />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            type="url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
            placeholder="https://..."
            className="flex-1 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-800"
          />
          <button type="button" onClick={addImage} className="rounded border px-3 py-1">
            {t("adminAddImage")}
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          type="checkbox"
          id="published"
          checked={form.isPublished}
          onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
        />
        <label htmlFor="published">{t("adminProductPublished")}</label>
      </div>

      <div className="mt-4 flex gap-2">
        <button type="submit" className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500">
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="rounded border px-4 py-2">
          {t("adminCancel")}
        </button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold">{t("adminProducts")}</h1>
        <div className="mt-8 h-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("adminProducts")}</h1>
        <button
          type="button"
          onClick={() => {
            setShowAdd(!showAdd);
            setEditing(null);
            setForm(emptyForm());
          }}
          className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          {t("adminAddProduct")}
        </button>
      </div>

      {showAdd && (
        <ProductForm
          onSubmit={handleAdd}
          onCancel={() => setShowAdd(false)}
          submitLabel={t("adminSave")}
        />
      )}

      {editing && (
        <ProductForm
          onSubmit={(e) => handleUpdate(e, editing)}
          onCancel={() => setEditing(null)}
          submitLabel={t("adminSave")}
        />
      )}

      {products.length === 0 ? (
        <p className="mt-8 text-zinc-500">{t("adminNoProducts")}</p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="px-4 py-3 text-left text-sm font-medium">{t("adminProductName")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium">{t("adminProductPrice")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium">{t("adminProductStock")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium">{t("adminProductPublished")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium">{t("adminActions")}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">${p.price}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={p.isPublished}
                      onChange={(e) => {
                        fetch(`/api/admin/products/${p.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ isPublished: e.target.checked }),
                        }).then(() => load());
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        openEdit(p);
                        setShowAdd(false);
                      }}
                      className="mr-2 text-emerald-600 hover:underline"
                    >
                      {t("adminEditProduct")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="text-red-600 hover:underline"
                    >
                      {t("adminDeleteProduct")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
