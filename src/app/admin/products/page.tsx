"use client";

import { usePaginatedList } from "@/hooks/usePaginatedList";
import Link from "next/link";
import { useState } from "react";
import { useApi } from "@/hooks/useApi";

interface Product {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
}

export default function ProductsListPage() {
  const api = useApi();
  
  const {
    data: products,
    loading,
    error,
    totalPages,
    currentPage,
    fetchData,
    search,
    setSearch,
    setCurrentPage,
  } = usePaginatedList<Product>("/products/GetPaged", { page: 1, pageSize: 10 });

  const [deleteLoading, setDeleteLoading] = useState(false);

 const handleDelete = async (id: string) => {
  if (!confirm("Voulez-vous vraiment supprimer ce produit ?")) return;

  try {
    setDeleteLoading(true);

    // ✅ Appel correct pour suppression
    const res = await api.delete(`/Products/${id}`);

    if (res.status === 200 || res.status === 204) {
      alert("Produit supprimé avec succès ✅");
      fetchData(); // Recharge la liste
    } else {
      throw new Error("Erreur lors de la suppression");
    }
  } catch (err) {
    console.error(err);
    alert("Erreur lors de la suppression du produit ❌");
  } finally {
    setDeleteLoading(false);
  }
};


  return (
    <main className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <h1 className="text-2xl font-bold">📦 Produits</h1>
        <Link
          href="/admin/products/add"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          ➕ Ajouter
        </Link>
      </div>

      {/* Barre de recherche */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Rechercher un produit..."
          className="w-full sm:w-1/2 border px-3 py-2 rounded focus:ring focus:ring-blue-300 outline-none"
        />
      </div>

      {/* Loading / Error */}
      {loading && <p className="text-gray-600">Chargement...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Table des produits */}
      {!loading && products.length > 0 ? (
        
        <table className="w-full border rounded shadow-sm text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Image</th>
              <th className="p-2">Titre</th>
              <th className="p-2">Prix</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className="border-t hover:bg-gray-50 transition-colors"
              >
                <td className="p-2">
                  {p.imageUrl ? (
                    <img
                      src={"https://ecommercebackend-h973.onrender.com" + p.imageUrl}
                      alt={p.title}
                      className="h-12 w-12 object-cover rounded"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-200 rounded"></div>
                  )}
                </td>
                <td className="p-2">{p.title}</td>
                <td className="p-2">{p.price} DA</td>
                <td className="p-2 flex justify-center gap-2">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    ✏️ 
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deleteLoading}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    🗑️ 
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && <p className="text-gray-500">Aucun produit trouvé.</p>
      )}

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
