import { useState, useEffect } from "react";
import { TodoItem } from "@/app/types";

export function useTodos() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        const { token } = await tokenRes.json();
        const res = await fetch("/api/v1/creative/todo", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        const data = await res.json();
        setTodos(Array.isArray(data) ? data : data.data ?? []);
      } catch {
        setError("Failed to load todos.");
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  return { todos, loading, error };
}