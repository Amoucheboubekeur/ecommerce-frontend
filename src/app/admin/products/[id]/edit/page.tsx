"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";

interface ProductImage {
  id: string;
  url: string;
  isMain: boolean;
}

interface Variant {
  id?: string;
  name: string;
  additionalPrice: string;
  variantStock: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  deliveryPriceMaison?: number;
  deliveryPriceBureau?: number;
  discountPercentage?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  gallery: ProductImage[];
  variants: Variant[];
}

interface Category {
  id: string;
  name: string;
}

export default function EditProductPage() {
  const api = useApi();
  const router = useRouter();
  const { id } = useParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    stock: "0",
    categoryId: "",
    deliveryPriceMaison: "",
    deliveryPriceBureau: "",
    discountPercentage: "",
    discountStartDate: "",
    discountEndDate: "",
  });

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);

  // ✅ Fonction utilitaire pour formater correctement la date
  const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    
    console.log("Formatage de la date:", dateString);
    
    try {
      // Si c'est null ou undefined
      if (dateString === null || dateString === undefined) return "";
      
      // Si c'est une string vide
      if (dateString === "") return "";
      
      // Si la date contient 'T', on prend la partie avant le T
      if (typeof dateString === 'string' && dateString.includes('T')) {
        const result = dateString.split('T')[0];
        console.log("Date après split T:", result);
        return result;
      }
      
      // Si c'est déjà au bon format YYYY-MM-DD
      if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      // Format .NET (ex: /Date(1699056000000)/)
      if (dateString.startsWith("/Date(")) {
        const timestamp = parseInt(dateString.replace(/\D/g, ""), 10);
        return new Date(timestamp).toISOString().split("T")[0];
      }

      // Pour tout autre format, on essaie de créer une Date
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn("Date invalide:", dateString);
        return "";
      }
      
      const result = date.toISOString().split('T')[0];
      console.log("Date après new Date:", result);
      return result;
      
    } catch (err) {
      console.error("Erreur conversion date:", err, "dateString:", dateString);
      return "";
    }
  };

  // 🔹 Charger produit + catégories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get("/categories"),
        ]);

        const prod = prodRes.data;
        console.log("Produit reçu de l'API:", prod);
      
        setProduct(prod);
        setVariants(prod.variants || []);
        
        // Utilisation directe du split pour être sûr
        const startDate = prod.discountStartDate ? 
          (typeof prod.discountStartDate === 'string' && prod.discountStartDate.includes('T') 
            ? prod.discountStartDate.split('T')[0] 
            : formatDateForInput(prod.discountStartDate)) 
          : "";

        const endDate = prod.discountEndDate ? 
          (typeof prod.discountEndDate === 'string' && prod.discountEndDate.includes('T') 
            ? prod.discountEndDate.split('T')[0] 
            : formatDateForInput(prod.discountEndDate)) 
          : "";

        console.log("Dates finales - start:", startDate, "end:", endDate);

        setForm({
          title: prod.title ?? "",
          description: prod.description ?? "",
          price: prod.price?.toString() ?? "",
          stock: prod.stock?.toString() ?? "0",
          categoryId: prod.categoryId ?? "",
          deliveryPriceMaison: prod.deliveryPriceMaison?.toString() ?? "",
          deliveryPriceBureau: prod.deliveryPriceBureau?.toString() ?? "",
          discountPercentage: prod.discountPercentage?.toString() ?? "",
          discountStartDate: startDate,
          discountEndDate: endDate,
        });
        setCategories(catRes.data);
      } catch (err) {
        console.error("Erreur chargement:", err);
        alert("Erreur lors du chargement du produit ou des catégories.");
      }
    };

    fetchData();
  }, [id]);

  // ➕ Ajouter une variante
  const addVariant = () => {
    setVariants([...variants, { name: "", additionalPrice: "", variantStock: "0" }]);
    console.log()
  };


// 🧩 Modifier une variante

    const handleVariantChange = (index: number, field: string, value: string) => {
    const updated = [...variants];
    (updated[index] as any)[field] = value;
    setVariants(updated);
    console.log(variants)
  };
  

  // ❌ Supprimer une variante
  const removeVariant = (index: number) => {
    if (confirm("Supprimer cette variante ?")) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  // 🔹 Gérer les champs classiques
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    console.log(`Changement champ ${name}:`, value);
    setForm({ ...form, [name]: value });
  };

  // 🖼️ Gestion des images
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setMainImage(e.target.files[0]);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setGallery(Array.from(e.target.files));
  };

  const handleDeleteGalleryImage = async (imgId: string) => {
    if (!confirm("Supprimer cette image ?")) return;
    try {
      await api.delete(`/products/${id}/images/${imgId}`);
      setProduct((prev) =>
        prev
          ? { ...prev, gallery: prev.gallery.filter((img) => img.id !== imgId) }
          : null
      );
    } catch {
      alert("Erreur suppression image");
    }
  };

  // 💸 Calcul du prix final avec réduction
  const finalPrice =
    form.discountPercentage && form.price
      ? (
          parseFloat(form.price) *
          (1 - parseFloat(form.discountPercentage) / 100)
        ).toFixed(2)
      : form.price;

  // 💾 Envoi du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("Title", form.title);
      formData.append("Description", form.description);
      formData.append("Price", form.price);
      formData.append("Stock", form.stock);
      formData.append("CategoryId", form.categoryId);
      formData.append("DeliveryPriceMaison", form.deliveryPriceMaison);
      formData.append("DeliveryPriceBureau", form.deliveryPriceBureau);
      formData.append("DiscountPercentage", form.discountPercentage);
      formData.append("DiscountStartDate", form.discountStartDate);
      formData.append("DiscountEndDate", form.discountEndDate);

      // 🔹 Images
      if (mainImage) formData.append("Image", mainImage);
      gallery.forEach((img) => formData.append("Images", img));

         // ⚙️ Variantes
      variants.forEach((variant, i) => {
        formData.append(`Variants[${i}].Name`, variant.name);
        formData.append(`Variants[${i}].AdditionalPrice`, variant.additionalPrice);
        formData.append(`Variants[${i}].VariantStock`, variant.variantStock);
      });

      // Debug: Afficher les données envoyées
      console.log("Données envoyées:", {
        title: form.title,
        description: form.description,
        price: form.price,
        stock: form.stock,
        categoryId: form.categoryId,
        deliveryPriceMaison: form.deliveryPriceMaison,
        deliveryPriceBureau: form.deliveryPriceBureau,
        discountPercentage: form.discountPercentage,
        discountStartDate: form.discountStartDate,
        discountEndDate: form.discountEndDate,
        variants: variants
      });

      await api.put(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Produit mis à jour avec succès !");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour du produit.");
    } finally {
      setLoading(false);
    }
  };

  if (!product)
    return <p className="p-6 text-gray-600">Chargement du produit...</p>;

  const mainImg = product.gallery.find((img) => img.isMain);
  const otherImgs = product.gallery.filter((img) => !img.isMain);

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">✏️ Modifier le produit</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-4 rounded shadow"
      >
        {/* --- Champs de base --- */}
        <div>
          <label className="block font-medium mb-1">Titre</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            placeholder="Titre du produit"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            placeholder="Description du produit"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium mb-1">Prix (DA)</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              placeholder="Prix"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Stock</label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              placeholder="Stock"
              min="0"
              required
            />
          </div>
        </div>

        {/* --- Catégorie --- */}
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

        {/* --- Prix de livraison --- */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium mb-1">Livraison maison (DA)</label>
            <input
              type="number"
              name="deliveryPriceMaison"
              value={form.deliveryPriceMaison}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              placeholder="Prix livraison maison"
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Livraison bureau (DA)</label>
            <input
              type="number"
              name="deliveryPriceBureau"
              value={form.deliveryPriceBureau}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              placeholder="Prix livraison bureau"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        {/* 🧩 Variantes */}
        <div className="bg-gray-50 p-3 rounded">
          <h3 className="font-semibold mb-2">Variantes</h3>
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-4 gap-2 mb-2">
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
                onChange={(e) =>
                  handleVariantChange(i, "additionalPrice", e.target.value)
                }
                className="border px-2 py-1 rounded"
                step="0.01"
              />
              <input
                type="number"
                placeholder="Stock"
                value={v.variantStock}
                onChange={(e) =>
                  handleVariantChange(i, "variantStock", e.target.value)
                }
                className="border px-2 py-1 rounded"
                min="0"
              />
              <button
                type="button"
                onClick={() => removeVariant(i)}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addVariant}
            className="bg-blue-500 text-white px-3 py-1 rounded mt-2 hover:bg-blue-600"
          >
            + Ajouter une variante
          </button>
        </div>

        {/* --- Réduction --- */}
        <div className="border-t pt-3">
          <h2 className="font-semibold mb-2">Réduction</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">% Réduction</label>
              <input
                type="number"
                name="discountPercentage"
                value={form.discountPercentage}
                onChange={handleChange}
                placeholder="% réduction"
                className="w-full border px-3 py-2 rounded"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Prix final</label>
              <input
                type="text"
                value={`${finalPrice} DA`}
                disabled
                className="w-full border px-3 py-2 rounded bg-gray-100 text-gray-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block font-medium mb-1">Début réduction</label>
              <input
                type="date"
                name="discountStartDate"
                value={form.discountStartDate}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
              <small className="text-gray-500">Valeur: {form.discountStartDate || "non définie"}</small>
            </div>
            <div>
              <label className="block font-medium mb-1">Fin réduction</label>
              <input
                type="date"
                name="discountEndDate"
                value={form.discountEndDate}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
              <small className="text-gray-500">Valeur: {form.discountEndDate || "non définie"}</small>
            </div>
          </div>
        </div>

        {/* --- Images --- */}
        <div>
          <label className="block font-medium mb-2">Image principale</label>
          {mainImg ? (
            <div className="relative mb-2">
              <img
                src={`https://ecommercebackend-h973.onrender.com${mainImg.url}`}
                alt="main"
                className="h-32 w-full object-cover rounded border"
              />
              <button
                type="button"
                onClick={() => handleDeleteGalleryImage(mainImg.id)}
                className="absolute top-1 right-1 bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
              >
                ✕
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-2">
              Aucune image principale
            </p>
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleMainImageChange} 
            className="w-full"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Galerie d'images</label>
          <div className="grid grid-cols-3 gap-3 mb-2">
            {otherImgs.map((img) => (
              <div key={img.id} className="relative">
                <img
                  src={`https://ecommercebackend-h973.onrender.com${img.url}`}
                  alt="gallery"
                  className="h-24 w-full object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteGalleryImage(img.id)}
                  className="absolute top-1 right-1 bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryChange}
            className="w-full"
          />
        </div>

        {/* --- Bouton --- */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded w-full hover:bg-blue-700 disabled:bg-blue-400"
        >
          {loading ? "Mise à jour..." : "Modifier le produit"}
        </button>
      </form>
    </main>
  );
}