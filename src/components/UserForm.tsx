"use client";

import { useState } from "react";

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  wilaya: string;
  postalCode: string;
  password: string;
  confirmPassword: string;
  role: string;
}

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  roles?: string[];
  onSubmit: (data: UserFormData) => void;
  buttonLabel: string;
}

const WILAYAS = [
  "Adrar",
  "Chlef",
  "Laghouat",
  "Oum El Bouaghi",
  "Batna",
  "Béjaïa",
  "Biskra",
  "Béchar",
  "Blida",
  "Bouira",
  "Tamanrasset",
  "Tébessa",
  "Tlemcen",
  "Tiaret",
  "Tizi Ouzou",
  "Alger",
  "Djelfa",
  "Jijel",
  "Sétif",
  "Saïda",
  "Skikda",
  "Sidi Bel Abbès",
  "Annaba",
  "Guelma",
  "Constantine",
  "Médéa",
  "Mostaganem",
  "M’Sila",
  "Mascara",
  "Ouargla",
  "Oran",
  "El Bayadh",
  "Illizi",
  "Bordj Bou Arréridj",
  "Boumerdès",
  "El Tarf",
  "Tindouf",
  "Tissemsilt",
  "El Oued",
  "Khenchela",
  "Souk Ahras",
  "Tipaza",
  "Mila",
  "Aïn Defla",
  "Naâma",
  "Aïn Témouchent",
  "Ghardaïa",
  "Relizane",
  "El M’Ghair",
  "El Menia",
  "Ouled Djellal",
  "Bordj Badji Mokhtar",
  "Béni Abbès",
  "Timimoun",
  "Touggourt",
  "Djanet",
  "In Salah",
  "In Guezzam",
];

export default function UserForm({
  initialData = {},
  roles = [],
  onSubmit,
  buttonLabel,
}: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    email: initialData.email || "",
    phoneNumber: initialData.phoneNumber || "",
    address: initialData.address || "",
    city: initialData.city || "",
    wilaya: initialData.wilaya || "",
    postalCode: initialData.postalCode || "",
    password: initialData.password || "",
    confirmPassword: initialData.confirmPassword || "",
    role: initialData.role || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("❌ Les mots de passe ne correspondent pas !");
      return;
    }

    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-6 rounded shadow"
    >
      {/* --- Nom et prénom --- */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Prénom</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Nom</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          />
        </div>
      </div>

      {/* --- Email --- */}
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full border rounded p-2"
        />
      </div>

      {/* --- Téléphone --- */}
      <div>
        <label className="block text-sm font-medium">Téléphone</label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />
      </div>

      {/* --- Adresse --- */}
      <div>
        <label className="block text-sm font-medium">Adresse</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />
      </div>

      {/* --- Ville + Wilaya --- */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Ville</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Wilaya</label>
          <select
            name="wilaya"
            value={formData.wilaya}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          >
            <option value="">-- Sélectionner une wilaya --</option>
            {WILAYAS.map((w, i) => (
              <option key={i + 1} value={w}>
                {`${i + 1}. ${w}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* --- Code postal --- */}
      <div>
        <label className="block text-sm font-medium">Code postal</label>
        <input
          type="text"
          name="postalCode"
          value={formData.postalCode}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />
      </div>

      {/* --- Mot de passe --- */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Mot de passe</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>
      </div>

      {/* --- Rôle --- */}
      <div>
        <label className="block text-sm font-medium">Rôle</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          className="w-full border rounded p-2"
        >
          <option value="">-- Sélectionner un rôle --</option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* --- Bouton d'envoi --- */}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
      >
        {buttonLabel}
      </button>
    </form>
  );
}
