"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";

interface Variant {
  id: string;
  name: string;
  additionalPrice: number;
}

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
  gallery?: { url: string; isMain: boolean }[];
  categoryId?: string;
  discountPercentage?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  variants?: Variant[];
}

interface PagedResponse<T> {
  data: T[];
  totalPages: number;
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

export default function HomePage() {
  const api = useApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    api
      .get<Category[]>("/Categories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Erreur chargement catégories :", err));
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const query = new URLSearchParams({
          page: page.toString(),
          pageSize: "8",
          search: searchTerm,
          categoryId: selectedCategory,
        });

        const res = await api.get<PagedResponse<Product>>(
          `/Products/public?${query.toString()}`
        );

        const response = res.data;
        setProducts(response?.data ?? []);
        setTotalPages(response?.totalPages ?? 1);
      } catch (err) {
        console.error(err);
        setError("Erreur de chargement des produits.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, searchTerm, selectedCategory]);

  const handleQuickOrder = (productId: string) => {
    router.push(`/quick-order/${productId}`);
  };

  const getMainImage = (p: Product) => {
    if (p.imageUrl) return `https://ecommercebackend-h973.onrender.com${p.imageUrl}`;
    const main = p.gallery?.find((g) => g.isMain);
    return main ? `https://ecommercebackend-h973.onrender.com${main.url}` : "/placeholder.png";
  };

  const getDiscountedPrice = (p: Product): number | null => {
    if (!p.discountPercentage || p.discountPercentage <= 0) return null;
    const now = new Date();
    const start = p.discountStartDate ? new Date(p.discountStartDate) : null;
    const end = p.discountEndDate ? new Date(p.discountEndDate) : null;

    if (start && now < start) return null;
    if (end && now > end) return null;

    const discounted = p.price - (p.price * p.discountPercentage) / 100;
    return discounted;
  };

  return (
    <main className="p-4 sm:p-6 space-y-8 max-w-7xl mx-auto">
      {/* 🔍 Recherche et filtre */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
        <input
          type="text"
          placeholder="🔍 Rechercher un produit..."
          value={searchTerm}
          onChange={(e) => {
            setPage(1);
            setSearchTerm(e.target.value);
          }}
          className="border rounded-lg px-4 py-2 w-full sm:w-1/2 focus:ring focus:ring-blue-200 outline-none text-sm sm:text-base"
        />

        <select
          value={selectedCategory}
          onChange={(e) => {
            setPage(1);
            setSelectedCategory(e.target.value);
          }}
          className="border rounded-lg px-4 py-2 w-full sm:w-1/3 text-sm sm:text-base"
        >
          <option value="">🏷️ Toutes les catégories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </section>

      {/* 🛍️ Liste produits */}
      <section>
        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          🛍️ Tous les produits
        </h2>

        {loading ? (
          <p>Chargement...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
              {products.map((p) => {
                const discountedPrice = getDiscountedPrice(p);
                return (
                  <div
                    key={p.id}
                    className="border rounded-xl p-4 flex flex-col items-center shadow-sm hover:shadow-md transition bg-white"
                  >
                    <img
                      src={getMainImage(p)}
                      alt={p.title}
                      className="w-32 h-32 sm:w-40 sm:h-40 object-cover mb-3 rounded-lg"
                    />
                    <h3 className="font-medium text-center text-sm sm:text-base mb-2">
                      {p.title}
                    </h3>

                    {discountedPrice ? (
                      <div className="text-center mb-2">
                        <p className="text-gray-400 line-through text-sm">
                          {p.price} DZD
                        </p>
                        <p className="text-green-600 font-semibold text-sm sm:text-base">
                          {discountedPrice} DZD
                        </p>
                        <span className="text-xs text-red-500">
                          -{p.discountPercentage}%
                        </span>
                      </div>
                    ) : (
                      <p className="text-gray-700 mb-2 text-sm sm:text-base">
                        {p.price} DZD
                      </p>
                    )}

                    {/* 🧩 Variantes */}
                    {p.variants && p.variants.length > 0 && (
                      <div className="mt-2 text-xs sm:text-sm text-gray-600 w-full">
                        <p className="font-semibold mb-1 text-center">
                          Variantes :
                        </p>
                        <ul className="space-y-0.5 text-center">
                          {p.variants.map((v) => (
                            <li key={v.id}>
                              • {v.name} (+{v.additionalPrice} DZD)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 🛒 Boutons */}
                    <div className="flex flex-col sm:flex-row gap-2 mt-3 w-full">
                      <Link
                        href={`/product/${p.id}`}
                        className="bg-gray-600 text-white text-sm sm:text-base text-center px-3 py-1.5 rounded-lg hover:bg-gray-700 w-full sm:w-auto"
                      >
                        Détails
                      </Link>

                      {user ? (
                        <button
                          onClick={() =>
                            addToCart({
                              id: p.id,
                              title: p.title,
                              price: discountedPrice ?? p.price,
                              quantity: 1,
                              imageUrl: getMainImage(p),
                            })
                          }
                          className="bg-green-600 text-white text-sm sm:text-base px-3 py-1.5 rounded-lg hover:bg-green-700 w-full sm:w-auto"
                        >
                          Ajouter
                        </button>
                      ) : (
                        <button
                          onClick={() => handleQuickOrder(p.id)}
                          className="bg-orange-600 text-white text-sm sm:text-base px-3 py-1.5 rounded-lg hover:bg-orange-700 w-full sm:w-auto"
                        >
                          Commander
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 📄 Pagination responsive */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-8">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-sm disabled:opacity-50"
              >
                ⬅️ Précédent
              </button>

              <span className="text-gray-700 text-sm">
                Page {page} sur {totalPages}
              </span>

              <button
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={page === totalPages}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-sm disabled:opacity-50"
              >
                Suivant ➡️
              </button>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500 mt-6">
            Aucun produit trouvé.
          </p>
        )}
      </section>
    </main>
  );
}
