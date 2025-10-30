"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";

export default function AddCategoryPage() {
  const router = useRouter();
  const api = useApi();
  const [form, setForm] = useState({ name: ""});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("Le nom est requis");

    setLoading(true);
    try {
      await api.post("/Categories", {
        name: form.name.trim()|| null,
      });
      alert("Catégorie créée ✅");
      router.push("/admin/categories");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">➕ Ajouter une catégorie</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
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
          <button type="submit" disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded">
            {loading ? "Envoi..." : "Créer"}
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
