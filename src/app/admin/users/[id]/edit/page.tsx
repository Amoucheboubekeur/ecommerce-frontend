"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import UserForm from "@/components/UserForm";
import { useApi } from "@/hooks/useApi";
export default function EditUserPage() {
  const api = useApi();
  const router = useRouter();
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les infos utilisateur + rôles
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, rolesRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/users/roles`),
        ]);
        setUser(userRes.data);
        setRoles(rolesRes.data);
      } catch (err) {
        console.error("Erreur lors du chargement :", err);
        alert("Impossible de charger les données.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleSubmit = async (data: any) => {
    setErrors([]);
    try {
      await api.put(`/users/${id}`, data);
      alert("✅ Utilisateur mis à jour avec succès !");
      router.push("/admin/users");
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.errors) {
        // Si le backend renvoie une liste d’erreurs Identity
        const backendErrors = Object.values(err.response.data.errors).flat();
        setErrors(backendErrors as string[]);
      } else if (typeof err.response?.data === "string") {
        setErrors([err.response.data]);
      } else {
        setErrors(["Une erreur inconnue est survenue."]);
      }
    }
  };

  if (loading) return <p className="p-8 text-gray-600">Chargement...</p>;
  if (!user) return <p className="p-8 text-red-500">Utilisateur introuvable.</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">
          Modifier l’utilisateur
        </h1>

        {/* ⚠️ Affichage des erreurs */}
        {errors.length > 0 && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 border border-red-300">
            <ul className="list-disc ml-5">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <UserForm
          initialData={user}
          roles={roles}
          onSubmit={handleSubmit}
          buttonLabel="Mettre à jour"
        />
      </div>
    </div>
  );
}
