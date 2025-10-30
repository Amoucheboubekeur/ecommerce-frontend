"use client";

import React, { useState } from "react";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import * as XLSX from "xlsx";
import { useApi } from "@/hooks/useApi";
import Swal from "sweetalert2";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  wilaya: string;
  phoneNumber: string;
}

interface Product {
  title: string;
  price: number;
}

interface OrderItem {
  product: Product;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  user: User;
  shippingAddress: string;
  wilaya: string;
  commune: string;
  deliveryMethod: string;
  deliveryPrice: number;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function AdminOrdersDashboard() {
  const {
    data: orders,
    loading,
    error,
    totalPages,
    currentPage,
    search,
    setSearch,
    status,
    setStatus,
    fetchData,
  } = usePaginatedList<Order>("/Orders/GetPaged", { pageSize: 10 });
  const api = useApi();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const toggleExpand = (orderId: string) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchData(page);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const actionText = newStatus === "Confirmed" ? "confirmer" : "annuler";

    const result = await Swal.fire({
      title: `Voulez-vous ${actionText} cette commande ?`,
      text: "Cette action est irréversible.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Oui, ${actionText}`,
      cancelButtonText: "Annuler",
      confirmButtonColor: newStatus === "Confirmed" ? "#16a34a" : "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    try {
      setUpdatingId(orderId);
      await api.put(`/Orders/${orderId}/status`, { status: newStatus });

      await Swal.fire({
        icon: "success",
        title: "Succès",
        text: `Commande ${actionText} avec succès.`,
        timer: 1800,
        showConfirmButton: false,
      });

      fetchData(currentPage);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible de mettre à jour le statut.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExportExcel = () => {
    if (orders.length === 0)
      return Swal.fire("Aucune commande", "Aucune commande à exporter.", "info");

    const data = orders.map((o) => ({
      Client: `${o.user.firstName} ${o.user.lastName}`,
      Email: o.user.email,
      Téléphone: o.user.phoneNumber,
      Wilaya: o.wilaya,
      Commune: o.commune,
      "Adresse Client": o.user.address,
      "Adresse Livraison": o.shippingAddress,
      "Méthode Livraison": o.deliveryMethod,
      "Prix Livraison": o.deliveryPrice,
      "Montant Total (DZD)": o.total.toFixed(2),
      Statut: o.status,
      Date: new Date(o.createdAt).toLocaleDateString("fr-FR"),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Commandes");
    XLSX.writeFile(wb, "Commandes.xlsx");

    Swal.fire("✅ Exporté", "Le fichier Excel a été téléchargé.", "success");
  };

  return (
    <main className="p-8 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📦 Gestion des Commandes</h1>
        <button
          onClick={handleExportExcel}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          ⬇ Exporter en Excel
        </button>
      </div>

      {/* 🔍 Recherche + Filtres */}
      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="🔍 Rechercher un client, wilaya..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les statuts</option>
          <option value="Pending">🕓 En attente</option>
          <option value="Confirmed">✅ Confirmé</option>
          <option value="Canceled">❌ Annulé</option>
        </select>
        <button
          onClick={() => fetchData(1)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Actualiser
        </button>
      </div>

      {/* 🧾 Tableau */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 border-b text-gray-700">
            <tr>
              <th className="p-3">Client</th>
              <th className="p-3">Email</th>
              <th className="p-3">Téléphone</th>
              <th className="p-3">Wilaya</th>
              <th className="p-3">Commune</th>
              <th className="p-3">Adresse Livraison</th>
              <th className="p-3">Méthode Livraison</th>
              <th className="p-3">Montant Total (DZD)</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Date</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={11} className="text-center py-6 text-gray-500">
                  Chargement...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={11} className="text-center py-6 text-red-600">
                  {error}
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-6 text-gray-500">
                  Aucune commande trouvée.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-3">
                      {order.user?.firstName} {order.user?.lastName}
                    </td>
                    <td className="p-3">{order.user?.email}</td>
                    <td className="p-3">{order.user?.phoneNumber || "-"}</td>
                    <td className="p-3">{order.wilaya}</td>
                    <td className="p-3">{order.commune}</td>
                    <td className="p-3">{order.shippingAddress}</td>
                    <td className="p-3 capitalize">{order.deliveryMethod}</td>
                    <td className="p-3 font-semibold">
                      {order.total.toFixed(2)} DZD
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          order.status === "Confirmed"
                            ? "bg-green-100 text-green-700"
                            : order.status === "Canceled"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="p-3 flex gap-2 justify-center">
                   
                        <>
                          <button
                            disabled={updatingId === order.id}
                            onClick={() =>
                              updateOrderStatus(order.id, "Confirmed")
                            }
                            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-xs"
                          >
                            {updatingId === order.id ? "..." : "Confirmer"}
                          </button>
                          <button
                            disabled={updatingId === order.id}
                            onClick={() =>
                              updateOrderStatus(order.id, "Canceled")
                            }
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs"
                          >
                            {updatingId === order.id ? "..." : "Annuler"}
                          </button>
                        </>
                      
                      <button
                        onClick={() => toggleExpand(order.id)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        {expandedOrder === order.id ? "▲ Masquer" : "▼ Détails"}
                      </button>
                    </td>
                  </tr>

                  {expandedOrder === order.id && order.items?.length > 0 && (
                    <tr className="bg-gray-50">
                      <td colSpan={11} className="p-4">
                        <div className="border rounded-lg p-4 bg-white shadow-sm">
                          <h4 className="font-semibold mb-3">
                            🛍️ Articles de la commande
                          </h4>
                          <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="p-2 text-left">Produit</th>
                                <th className="p-2 text-left">Quantité</th>
                                <th className="p-2 text-left">Prix unitaire</th>
                                <th className="p-2 text-left">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items.map((item, i) => (
                                <tr
                                  key={`${order.id}-item-${i}`}
                                  className="border-t"
                                >
                                  <td className="p-2">
                                    {item.product.title}
                                  </td>
                                  <td className="p-2">{item.quantity}</td>
                                  <td className="p-2">
                                    {item.unitPrice.toFixed(2)} DZD
                                  </td>
                                  <td className="p-2">
                                    {(
                                      item.unitPrice * item.quantity
                                    ).toFixed(2)}{" "}
                                    DZD
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 🔄 Pagination */}
      <div className="flex justify-center items-center gap-3 mt-6 text-sm">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded border ${
            currentPage === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white hover:bg-gray-100"
          }`}
        >
          ◀ Précédent
        </button>

        <span>
          Page <b>{currentPage}</b> / {totalPages}
        </span>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded border ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white hover:bg-gray-100"
          }`}
        >
          Suivant ▶
        </button>
      </div>
    </main>
  );
}