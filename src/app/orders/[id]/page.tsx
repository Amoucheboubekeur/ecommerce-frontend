"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";

interface OrderItem {
  productTitle: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  total: number;
  status: "Pending" | "Confirmed" | "Canceled";
  createdAt: string;
  confirmedAt?: string;
  items: OrderItem[];
}

export default function QuickOrderDetailsPage() {
  const api = useApi();
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger la commande
  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data);
      } catch {
        setError("Impossible de charger la commande.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading)
    return <p className="p-6 text-gray-600">Chargement de la commande...</p>;

  if (error)
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Erreur</h1>
        <p className="text-red-600">{error}</p>
        <Link
          href="/orders"
          className="text-blue-600 underline mt-4 inline-block"
        >
          ← Retour à mes commandes
        </Link>
      </main>
    );

  if (!order)
    return (
      <p className="p-6 text-gray-600">
        Aucune commande trouvée pour l’identifiant {id}.
      </p>
    );

  const totalQuantity = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        🧾 Détails de la commande #{order.id}
      </h1>

      <div className="bg-white border rounded-lg shadow p-6">
        <p>
          <strong>Status :</strong>{" "}
          <span
            className={`px-2 py-1 rounded text-white ${
              order.status === "Confirmed"
                ? "bg-green-600"
                : order.status === "Pending"
                ? "bg-yellow-500"
                : "bg-red-600"
            }`}
          >
            {order.status}
          </span>
        </p>
        <p className="mt-2">
          <strong>Date :</strong>{" "}
          {new Date(order.createdAt).toLocaleString("fr-FR")}
        </p>
        {order.confirmedAt && (
          <p>
            <strong>Confirmée le :</strong>{" "}
            {new Date(order.confirmedAt).toLocaleString("fr-FR")}
          </p>
        )}
        <p className="mt-2">
          <strong>Total :</strong> {order.total.toFixed(2)} DZ
        </p>
        <p className="mt-2">
          <strong>Articles :</strong> {totalQuantity}
        </p>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-4">🛍️ Liste des produits</h2>

      <div className="border rounded-lg divide-y">
        {order.items.map((item, index) => (
          <div
            key={index}
            className="flex justify-between p-3 hover:bg-gray-50"
          >
            <span>
              {item.productTitle} × {item.quantity}
            </span>
            <span>{(item.price * item.quantity).toFixed(2)} DZ</span>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Link
          href="/orders"
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
        >
          ← Retour aux commandes
        </Link>
      </div>
    </main>
  );
}
