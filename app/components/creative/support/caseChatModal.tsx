// app/components/client/support/caseChatModal.tsx
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { X, Send, Loader2, Paperclip, FileText, Headphones } from "lucide-react";

interface ChatMessage {
    id: string;
    supportConversationId: string;
    content: string;
    contentType: "TEXT" | "IMAGE" | "FILE";
    fileUrl?: string;
    senderId: string;
    senderIsAdmin: boolean;
    createdAt: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    supportCaseId: string;
    caseNumber: string;
}

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

const CaseChatModal: React.FC<Props> = ({ isOpen, onClose, supportCaseId, caseNumber }) => {
    const socketRef = useRef<Socket | null>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [connecting, setConnecting] = useState(true);
    const [connectError, setConnectError] = useState<string | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [closed, setClosed] = useState<{ reason: string } | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Establish socket connection when modal opens
    useEffect(() => {
        if (!isOpen) return;
        console.log("[CaseChat] modal opened, connecting...");

        let socket: Socket;

        const connect = async () => {
            try {
                const tokenRes = await fetch("/api/auth/session/token");
                const { token } = await tokenRes.json();

                socket = io("https://api.jubalboard.com/support", {
                    auth: { token },
                });
                socketRef.current = socket;

                socket.on("connect", () => {
                    console.log("[CaseChat] socket connected:", socket.id);
                    setConnectError(null);
                    socket.emit("support:case-chat", { supportCaseId });
                });

                socket.on("error", (e: { message: string }) => {
                    console.error("[CaseChat] socket error:", e.message);
                    setConnectError(e.message);
                    setConnecting(false);
                });

                socket.onAny((eventName, ...args) => {
                    console.log("[CaseChat] ← server:", eventName, JSON.stringify(args));
                });

                socket.on(
                    "support:opened",
                    (payload: {
                        conversation: {
                            id: string;
                            kind: string;
                            supportCase?: { id: string; caseNumber: string; caseType: string };
                        };
                    }) => {
                        console.log("[CaseChat] support:opened", payload);
                        setConversationId(payload.conversation.id);
                        setConnecting(false);
                        socket.emit("support:messages", {
                            supportConversationId: payload.conversation.id,
                            page: 1,
                            limit: 50,
                        });
                    }
                );

                socket.on(
                    "support:history",
                    (payload: { supportConversationId: string; messages: { data: ChatMessage[] } }) => {
                        console.log("[CaseChat] support:history", payload);
                        setMessages(payload.messages.data.slice().reverse());
                    }
                );

                socket.on("support:message:receive", (msg: ChatMessage) => {
                    console.log("[CaseChat] message:receive", msg);
                    setMessages((prev) => {
                        const tempIndex = prev.findIndex(
                            (m) => m.id.startsWith("temp-") && m.content === msg.content && !m.senderIsAdmin
                        );
                        if (tempIndex !== -1) {
                            const updated = [...prev];
                            updated[tempIndex] = msg;
                            return updated;
                        }
                        return [...prev, msg];
                    });
                });

                socket.on(
                    "support:closed",
                    (payload: { conversationId: string; kind: string; reason: string; reopenable: boolean }) => {
                        console.log("[CaseChat] support:closed", payload);
                        setClosed({ reason: payload.reason });
                    }
                );

                socket.on("support:reopened", (payload: { conversationId: string }) => {
                    console.log("[CaseChat] support:reopened", payload);
                    setClosed(null);
                });
            } catch (err) {
                console.error("[CaseChat] connect failed:", err);
                setConnectError("Could not connect to support chat.");
                setConnecting(false);
            }
        };

        connect();

        return () => {
            console.log("[CaseChat] cleanup: disconnecting socket");
            socket?.disconnect();
            socketRef.current = null;
        };
    }, [isOpen, supportCaseId]);

    // Reset state whenever modal closes so reopening starts fresh
    useEffect(() => {
        if (!isOpen) {
            setConnecting(true);
            setConnectError(null);
            setConversationId(null);
            setMessages([]);
            setInput("");
            setClosed(null);
            setUploadError(null);
            setUploading(false);
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Close when clicking outside the panel
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    // Shared helper: optimistically append then emit to server
    const appendAndSend = useCallback(
        (content: string) => {
            if (!conversationId || closed) return;

            const optimisticMsg: ChatMessage = {
                id: `temp-${Date.now()}`,
                supportConversationId: conversationId,
                content,
                contentType: "TEXT",
                senderId: "me",
                senderIsAdmin: false,
                createdAt: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, optimisticMsg]);

            socketRef.current?.emit("support:send", {
                supportConversationId: conversationId,
                content,
                contentType: "TEXT",
            });
        },
        [conversationId, closed]
    );

    // Handle file upload then send via socket
    const handleFileChange = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file || !conversationId || closed) return;
            e.target.value = "";

            if (file.size > MAX_FILE_BYTES) {
                setUploadError("File must be smaller than 10MB.");
                return;
            }

            setUploadError(null);
            setUploading(true);

            try {
                const tokenRes = await fetch("/api/auth/session/token");
                const { token } = await tokenRes.json();

                const formData = new FormData();
                formData.append("files", file);

                const res = await fetch("/api/v1/support/uploads", {
                    method: "POST",
                    credentials: "include",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });

                const json = await res.json();
                if (!res.ok) throw new Error(json?.message || "Upload failed.");

                const url: string = json?.urls?.[0];
                if (!url) throw new Error("No URL returned from upload.");

                const isImage = file.type.startsWith("image/");
                const contentType: ChatMessage["contentType"] = isImage ? "IMAGE" : "FILE";
                const content = isImage ? "" : file.name;

                const optimisticMsg: ChatMessage = {
                    id: `temp-${Date.now()}`,
                    supportConversationId: conversationId,
                    content,
                    contentType,
                    fileUrl: url,
                    senderId: "me",
                    senderIsAdmin: false,
                    createdAt: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, optimisticMsg]);

                socketRef.current?.emit("support:send", {
                    supportConversationId: conversationId,
                    content,
                    contentType,
                    fileUrl: url,
                });
            } catch (err: any) {
                console.error("[CaseChat] upload failed:", err);
                setUploadError(err?.message || "Upload failed. Please try again.");
            } finally {
                setUploading(false);
            }
        },
        [conversationId, closed]
    );

    const handleSend = useCallback(() => {
        if (!input.trim() || !conversationId || closed) return;
        setSending(true);
        appendAndSend(input.trim());
        setInput("");
        setSending(false);
    }, [input, conversationId, closed, appendAndSend]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-24 right-6 z-50">
            <div
                ref={panelRef}
                className="bg-white rounded-2xl w-[380px] h-[560px] max-h-[75vh] flex flex-col overflow-hidden shadow-2xl border border-gray-100"
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-[#E05C5C] flex items-center justify-center flex-shrink-0">
                        <Headphones size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-black leading-tight">Support Team</p>
                        <p className="text-xs text-gray-400 leading-tight">Case #{caseNumber}</p>
                    </div>
                    <button onClick={onClose} aria-label="Close">
                        <X size={20} className="text-black" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3 bg-[#fafafa]">
                    {connectError && (
                        <p className="text-sm text-red-600 text-center py-6">{connectError}</p>
                    )}

                    {!connectError && connecting && (
                        <div className="flex-1 flex items-center justify-center gap-2 text-gray-400">
                            <Loader2 size={18} className="animate-spin" />
                            <span className="text-sm">Connecting...</span>
                        </div>
                    )}

                    {!connectError && !connecting && (
                        <>
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm ${msg.senderIsAdmin
                                            ? "bg-white text-black self-start"
                                            : "bg-[#E05C5C] text-white self-end"
                                        }`}
                                >
                                    {msg.contentType === "IMAGE" && msg.fileUrl ? (
                                        <img
                                            src={msg.fileUrl}
                                            alt="attachment"
                                            className="rounded-lg max-w-full cursor-pointer"
                                            onClick={() => window.open(msg.fileUrl, "_blank")}
                                        />
                                    ) : msg.contentType === "FILE" && msg.fileUrl ? (
                                        <a
                                            href={msg.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 underline underline-offset-2"
                                        >
                                            <FileText size={14} />
                                            {msg.content || "Download file"}
                                        </a>
                                    ) : (
                                        msg.content
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Upload error */}
                {uploadError && (
                    <div className="px-4 py-2 bg-red-50 border-t border-red-100">
                        <p className="text-xs text-red-600">{uploadError}</p>
                    </div>
                )}

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.txt,.zip"
                    className="hidden"
                    onChange={handleFileChange}
                />

                {/* Footer */}
                {closed ? (
                    <div className="px-5 py-4 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-500">
                            This case chat has been closed
                            {closed.reason === "RESOLVED" ? " — the case was resolved." : "."}
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={!conversationId || uploading}
                            className="text-gray-400 hover:text-[#E05C5C] disabled:opacity-40 transition-colors flex-shrink-0"
                            aria-label="Attach file"
                        >
                            {uploading ? (
                                <Loader2 size={18} className="animate-spin text-[#E05C5C]" />
                            ) : (
                                <Paperclip size={18} />
                            )}
                        </button>

                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={connecting || !conversationId}
                            placeholder={connecting ? "Connecting..." : "Type a message..."}
                            className="flex-1 bg-[#fafafa] rounded-full px-4 py-2.5 text-sm text-black outline-none disabled:opacity-60"
                        />
                        <button
                            onClick={handleSend}
                            disabled={sending || !input.trim() || connecting || !conversationId}
                            className="bg-[#E05C5C] text-white rounded-full p-2.5 disabled:opacity-50"
                            aria-label="Send"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CaseChatModal;