"use client";

import { useState, useEffect } from "react";
import { useApi } from "./useApi";

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

export interface PagedResponse<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export function usePaginatedList<T>(
  endpoint: string,
  defaultParams: PaginationParams = { page: 1, pageSize: 10 }
) {
  const api = useApi();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(defaultParams.page || 1);
  const [search, setSearch] = useState(defaultParams.search || "");
  const [status, setStatus] = useState(defaultParams.status || "");

  const fetchData = async (page = currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: defaultParams.pageSize?.toString() || "10",
        search,
        status,
      });
      const res = await api.get<PagedResponse<T>>(`${endpoint}?${params}`);
          console.log(res.data.data);

      setData(res.data.data);
      setTotalPages(res.data.totalPages);
      setCurrentPage(res.data.currentPage);
    } catch (err) {
      console.error(err);
      setError("Erreur de chargement des données");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Ajout d’un DEBOUNCE sur la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(1);
    }, 500); // attendre 500ms après la dernière frappe

    return () => clearTimeout(timer); // nettoyage du timer à chaque frappe
  }, [search, status]);

  return {
    data,
    loading,
    error,
    totalPages,
    currentPage,
    search,
    setSearch,
    status,
    setStatus,
    fetchData,
    setCurrentPage,
  };
}
