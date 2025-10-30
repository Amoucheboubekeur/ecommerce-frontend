"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";

export default function EditCategoryPage() {
    const api = useApi();

  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({ name: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategory();
  }, []);

  const loadCategory = async () => {
    try {
      const res = await api.get(`/Categories/${id}`);
      setForm({
        name: res.data.name ?? "",
      });
    } catch {
      alert("Erreur chargement catégorie");
      router.push("/admin/categories");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/Categories/${id}`, {
        name: form.name.trim() || null,
      });
      alert("Catégorie mise à jour ✅");
      router.push("/admin/categories");
    } catch {
      alert("Erreur mise à jour catégorie");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6">Chargement...</p>;

  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">✏️ Modifier la catégorie</h1>
      <form onSubmit={handleSave} className="space-y-4 bg-white p-4 rounded shadow">
        <div>
          <label className="block mb-1">Nom</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
     
        <div className="flex gap-2">
          <button disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded">
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/categories")}
            className="border px-4 py-2 rounded"
          >
            Annuler
          </button>
        </div>
      </form>
    </main>
  );
}
