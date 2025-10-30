"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const api = useApi();
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    wilaya: "",
    postalCode: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Liste complète des 58 wilayas d'Algérie
  const wilayas = [
    "Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Béjaïa","Biskra","Béchar","Blida","Bouira",
    "Tamanrasset","Tébessa","Tlemcen","Tiaret","Tizi Ouzou","Alger","Djelfa","Jijel","Sétif","Saïda",
    "Skikda","Sidi Bel Abbès","Annaba","Guelma","Constantine","Médéa","Mostaganem","M'Sila","Mascara","Ouargla",
    "Oran","El Bayadh","Illizi","Bordj Bou Arreridj","Boumerdès","El Tarf","Tindouf","Tissemsilt","El Oued","Khenchela",
    "Souk Ahras","Tipaza","Mila","Aïn Defla","Naâma","Aïn Témouchent","Ghardaïa","Relizane","El M'Ghair","El Menia",
    "Ouled Djellal","Bordj Badji Mokhtar","Béni Abbès","Timimoun","Touggourt","Djanet","In Salah","In Guezzam"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("⚠️ Les mots de passe ne correspondent pas");
      return;
    }

    // Vérification basique du code postal (doit être à 5 chiffres)
    if (!/^\d{5}$/.test(form.postalCode)) {
      setError("⚠️ Le code postal doit contenir exactement 5 chiffres");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        email: form.email.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        wilaya: form.wilaya.trim(),
        role: "User",
      };

      const res = await api.post("/Auth/register/user", payload);

      if (res.data?.token) {
        // Connexion automatique si un token est renvoyé
        login(res.data.token);
        router.push("/");
      } else {
        alert("✅ Inscription réussie !");
        router.push("/login");
      }
    } catch (err: any) {
      console.error(err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        "Erreur lors de l’inscription. Veuillez réessayer.";
      setError(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-2xl shadow-lg w-[500px] space-y-3"
      >
        <h2 className="text-2xl font-semibold text-center mb-4">
          🧾 Créer un compte
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <input
            name="firstName"
            placeholder="Prénom"
            value={form.firstName}
            onChange={handleChange}
            required
            className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            name="lastName"
            placeholder="Nom"
            value={form.lastName}
            onChange={handleChange}
            required
            className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        <input
          name="phoneNumber"
          placeholder="Téléphone"
          value={form.phoneNumber}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        <input
          name="address"
          placeholder="Adresse"
          value={form.address}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        <input
          name="city"
          placeholder="Ville"
          value={form.city}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        <select
          name="wilaya"
          value={form.wilaya}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <option value="">Sélectionnez votre wilaya</option>
          {wilayas.map((w) => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>

        <input
          name="postalCode"
          placeholder="Code postal"
          value={form.postalCode}
          onChange={handleChange}
          required
          pattern="\d{5}"
          maxLength={5}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        <input
          name="password"
          type="password"
          placeholder="Mot de passe"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirmer le mot de passe"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          minLength={6}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        {error && (
          <p className="text-red-600 text-center mt-2 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded mt-4 hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Création du compte..." : "S’inscrire"}
        </button>
      </form>
    </main>
  );
}
