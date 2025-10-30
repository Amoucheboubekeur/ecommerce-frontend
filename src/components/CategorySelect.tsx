"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";

interface Category {
  id: string;
  name: string;
}

interface Props {
  value?: string;
  onChange: (value: string) => void;
  includeEmpty?: boolean;
  className?: string;
}

export default function CategorySelect({ value, onChange, includeEmpty = true, className }: Props) {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
const api = useApi();
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/Categories");
        setCats(res.data);
      } catch (err) {
        console.error("Impossible de charger les catégories", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={className ?? "w-full border px-3 py-2 rounded"}
      disabled={loading}
    >
      {includeEmpty && <option value="">Sélectionnez une catégorie</option>}
      {cats.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
