"use client";

import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export function useApi() {
  const { user } = useAuth();

  const api = axios.create({
    baseURL: "https://ecommercebackend-h973.onrender.com/api/",
  });

  // ✅ Ajouter le token et le rôle à chaque requête
  api.interceptors.request.use((config) => {
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;

      const role = user.role || "User";
      config.headers["X-User-Role"] = role;
    }

    return config;
  });

  return api;
}
