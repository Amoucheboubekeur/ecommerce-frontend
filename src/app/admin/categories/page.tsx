"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { usePaginatedList } from "@/hooks/usePaginatedList";

interface Category {
  id: string;
  name: string;
  description?: string | null;
}

export default function CategoriesListPage() {
  const router = useRouter();
  const api = useApi(); // ✅ Appelé directement ici (niveau supérieur)

  // 🔁 Hook pagination
  const {
    data: categories,
    loading,
    error,
    totalPages,
    currentPage,
    search,
    setSearch,
    fetchData,
    setCurrentPage,
  } = usePaginatedList<Category>("/Categories/GetPaged", { page: 1, pageSize: 8 });

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette catégorie ?")) return;
    try {
      setDeletingId(id);
      await api.delete(`/Categories/${id}`);
      await fetchData(); // recharge uniquement la liste
    } catch {
      alert("Erreur lors de la suppression.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="p-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">📦 Catégories</h1>
        <Link
          href="/admin/categories/add"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          ➕ Nouvelle catégorie
        </Link>
      </div>

      {/* RECHERCHE */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Rechercher une catégorie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* LISTE DES CATÉGORIES */}
      <CategoryTable
        categories={categories}
        loading={loading}
        error={error}
        deletingId={deletingId}
        onDelete={handleDelete}
      />

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-3">
          <button
            onClick={() => {
              if (currentPage > 1) {
                setCurrentPage(currentPage - 1);
                fetchData(currentPage - 1);
              }
            }}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            ◀ Précédent
          </button>

          <span className="text-gray-700">
            Page <b>{currentPage}</b> / {totalPages}
          </span>

          <button
            onClick={() => {
              if (currentPage < totalPages) {
                setCurrentPage(currentPage + 1);
                fetchData(currentPage + 1);
              }
            }}
            disabled={currentPage >= totalPages}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Suivant ▶
          </button>
        </div>
      )}
    </main>
  );
}

/* ✅ SOUS-COMPONENT séparé — n’est pas rechargé à chaque frappe */
function CategoryTable({
  categories,
  loading,
  error,
  deletingId,
  onDelete,
}: {
  categories: Category[];
  loading: boolean;
  error: string | null;
  deletingId: string | null;
  onDelete: (id: string) => void;
}) {
  if (loading)
    return <p className="text-center py-10 text-gray-500">Chargement des catégories...</p>;

  if (error)
    return (
      <div className="text-center py-10 text-red-600">
        ❌ {error}
      </div>
    );

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full border-collapse">
        <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
          <tr>
            <th className="p-3 text-left">Nom</th>
            <th className="p-3 text-center w-40">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id} className="border-t hover:bg-gray-50">
              <td className="p-3 font-medium">{cat.name}</td>
              <td className="p-3 flex justify-center gap-2">
                <Link
                  href={`/admin/categories/${cat.id}/edit`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                >
                  ✏️ 
                </Link>
                <button
                  onClick={() => onDelete(cat.id)}
                  disabled={deletingId === cat.id}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  {deletingId === cat.id ? "..." : "🗑️"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {categories.length === 0 && (
        <p className="text-center text-gray-500 py-6">Aucune catégorie trouvée.</p>
      )}
    </div>
  );
}
