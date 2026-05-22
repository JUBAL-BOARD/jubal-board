import { useState, useEffect, useCallback } from "react";
import {
  fetchConversationDetail,
  fetchGroupConversationDetail,
  ConversationDetail,
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

      // Handle both wrapped { data: {...} } and unwrapped responses
      const data: any = (raw as any)?.data ?? raw;
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

  return { detail, loading, error, refetch: load };
}