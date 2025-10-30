"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/useApi";

interface ProductImage {
  id: string;
  url: string;
  isMain: boolean;
}

interface ProductVariant {
  id: string;
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
  variants?: ProductVariant[];
  discountPercentage?: number;
  discountStartDate?: string;
  discountEndDate?: string;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const api = useApi();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  // ✅ Charger le produit complet
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await api.get(`/Products/${id}`);
        const data = res.data;
        setProduct(data);

        const main = data.gallery?.find((img: ProductImage) => img.isMain);
        setMainImage(main ? main.url : data.gallery?.[0]?.url || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) return <p className="p-6">Chargement...</p>;
  if (!product) return <p className="p-6 text-red-600">Produit introuvable.</p>;

  // ✅ Calcul du prix remisé
  const getDiscountedPrice = (): number | null => {
    if (!product.discountPercentage || product.discountPercentage <= 0) return null;
    const now = new Date();
    const start = product.discountStartDate ? new Date(product.discountStartDate) : null;
    const end = product.discountEndDate ? new Date(product.discountEndDate) : null;
    if (start && now < start) return null;
    if (end && now > end) return null;
    const discounted = product.price - (product.price * product.discountPercentage) / 100;
    return Math.round(discounted);
  };

  // ✅ Prix final après réduction + variant
  const discountedPrice = getDiscountedPrice();
  const basePrice = discountedPrice ?? product.price;
  const finalPrice = basePrice + (selectedVariant?.additionalPrice ?? 0);

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row gap-10">
        {/* 🖼️ Galerie d'images */}
        <div className="flex-1">
          {mainImage && (
            <img
              src={`https://ecommercebackend-h973.onrender.com${mainImage}`}
              alt={product.title}
              className="w-full h-96 object-cover rounded-lg shadow"
            />
          )}

          {/* Miniatures */}
          {product.gallery && product.gallery.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto">
              {product.gallery.map((img) => (
                <img
                  key={img.id}
                  src={`https://ecommercebackend-h973.onrender.com${img.url}`}
                  alt="miniature"
                  onClick={() => setMainImage(img.url)}
                  className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${
                    img.url === mainImage
                      ? "border-blue-600"
                      : "border-transparent hover:border-gray-400"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* 📋 Détails produit */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-3">{product.title}</h1>
            <p className="text-gray-700 mb-3">{product.description}</p>

            {/* 💰 Prix avec remise */}
            {discountedPrice ? (
              <div className="mb-3">
                <p className="text-gray-400 line-through">{product.price} DZD</p>
                <p className="text-green-700 text-2xl font-semibold">
                  {discountedPrice} DZD{" "}
                  <span className="text-red-500 text-base ml-2">
                    (-{product.discountPercentage}%)
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-green-700 text-2xl font-semibold mb-3">
                {product.price} DZD
              </p>
            )}

            {/* 🔸 Variants sous forme de liste */}
            {product.variants && product.variants.length > 0 && (
              <div className="mt-4">
                <label className="font-medium mb-2 block">Variantes :</label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() =>
                        setSelectedVariant(
                          selectedVariant?.id === v.id ? null : v
                        )
                      }
                      className={`px-4 py-2 rounded border text-sm transition ${
                        selectedVariant?.id === v.id
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {v.name}{" "}
                      {v.additionalPrice > 0 &&
                        `(+${v.additionalPrice} DZD)`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 🧮 Affichage du prix total (avec variant) */}
            {selectedVariant && (
              <p className="mt-3 text-lg font-semibold text-blue-700">
                Prix total : {finalPrice} DZD
              </p>
            )}

            <p className="text-gray-500 mt-3">
              Stock : {product.stock > 0 ? product.stock : "Rupture de stock"}
            </p>
          </div>

          {/* 🛒 Boutons d’action */}
          <div className="flex gap-4 mt-6">
            {user ? (
              <button
                onClick={() =>
                  addToCart({
                    id: product.id,
                    title:
                      product.title +
                      (selectedVariant ? ` (${selectedVariant.name})` : ""),
                    price: finalPrice,
                    quantity: 1,
                    imageUrl: mainImage || "",
                  })
                }
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Ajouter au panier
              </button>
            ) : (
              <button
                onClick={() => router.push(`/quick-order/${product.id}`)}
                className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700"
              >
                Commander rapidement
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
