"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";

interface OrderItem {
  productTitle: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string; // ✅ Guid
  total: number;
  status: "Pending" | "Confirmed" | "Canceled";
  createdAt: string;
  items: OrderItem[];
}

export default function OrdersPage() {
 const api = useApi();  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    api
      .get("/Orders") // ✅ endpoint correct
      .then((res) => setOrders(res.data))
      .catch(() => setError("Impossible de récupérer vos commandes."))
      .finally(() => setLoading(false));
  }, []);

  const sortByDate = () => {
    const sorted = [...orders].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortAsc ? dateA - dateB : dateB - dateA;
    });
    setOrders(sorted);
    setSortAsc(!sortAsc);
  };

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  if (loading) return <p className="p-6">Chargement...</p>;

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Mes commandes</h1>
        <p className="mt-4 text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">📋 Mes commandes</h1>

      <div className="overflow-x-auto relative">
        <table className="w-full border border-gray-300 rounded-lg shadow-sm">
          <thead className="bg-gray-100 text-left relative">
            <tr>
              <th className="p-3 border-b">ID</th>
              <th
                className="p-3 border-b cursor-pointer select-none hover:bg-gray-200"
                onClick={sortByDate}
              >
                Date {sortAsc ? "↑" : "↓"}
              </th>

              {/* Status avec filtre */}
              <th className="p-3 border-b relative">
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <button
                    onClick={() => setShowFilterMenu((prev) => !prev)}
                    className="ml-1 text-gray-600 hover:text-black"
                  >
                    ⏷
                  </button>
                </div>

                {showFilterMenu && (
                  <div className="absolute bg-white border rounded shadow-md mt-1 z-10 p-2">
                    {["all", "Pending", "Confirmed", "Canceled"].map((status) => (
                      <div
                        key={status}
                        className={`cursor-pointer px-3 py-1 hover:bg-gray-100 rounded ${
                          statusFilter === status ? "bg-gray-200 font-semibold" : ""
                        }`}
                        onClick={() => {
                          setStatusFilter(status);
                          setShowFilterMenu(false);
                        }}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </div>
                    ))}
                  </div>
                )}
              </th>

              <th className="p-3 border-b">Articles</th>
              <th className="p-3 border-b">Quantité totale</th>
              <th className="p-3 border-b">Total (DZ)</th>
              <th className="p-3 border-b text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map((order) => {
              const totalQuantity = order.items.reduce(
                (sum, item) => sum + item.quantity,
                0
              );

              return (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="p-3 border-b font-medium">#{order.id}</td>
                  <td className="p-3 border-b">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 border-b">{order.status}</td>
                  <td className="p-3 border-b text-sm">
                    <div className="border rounded divide-y">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="p-1">
                          {item.productTitle} × {item.quantity}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 border-b text-center">{totalQuantity}</td>
                  <td className="p-3 border-b font-semibold">
                    {order.total} DZ
                  </td>
                  <td className="p-3 border-b text-center">
                    <Link
                      href={`/orders/${order.id}`} // ✅ correction ici
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Détails
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
