"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { usePaginatedList } from "@/hooks/usePaginatedList";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  city: string;
  wilaya: string;
}

export default function UsersListPage() {
  const router = useRouter();
  const api = useApi();

  // 🔁 Utilisation du hook
  const {
    data: users,
    loading,
    error,
    totalPages,
    currentPage,
    search,
    setSearch,
    fetchData,
    setCurrentPage,
  } = usePaginatedList<User>("/Users/GetPaged", { page: 1, pageSize: 8 });

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 🗑️ Suppression utilisateur
  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    try {
      setDeletingId(id);
      await api.delete(`/Users/${id}`);
      await fetchData(); // recharge la liste sans recharger la page
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
        <h1 className="text-2xl font-bold text-gray-800">👥 Utilisateurs</h1>
        <Link
          href="/admin/users/add"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          ➕ Nouvel utilisateur
        </Link>
      </div>

      {/* 🔍 BARRE DE RECHERCHE (identique à la version Catégories) */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Rechercher un utilisateur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* TABLE DES UTILISATEURS */}
      <UsersTable
        users={users}
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

/* ✅ TABLE SÉPARÉE — rendue stable, ne se recharge pas à chaque frappe */
function UsersTable({
  users,
  loading,
  error,
  deletingId,
  onDelete,
}: {
  users: User[];
  loading: boolean;
  error: string | null;
  deletingId: string | null;
  onDelete: (id: string) => void;
}) {
  if (loading)
    return <p className="text-center py-10 text-gray-500">Chargement des utilisateurs...</p>;

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
            <th className="p-3 text-left">Nom complet</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Téléphone</th>
            <th className="p-3 text-left">Ville</th>
            <th className="p-3 text-left">Wilaya</th>
            <th className="p-3 text-center w-40">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t hover:bg-gray-50">
              <td className="p-3 font-medium">{u.firstName} {u.lastName}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3">{u.phoneNumber}</td>
              <td className="p-3">{u.city}</td>
              <td className="p-3">{u.wilaya}</td>
              <td className="p-3 flex justify-center gap-2">
                <Link
                  href={`/admin/users/${u.id}/edit`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                >
                  ✏️ 
                </Link>
                <button
                  onClick={() => onDelete(u.id)}
                  disabled={deletingId === u.id}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  {deletingId === u.id ? "..." : "🗑️"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {users.length === 0 && (
        <p className="text-center text-gray-500 py-6">Aucun utilisateur trouvé.</p>
      )}
    </div>
  );
}
