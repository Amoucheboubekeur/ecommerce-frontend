"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useApi } from "@/hooks/useApi";

interface Product {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
}

export default function ProductsPage() {
          const api = useApi();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  const { addToCart } = useCart();

  useEffect(() => {
    api
      .get("/Products")
      .then((res) => {
        setProducts(res.data);
        setFiltered(res.data);
      })
      .catch(() => setError("Impossible de charger les produits"))
      .finally(() => setLoading(false));
  }, []);

  // 🔎 Filtrage en fonction de la recherche & du prix
  useEffect(() => {
    let result = products;

    if (search) {
      result = result.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (maxPrice) {
      result = result.filter((p) => p.price <= maxPrice);
    }

    setFiltered(result);
  }, [search, maxPrice, products]);

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Tous les produits</h1>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-lg w-full md:w-1/3"
        />

        <div className="flex items-center gap-2">
          <label htmlFor="price" className="text-sm text-gray-600">
            Prix max :
          </label>
          <input
            type="number"
            id="price"
            value={maxPrice ?? ""}
            onChange={(e) =>
              setMaxPrice(e.target.value ? parseInt(e.target.value) : null)
            }
            className="border px-3 py-2 rounded w-32"
          />
        </div>
      </div>

      {loading && <p>Chargement des produits...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Grille produits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="border rounded-lg p-4 shadow hover:shadow-lg transition"
          >
            <img
              src={"https://ecommercebackend-h973.onrender.com/"+p.imageUrl || "/placeholder.png"}
              alt={p.title}
              className="w-full h-40 object-cover mb-3 rounded"
            />
            <h3 className="font-medium line-clamp-2">{p.title}</h3>
            <p className="text-blue-600 font-bold">{p.price} €</p>

            <button
              onClick={() =>
                addToCart({
                  id: p.id,
                  title: p.title,
                  price: p.price,
                  quantity: 1,
                  imageUrl: p.imageUrl,
                })
              }
              className="mt-3 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Ajouter au panier
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
