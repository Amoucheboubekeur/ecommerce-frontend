"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UserForm from "@/components/UserForm";
import { useApi } from "@/hooks/useApi";
export default function AddUserPage() {
  const api = useApi();
  const router = useRouter();
  const [roles, setRoles] = useState<string[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    // Charger la liste des rôles depuis l’API
    const fetchRoles = async () => {
      try {
        const res = await api.get("/users/roles"); // ⚙️ Endpoint backend à adapter
        setRoles(res.data);
      } catch (error) {
        console.error("Erreur lors du chargement des rôles :", error);
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, []);

  const handleSubmit = async (data: any) => {
    setErrors([]);
    try {
        console.log("zzzzzzzzzzzzzzz");
        console.log(data);
      await api.post("/users", data); // POST côté backend
    
      alert("✅ Utilisateur créé avec succès !");
      router.push("/admin/users");
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.errors) {
        const backendErrors = Object.values(err.response.data.errors).flat();
        setErrors(backendErrors as string[]);
      } else if (typeof err.response?.data === "string") {
        setErrors([err.response.data]);
      } else {
        setErrors(["Une erreur inconnue est survenue."]);
      }
    }
  };

  if (loadingRoles) {
    return <p className="p-8 text-gray-500">Chargement des rôles...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">
          Ajouter un nouvel utilisateur
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
          roles={roles}
          onSubmit={handleSubmit}
          buttonLabel="Créer l’utilisateur"
        />
      </div>
    </div>
  );
}
