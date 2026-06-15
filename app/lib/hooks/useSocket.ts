import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

let globalSocket: Socket | null = null;

interface UseSocketOptions {
  token: string;
  conversationId?: string;
  onNewMessage?: (message: any) => void;
  onTyping?: (data: { userId: string; isTyping: boolean }) => void;
  onMessageRead?: (data: { messageId: string; readAt: string; readByUserId: string }) => void;
  onChatList?: (data: any) => void;
  onChatUpdate?: (data: any) => void;
}

export function useSocket({
  token,
  conversationId,
  onNewMessage,
  onTyping,
  onMessageRead,
  onChatList,
  onChatUpdate,
}: UseSocketOptions) {
  const listenersAttached = useRef(false);

  useEffect(() => {
    if (!token) return;
    console.log("useSocket: token received, connecting...");

    if (!globalSocket || !globalSocket.connected) {
      console.log("useSocket: creating new socket");
      globalSocket = io("https://api.jubalboard.com", {
        auth: { token },
        transports: ["websocket"],
      });
    } else {
      console.log("useSocket: reusing existing socket, connected:", globalSocket.connected);
    }

    const socket = globalSocket;

    socket.on("connect", () => {
      console.log("useSocket: connected, emitting chats...");
      socket.emit("chats", { page: 1, limit: 50 });
    });

    if (socket.connected) {
      console.log("useSocket: already connected, emitting chats immediately");
      socket.emit("chats", { page: 1, limit: 50 });
    }

    socket.on("connect_error", (err) => {
      console.error("useSocket: connect_error", err.message);
    });

    socket.on("chat:list", (data) => {
      console.log("chat:list full data:", JSON.stringify(data.data, null, 2));
      onChatList?.(data);
    });

    socket.on("chat:update", (data) => {
      onChatUpdate?.(data);
    });

    socket.on("message:receive", (msg) => {
      console.log("message:receive fired:", msg);
      if (!conversationId || msg.conversationId === conversationId) {
        onNewMessage?.(msg);
      }
    });

    socket.on("message:typing", (data) => {
      onTyping?.(data);
    });

    socket.on("message:read", (data) => {
      onMessageRead?.(data);
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err);
    });

    socket.on("exception", (err) => {
      console.error("Socket exception:", err);
    });

    socket.on("message:error", (err) => {
      console.error("Socket message error:", err);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.off("chat:list");
      socket.off("chat:update");
      socket.off("message:receive");
      socket.off("message:typing");
      socket.off("message:read");
      socket.off("error");
      socket.off("exception");
      socket.off("message:error");
    };
  }, [token, conversationId]);

  const emitMessage = useCallback(
    (content: string, contentType: "TEXT" | "FILE" | "IMAGE" = "TEXT", fileUrl?: string) => {
      console.log("emitMessage called:", { conversationId, content, connected: globalSocket?.connected });
      if (!conversationId || !globalSocket) return;
      globalSocket.emit("message:send", {
        conversationId,
        content,
        contentType,
        ...(fileUrl && { fileUrl }),
      });
    },
    [conversationId]
  );

  const emitTyping = useCallback(
    (isTyping: boolean) => {
      if (!conversationId) return;
      globalSocket?.emit("message:typing", { conversationId, isTyping });
    },
    [conversationId]
  );

  const emitRead = useCallback(
    (messageId: string) => {
      if (!conversationId) return;
      globalSocket?.emit("message:read", { conversationId, messageId });
    },
    [conversationId]
  );

  const loadMessages = useCallback(
    (page = 1, limit = 30) => {
      if (!conversationId) return;
      globalSocket?.emit("messages", { conversationId, page, limit });
    },
    [conversationId]
  );

  const emitChats = useCallback(() => {
    globalSocket?.emit("chats", { page: 1, limit: 50 });
  }, []);

  return { emitMessage, emitTyping, emitRead, loadMessages, emitChats };
}

export function getGlobalSocket() {
  return globalSocket;
}