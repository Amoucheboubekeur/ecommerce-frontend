"use client";

import { useCart } from "@/context/CartContext";
import { useApi } from "@/hooks/useApi";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import wilayasData from "@/data/wilayas_communes.json";

export default function CartPage() {
  const api = useApi();
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, clearCart, updateVariant } = useCart();

  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [commune, setCommune] = useState("");
  const [communes, setCommunes] = useState<string[]>([]);
  const [method, setMethod] = useState<"maison" | "bureau">("maison");

  // ✅ Calcul du total (produits + variantes + livraison)
  const total = cart.reduce((acc, item) => {
    const variantExtra = item.additionalPrice ?? 0;
    return acc + (item.price + variantExtra) * item.quantity;
  }, 0);

  // ✅ Charger les communes selon la wilaya sélectionnée
  useEffect(() => {
    if (!wilaya) {
      setCommunes([]);
      setCommune("");
      return;
    }
    const selected = wilayasData.find((w) => w.name === wilaya);
    setCommunes(selected ? selected.communes : []);
    setCommune("");
  }, [wilaya]);

  // ✅ Validation de commande
  const handleCheckout = async () => {
    if (cart.length === 0) return alert("🛒 Votre panier est vide !");
    if (!address.trim() || !wilaya || !commune)
      return alert("📦 Veuillez remplir tous les champs de livraison !");

    setLoading(true);
    try {
      const payload = {
        shippingAddress: address,
        wilaya,
        commune,
        deliveryMethod: method,
        deliveryPrice: method === "maison" ? 400 : 200,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          variantId: item.variantId ?? null,
        })),
      };

      const response = await api.post("/Orders", payload);
      console.log("✅ Commande créée :", response.data);

      clearCart();
      alert("🎉 Commande passée avec succès !");
      router.push("/orders");
    } catch (err: any) {
      console.error("❌ Erreur lors du passage de la commande :", err);
      if (err.response?.status === 401) {
        alert("🔒 Session expirée, veuillez vous reconnecter.");
        router.push("/login");
      } else {
        alert("⚠️ Erreur lors du passage de la commande.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🛍️ Mon panier</h1>

      {cart.length === 0 ? (
        <p>Votre panier est vide.</p>
      ) : (
        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item.id + (item.variantId ?? "")}
              className="flex flex-col md:flex-row md:items-center justify-between border p-4 rounded shadow-sm bg-white gap-3"
            >
              {/* ✅ Infos produit */}
              <div className="flex items-center gap-4">
                <img
                  src={
                    item.imageUrl
                      ? `https://ecommercebackend-h973.onrender.com${item.imageUrl}`
                      : "/placeholder.png"
                  }
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h2 className="font-medium">{item.title}</h2>
                  <p className="text-blue-600">
                    {(item.price + (item.additionalPrice ?? 0)).toFixed(2)} DA
                  </p>

                  {/* ✅ Sélecteur de variante */}
                  {Array.isArray(item.variants) && item.variants.length > 0 && (
                    <div className="mt-2">
                      <label className="text-sm text-gray-600 mr-2">
                        Variante :
                      </label>
                      <select
                        value={item.variantId ?? ""}
                        onChange={(e) => {
                          const selected = item.variants?.find(
                            (v) => v.id === e.target.value
                          );
                          if (selected) {
                            updateVariant(
                              item.id,
                              selected.id,
                              selected.name,
                              selected.additionalPrice
                            );
                          } else {
                            updateVariant(item.id, "", "", 0);
                          }
                        }}
                        className="border p-1 rounded"
                      >
                        <option value="">Aucune</option>
                        {item.variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name} (+{v.additionalPrice} DA)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* ✅ Quantité et suppression */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="px-2 py-1 bg-gray-200 rounded"
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  +
                </button>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="ml-4 text-red-600 hover:underline"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}

          {/* ✅ Adresse */}
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">
              Adresse de livraison :
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex : 12 rue Didouche Mourad"
              className="border w-full p-2 rounded"
            />
          </div>

          {/* ✅ Wilaya */}
          <div>
            <label className="block text-sm font-medium mb-2">Wilaya :</label>
            <select
              value={wilaya}
              onChange={(e) => setWilaya(e.target.value)}
              className="border w-full p-2 rounded"
            >
              <option value="">-- Choisir une wilaya --</option>
              {wilayasData.map((w) => (
                <option key={w.code} value={w.name}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Commune */}
          <div>
            <label className="block text-sm font-medium mb-2">Commune :</label>
            <select
              value={commune}
              onChange={(e) => setCommune(e.target.value)}
              className="border w-full p-2 rounded"
              disabled={!wilaya}
            >
              <option value="">-- Choisir une commune --</option>
              {communes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Méthode de livraison */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Méthode de livraison :
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={method === "maison"}
                  onChange={() => setMethod("maison")}
                />
                À la maison (400 DA)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={method === "bureau"}
                  onChange={() => setMethod("bureau")}
                />
                Bureau de livraison (200 DA)
              </label>
            </div>
          </div>

          {/* ✅ Total + bouton */}
          <div className="mt-6 flex justify-between items-center">
            <p className="text-xl font-bold">
              Total : {(total + (method === "maison" ? 400 : 200)).toFixed(2)} DA
            </p>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              {loading ? "Validation..." : "Passer la commande"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
