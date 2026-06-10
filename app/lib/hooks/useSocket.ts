import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface UseSocketOptions {
  conversationId: string;
  token: string;
  onNewMessage: (message: any) => void;
  onTyping?: (data: { userId: string; isTyping: boolean }) => void;
  onMessageRead?: (data: { messageId: string; readAt: string; readByUserId: string }) => void;
}

export function useSocket({
  conversationId,
  token,
  onNewMessage,
  onTyping,
  onMessageRead,
}: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token || !conversationId) return;

    // Connect with JWT token in the auth object (exactly as Swagger docs say)
    const socket = io("https://api.jubalboard.com", {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);

      // Join the conversation room immediately after connecting
      socket.emit("join", { conversationId });
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    // Server sends full history when you join — we can ignore this
    // since we already loaded messages via REST API
    socket.on("message:history", () => {
      // already loaded via fetchConversationDetail, skip
    });

    // This is the key one — fires when the other person sends a message
    socket.on("message:receive", (msg) => {
      onNewMessage(msg);
    });

    // Optional: typing indicator
    socket.on("message:typing", (data) => {
      onTyping?.(data);
    });

    // Optional: read receipts
    socket.on("message:read", (data) => {
      onMessageRead?.(data);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.emit("leave", { conversationId }); // leave the room cleanly
      socket.disconnect();
    };
  }, [token, conversationId]); // reconnects when you switch conversations

  // Call this to emit typing indicator
  const emitTyping = useCallback((isTyping: boolean) => {
    socketRef.current?.emit("message:typing", { conversationId, isTyping });
  }, [conversationId]);

  // Call this to mark a message as read
  const emitRead = useCallback((messageId: string) => {
    socketRef.current?.emit("message:read", { conversationId, messageId });
  }, [conversationId]);

  return { emitTyping, emitRead };
}