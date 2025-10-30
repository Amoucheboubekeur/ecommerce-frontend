"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import wilayasData from "@/data/wilayas_communes.json";
import Swal from "sweetalert2";
import jsPDF from "jspdf";

interface Wilaya {
  name: string;
  code: number;
  communes: string[];
}
interface ProductImage {
  id: string;
  url: string;
  isMain: boolean;
}
interface Variant {
  id?: string;
  name: string;
  additionalPrice: number;
  variantStock: number;
}
interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  gallery: ProductImage[];
  variants?: Variant[];
  discountPercentage?: number;
  discountStartDate?: string | null;
  discountEndDate?: string | null;
  deliveryPriceMaison?: number;
  deliveryPriceBureau?: number;
}

export default function QuickOrderPage() {
  const { id } = useParams();
  const api = useApi();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string | null>(null);

  const [quantity, setQuantity] = useState<number>(1);
  const [wilaya, setWilaya] = useState<string>("");
  const [commune, setCommune] = useState<string>("");
  const [communes, setCommunes] = useState<string[]>([]);
  const [method, setMethod] = useState<"maison" | "bureau">("maison");
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const cleanWilayasData = (): Wilaya[] =>
    wilayasData.map((w) => ({ ...w, communes: [...new Set(w.communes)] }));

  const wilayas: Wilaya[] = cleanWilayasData();

  const deliveryPrice = product
    ? method === "maison"
      ? product.deliveryPriceMaison ?? 0
      : product.deliveryPriceBureau ?? 0
    : 0;

  const isDiscountActive = (p: Product) => {
    if (!p.discountPercentage) return false;
    if (!p.discountStartDate || !p.discountEndDate) return false;
    const now = new Date();
    return now >= new Date(p.discountStartDate) && now <= new Date(p.discountEndDate);
  };

  const selectedVariant = product?.variants?.find((v) => v.id === selectedVariantId) ?? null;

  const basePrice = product ? product.price : 0;
  const variantAdditional = selectedVariant ? selectedVariant.additionalPrice : 0;
  const discountedPrice =
    product && isDiscountActive(product) && product.discountPercentage
      ? +(basePrice * (1 - product.discountPercentage / 100)).toFixed(2)
      : basePrice;
  const finalUnitPrice = +(discountedPrice + variantAdditional).toFixed(2);
  const total = +(finalUnitPrice * quantity + deliveryPrice).toFixed(2);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await api.get(`/Products/${id}`);
        const data: Product = res.data;
        setProduct(data);
        const main = data.gallery?.find((g) => g.isMain);
        setMainImage(main ? main.url : data.gallery?.[0]?.url ?? null);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariantId(data.variants[0].id ?? null);
        }
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!wilaya) {
      setCommunes([]);
      setCommune("");
      return;
    }
    const selectedWilayaData = wilayas.find((w) => w.name === wilaya);
    const list = selectedWilayaData ? selectedWilayaData.communes : [];
    setCommunes(list);
    if (!list.includes(commune)) setCommune("");
  }, [wilaya]);

  // 🧾 Génération + téléchargement + ouverture du reçu PDF
  const generateReceiptPDF = (order: any) => {
    const doc = new jsPDF();

    const logoUrl = "/images/logoshopbbk.png";
    doc.addImage(logoUrl, "PNG", 15, 10, 25, 25);
    doc.setFontSize(18);
    doc.text("Reçu de commande", 70, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleString()}`, 15, 45);

    doc.text("Détails du client :", 15, 60);
    doc.text(`Nom: ${order.lastName} ${order.firstName}`, 15, 68);
    doc.text(`Email: ${order.email}`, 15, 76);
    doc.text(`Téléphone: ${order.phone}`, 15, 84);
    doc.text(`Adresse: ${order.address}, ${order.commune}, ${order.wilaya}`, 15, 92);

    doc.text("Détails de la commande :", 15, 110);
    doc.text(`Produit: ${product?.title}`, 15, 118);
    if (selectedVariant) doc.text(`Variante: ${selectedVariant.name}`, 15, 126);
    doc.text(`Quantité: ${order.quantity}`, 15, 134);
    doc.text(`Prix unitaire: ${order.unitPrice} DA`, 15, 142);
    doc.text(`Livraison (${order.deliveryMethod}): ${order.deliveryPrice} DA`, 15, 150);
    doc.text(`Total: ${order.total} DA`, 15, 160);

    doc.line(15, 165, 195, 165);
    doc.text("Merci pour votre commande !", 70, 180);

    // ✅ Téléchargement + ouverture automatique
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `recu-${product?.title}-${Date.now()}.pdf`;
    link.click();

    // 🔹 Ouvre dans un nouvel onglet
    window.open(url, "_blank");
  };

  // 🔹 Soumission commande
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (!firstName || !lastName || !email || !address || !phone || !wilaya || !commune) {
      Swal.fire({
        icon: "warning",
        title: "Champs manquants",
        text: "Veuillez remplir tous les champs obligatoires.",
      });
      return;
    }

    const orderData = {
      productId: product.id,
      quantity,
      firstName,
      lastName,
      email,
      address,
      phone,
      wilaya,
      commune,
      deliveryMethod: method,
      deliveryPrice,
      variantId: selectedVariantId,
      unitPrice: finalUnitPrice,
      total,
    };

    try {
      await api.post("/Orders/guest-order", orderData);

      Swal.fire({
        icon: "success",
        title: "Commande réussie 🎉",
        text: "Votre commande a été enregistrée avec succès. Le reçu va s’ouvrir.",
        showConfirmButton: false,
        timer: 2500,
      });

      // ✅ Téléchargement et ouverture automatique du reçu
      generateReceiptPDF(orderData);

      // ✅ Redirection après 3 secondes
      setTimeout(() => router.push("/"), 3000);
    } catch {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Une erreur est survenue lors de la commande.",
      });
    }
  };

  if (loading) return <p className="p-6 text-center">Chargement...</p>;
  if (!product) return <p className="p-6 text-center text-red-600">Produit introuvable.</p>;

  return (
    <main className="p-4 sm:p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center sm:text-left">
        🛒 Commander : {product.title}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        {/* --- Images --- */}
        <div>
          {mainImage ? (
            <img
              src={`https://ecommercebackend-h973.onrender.com${mainImage}`}
              alt={product.title}
              className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-lg shadow"
            />
          ) : (
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              Aucune image
            </div>
          )}

          {product.gallery?.length > 0 && (
            <div className="flex gap-2 sm:gap-3 mt-3 overflow-x-auto">
              {product.gallery.map((img) => (
                <img
                  key={img.id}
                  src={`https://ecommercebackend-h973.onrender.com${img.url}`}
                  alt="mini"
                  onClick={() => setMainImage(img.url)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 object-cover rounded cursor-pointer border-2 ${
                    img.url === mainImage
                      ? "border-blue-600"
                      : "border-transparent hover:border-gray-400"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* --- Formulaire --- */}
        <form onSubmit={handleSubmit} className="space-y-4 text-sm sm:text-base">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">{product.title}</h2>
            <p className="text-gray-700 mb-2">{product.description}</p>
            {product.discountPercentage && isDiscountActive(product) ? (
              <div className="mb-2">
                <span className="text-sm line-through text-gray-500 mr-2">{product.price} DA</span>
                <span className="text-lg sm:text-xl font-bold text-green-700">
                  {discountedPrice} DA
                </span>
                <div className="text-xs sm:text-sm text-red-600">
                  -{product.discountPercentage}% promo
                </div>
              </div>
            ) : (
              <span className="text-lg sm:text-xl font-bold text-green-700">
                {product.price} DA
              </span>
            )}
          </div>

          {/* Variantes */}
          {product.variants?.length ? (
            <div>
              <label className="font-medium block mb-2">Variantes</label>
              <div className="space-y-2">
                {product.variants.map((v) => (
                  <label
                    key={v.id}
                    className="flex items-center justify-between border p-2 rounded cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="variant"
                        checked={selectedVariantId === v.id}
                        onChange={() => setSelectedVariantId(v.id ?? null)}
                      />
                      <span>{v.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {v.additionalPrice > 0 ? `+${v.additionalPrice} DA` : "Inclus"}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          {/* Quantité */}
          <div className="flex items-center gap-3">
            <label className="font-medium">Quantité</label>
            <input
              type="number"
              min={1}
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-20 border px-2 py-1 rounded text-center"
            />
          </div>

          {/* Livraison */}
          <div>
            <label className="font-medium block mb-2">Méthode de livraison</label>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="method"
                  checked={method === "maison"}
                  onChange={() => setMethod("maison")}
                />
                À la maison ({product.deliveryPriceMaison ?? 0} DA)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="method"
                  checked={method === "bureau"}
                  onChange={() => setMethod("bureau")}
                />
                Au bureau ({product.deliveryPriceBureau ?? 0} DA)
              </label>
            </div>
          </div>

          {/* Wilaya / Commune */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-medium block mb-1">Wilaya</label>
              <select
                value={wilaya}
                onChange={(e) => setWilaya(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="">-- Choisir la wilaya --</option>
                {wilayas.map((w) => (
                  <option key={w.code} value={w.name}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-medium block mb-1">Commune</label>
              <select
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                required
                disabled={!wilaya}
              >
                <option value="">-- Choisir --</option>
                {communes.map((c, i) => (
                  <option key={i} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Infos client */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Prénom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="border px-3 py-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Nom"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="border px-3 py-2 rounded"
              required
            />
          </div>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Adresse"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Téléphone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />

          {/* Résumé */}
          <div className="mt-3 p-3 sm:p-4 border rounded bg-gray-50 text-sm sm:text-base">
            <div className="flex justify-between">
              <span>Prix unitaire</span>
              <span>{finalUnitPrice} DA</span>
            </div>
            <div className="flex justify-between">
              <span>Livraison</span>
              <span>{deliveryPrice} DA</span>
            </div>
            <div className="flex justify-between font-bold mt-2">
              <span>Total</span>
              <span>{total} DA</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 sm:py-3 rounded-lg text-sm sm:text-base hover:bg-green-700 transition"
          >
            ✅ Commander
          </button>
        </form>
      </div>
    </main>
  );
}
