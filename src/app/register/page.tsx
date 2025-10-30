"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const api = useApi();
  const router = useRouter();
  const { login } = useAuth(); // permet connexion auto après inscription
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
    "Skikda","Sidi Bel Abbès","Annaba","Guelma","Constantine","Médéa","Mostaganem","MSila","Mascara","Ouargla",
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

    setLoading(true);

    try {
      // 🔹 Envoi des données au backend
      const res = await api.post("/Auth/register/user", form);

      // ✅ Si l’API renvoie un token après création (sinon tu peux faire un login automatique ensuite)
      if (res.data?.token) {
        login(res.data.token);
        router.push("/");
      } else {
        // sinon redirige simplement vers la page de connexion
        alert("✅ Inscription réussie !");
        router.push("/login");
      }
    } catch (err: any) {
      if (err.response?.data?.message)
        setError(`❌ ${err.response.data.message}`);
      else
        setError("Erreur lors de l’inscription, veuillez réessayer.");
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
            className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
          <input
            name="lastName"
            placeholder="Nom"
            value={form.lastName}
            onChange={handleChange}
            className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
        </div>

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />

        <input
          name="phoneNumber"
          placeholder="Téléphone"
          value={form.phoneNumber}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />

        <input
          name="address"
          placeholder="Adresse"
          value={form.address}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />

        <input
          name="city"
          placeholder="Ville"
          value={form.city}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />

        <select
          name="wilaya"
          value={form.wilaya}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          required
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
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Mot de passe"
          value={form.password}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />

        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirmer le mot de passe"
          value={form.confirmPassword}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />

        {error && <p className="text-red-600 text-center mt-2 text-sm">{error}</p>}

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
