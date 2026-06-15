import { useState, useEffect, useCallback, useRef } from "react";
import { Conversation } from "@/app/lib/api/messageApi";
import { useSocket } from "./useSocket";

async function getToken(): Promise<string> {
  const res = await fetch("/api/auth/session/token", { credentials: "include" });
  const { token } = await res.json();
  return token || "";
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    getToken().then(setToken);
  }, []);

  const handleChatList = useCallback((data: any) => {
    const list = Array.isArray(data?.data) ? data.data : [];
    setConversations(list);
    setLoading(false);
  }, []);

  const handleChatUpdate = useCallback((updated: any) => {
    setConversations((prev) => {
      const exists = prev.find((c) => c.id === updated.id);
      if (exists) {
        return prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c));
      }
      return [updated, ...prev];
    });
  }, []);

  const { emitChats } = useSocket({
    token,
    onChatList: handleChatList,
    onChatUpdate: handleChatUpdate,
  });

  // Fallback: if socket doesn't fire chat:list within 3s, fetch via REST
  useEffect(() => {
    if (!token) return;
    const timeout = setTimeout(async () => {
      if (conversations.length === 0) {
        try {
          const { fetchConversations } = await import("@/app/lib/api/messageApi");
          const res = await fetchConversations({ limit: 50 });
          console.log("fetchConversations raw:", res);
          const list = Array.isArray(res) ? res : (res as any).data ?? [];
          setConversations(list);
        } catch {
          setError("Failed to load conversations");
        } finally {
          setLoading(false);
        }
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, [token, conversations.length]);

  return { conversations, loading, error, refetch: emitChats };
}