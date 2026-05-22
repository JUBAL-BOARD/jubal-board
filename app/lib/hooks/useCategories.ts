import { useState, useEffect } from "react";

export interface Skill {
  id: string;
  name: string;
  serviceId: string;
  isActive: boolean;
}

export interface Service {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  skills: Skill[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  services: Service[];
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch('/api/v1/categories', {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);

        const data = await res.json();
        setCategories(Array.isArray(data) ? data : data.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}