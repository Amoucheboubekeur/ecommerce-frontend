"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";

interface Category {
  id: string;
  name: string;
}

interface Variant {
  name: string;
  additionalPrice: string;
  VariantStock: string;
}

export default function CreateProductPage() {
  const api = useApi();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    stock: "0",
    categoryId: "",
    discountPercentage: "",
    discountStartDate: "",
    discountEndDate: "",
    deliveryPriceMaison: "400",
    deliveryPriceBureau: "200",
  });

  const [variants, setVariants] = useState<Variant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger les catégories
  useEffect(() => {
    
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await api.get("/Categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Erreur chargement catégories:", err);
      alert("Impossible de charger les catégories.");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setMainImage(e.target.files[0]);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setGallery(Array.from(e.target.files));
    }
  };

  // ➕ Ajouter une variante
  const addVariant = () => {
    setVariants([...variants, { name: "", additionalPrice: "", VariantStock: "0" }]);
  };

  const handleVariantChange = (index: number, field: string, value: string) => {
    const updated = [...variants];
    (updated[index] as any)[field] = value;
    setVariants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryId) {
      alert("Veuillez sélectionner une catégorie !");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("Title", form.title);
      formData.append("Description", form.description);
      formData.append("Price", form.price);
      formData.append("Stock", form.stock);
      formData.append("CategoryId", form.categoryId);
      formData.append("DiscountPercentage", form.discountPercentage);
      formData.append("DiscountStartDate", form.discountStartDate);
      formData.append("DiscountEndDate", form.discountEndDate);
      formData.append("DeliveryPriceMaison", form.deliveryPriceMaison);
      formData.append("DeliveryPriceBureau", form.deliveryPriceBureau);

      if (mainImage) formData.append("Image", mainImage);
      gallery.forEach((img) => formData.append("Images", img));

      // ⚙️ Variantes
      variants.forEach((variant, i) => {
        formData.append(`Variants[${i}].Name`, variant.name);
        formData.append(`Variants[${i}].AdditionalPrice`, variant.additionalPrice);
        formData.append(`Variants[${i}].VariantStock`, variant.VariantStock);
      });
  const readableForm = Object.fromEntries(formData.entries());
    console.log("📦 Données envoyées à l’API :", readableForm);
      await api.post("/Products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Produit ajouté avec succès !");
      router.push("/admin/products");
    } catch (err) {
      console.error("Erreur ajout produit:", err);
      alert("Impossible d'ajouter le produit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">➕ Ajouter un produit</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">

        {/* Titre */}
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Titre"
          required
          className="w-full border px-3 py-2 rounded"
        />

        {/* Description */}
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full border px-3 py-2 rounded"
        />

        {/* Prix */}
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Prix"
          required
          className="w-full border px-3 py-2 rounded"
        />

        {/* Stock */}
        <input
          type="number"
          name="stock"
          value={form.stock}
          onChange={handleChange}
          placeholder="Stock"
          className="w-full border px-3 py-2 rounded"
        />

        {/* Catégorie */}
        <div>
          <label className="block font-medium mb-1">Catégorie</label>
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">-- Choisir une catégorie --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* 🏷️ Remise */}
        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            name="discountPercentage"
            value={form.discountPercentage}
            onChange={handleChange}
            placeholder="% Remise"
            className="border px-3 py-2 rounded"
          />
          <input
            type="date"
            name="discountStartDate"
            value={form.discountStartDate}
            onChange={handleChange}
            className="border px-3 py-2 rounded"
          />
          <input
            type="date"
            name="discountEndDate"
            value={form.discountEndDate}
            onChange={handleChange}
            className="border px-3 py-2 rounded"
          />
        </div>

        {/* 🚚 Prix de livraison */}
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            name="deliveryPriceMaison"
            value={form.deliveryPriceMaison}
            onChange={handleChange}
            placeholder="Livraison maison"
            className="border px-3 py-2 rounded"
          />
          <input
            type="number"
            name="deliveryPriceBureau"
            value={form.deliveryPriceBureau}
            onChange={handleChange}
            placeholder="Livraison bureau"
            className="border px-3 py-2 rounded"
          />
        </div>

        {/* 🧩 Variantes */}
        <div className="bg-gray-50 p-3 rounded">
          <h3 className="font-semibold mb-2">Variantes</h3>
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 mb-2">
              <input
                type="text"
                placeholder="Nom (ex: Couleur Rouge)"
                value={v.name}
                onChange={(e) => handleVariantChange(i, "name", e.target.value)}
                className="border px-2 py-1 rounded"
              />
              <input
                type="number"
                placeholder="Prix +"
                value={v.additionalPrice}
                onChange={(e) => handleVariantChange(i, "additionalPrice", e.target.value)}
                className="border px-2 py-1 rounded"
              />
              <input
                type="number"
                placeholder="Stock"
                value={v.VariantStock}
                onChange={(e) => handleVariantChange(i, "VariantStock", e.target.value)}
                className="border px-2 py-1 rounded"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addVariant}
            className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
          >
            + Ajouter une variante
          </button>
        </div>

        {/* Images */}
        <div>
          <label className="block font-medium mb-1">Image principale</label>
          <input type="file" accept="image/*" onChange={handleMainImageChange} />
        </div>

        <div>
          <label className="block font-medium mb-1">Galerie d’images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryChange}
          />
        </div>

        {/* Bouton */}
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded w-full"
        >
          {loading ? "Envoi..." : "Ajouter le produit"}
        </button>
      </form>
    </main>
  );
}
