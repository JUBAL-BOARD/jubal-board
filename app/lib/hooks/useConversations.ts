import { useState, useEffect, useCallback } from "react";
import { fetchConversations, Conversation } from "@/app/lib/api/messageApi";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchConversations({ limit: 50 });
      const list = Array.isArray(res) ? res : res.data ?? [];
      setConversations(list);
    } catch (err: any) {
      console.error("useConversations error:", err);
      // If 500, backend has no conversations for this user yet — treat as empty
      if (err?.status === 500 || err?.statusCode === 500) {
        setConversations([]);
        setError(null); // don't show error to user
      } else {
        setError(err.message || "Failed to fetch conversations");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { conversations, loading, error, refetch: load };
}