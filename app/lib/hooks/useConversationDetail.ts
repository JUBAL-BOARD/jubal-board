import { useState, useEffect, useCallback } from "react";
import {
  fetchConversationDetail,
  fetchGroupConversationDetail,
  ConversationDetail,
  Message,
} from "@/app/lib/api/messageApi";

export function useConversationDetail(
  conversationId: string | null,
  type: "DIRECT" | "GROUP" = "DIRECT"
) {
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // API returns messages as a plain array — normalize to { data: [] }
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