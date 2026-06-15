import { useState, useEffect, useCallback } from "react";
import {
  fetchConversationDetail,
  fetchGroupConversationDetail,
  ConversationDetail,
  Message,
} from "@/app/lib/api/messageApi";
import { useSocket } from "./useSocket";

async function getToken(): Promise<string> {
  const res = await fetch("/api/auth/session/token", { credentials: "include" });
  const { token } = await res.json();
  return token || "";
}

export function useConversationDetail(
  conversationId: string | null,
  type: "DIRECT" | "GROUP" = "DIRECT"
) {
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    getToken().then(setToken);
  }, []);

  const load = useCallback(async () => {
    if (!conversationId) return;
    try {
      setLoading(true);
      setError(null);
      const raw =
        type === "GROUP"
          ? await fetchGroupConversationDetail(conversationId)
          : await fetchConversationDetail(conversationId);
      const data: any = (raw as any)?.data ?? raw;
      if (Array.isArray(data?.messages)) {
        data.messages = {
          data: data.messages,
          total: data.messages.length,
          page: data.page ?? 1,
          limit: data.limit ?? 30,
        };
      }
      setDetail(data);
    } catch (err: any) {
      console.error("useConversationDetail error:", err);
      setError(err.message || "Failed to load conversation");
    } finally {
      setLoading(false);
    }
  }, [conversationId, type]);

  useEffect(() => {
    load();
  }, [load]);

  const appendMessage = useCallback((newMsg: Message) => {
    setDetail((prev) => {
      if (!prev) return prev;
      const existingMessages = prev.messages?.data ?? [];
      const alreadyExists = existingMessages.some((m) => m.id === newMsg.id);
      if (alreadyExists) return prev;
      return {
        ...prev,
        messages: {
          ...prev.messages,
          data: [...existingMessages, newMsg],
        },
      };
    });
  }, []);

  return { detail, loading, error, refetch: load, appendMessage };
}