"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { X, Send, Loader2 } from "lucide-react";

interface Topic {
    id: string;
    name: string;
    description?: string;
    slaThresholdHours?: number;
    children?: Topic[];
}

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
}

const LiveChatModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const socketRef = useRef<Socket | null>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const [connecting, setConnecting] = useState(true);
    const [connectError, setConnectError] = useState<string | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [topicName, setTopicName] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [closed, setClosed] = useState<{ reason: string } | null>(null);

    const [allTopics, setAllTopics] = useState<Topic[]>([]);
    const [activePills, setActivePills] = useState<Topic[]>([]);
    const [pickedTopicIds, setPickedTopicIds] = useState<Set<string>>(new Set());

    // Establish socket connection when modal opens
    useEffect(() => {
        if (!isOpen) return;
        console.log("[LiveChat] modal opened, connecting...");

        let socket: Socket;
        let hasOpened = false;
        let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
        let pendingTopics: Topic[] = [];

        const connect = async () => {
            try {
                const tokenRes = await fetch("/api/auth/session/token");
                const { token } = await tokenRes.json();

                socket = io("https://api.jubalboard.com/support", {
                    auth: { token },
                });
                socketRef.current = socket;

                socket.on("connect", () => {
                    console.log("[LiveChat] socket connected:", socket.id);
                    setConnectError(null);
                    socket.emit("support:topics", {});
                });

                socket.on("error", (e: { message: string }) => {
                    console.error("[LiveChat] socket error:", e.message);
                    setConnectError(e.message);
                    setConnecting(false);
                });

                socket.on("support:topics:list", (payload: { data: Topic[] }) => {
                    console.log("[LiveChat] topics:list", payload);
                    const topics = payload?.data ?? [];
                    setAllTopics(topics);
                    setActivePills(topics);
                    pendingTopics = topics;

                    if (topics.length === 0) {
                        setConnecting(false);
                        return;
                    }

                    fallbackTimer = setTimeout(() => {
                        if (!hasOpened) {
                            console.log("[LiveChat] no auto-pushed conversation, falling back to open-live for topicId:", pendingTopics[0].id);
                            hasOpened = true;
                            socket.emit("support:open-live", { topicId: pendingTopics[0].id });
                        }
                    }, 5000);
                });

                socket.onAny((eventName, ...args) => {
                    console.log("[LiveChat] ← server:", eventName, JSON.stringify(args));
                });

                socket.on(
                    "support:opened",
                    (payload: { conversation: { id: string; kind: string; topic?: { id: string; name: string } } }) => {
                        console.log("[LiveChat] support:opened", payload);
                        if (fallbackTimer) {
                            clearTimeout(fallbackTimer);
                            fallbackTimer = null;
                        }
                        hasOpened = true;
                        setConversationId(payload.conversation.id);
                        setTopicName(payload.conversation.topic?.name ?? null);
                        setConnecting(false);
                        socket.emit("support:messages", { supportConversationId: payload.conversation.id, page: 1, limit: 50 });
                    }
                );

                socket.on(
                    "support:history",
                    (payload: { supportConversationId: string; messages: { data: ChatMessage[] } }) => {
                        console.log("[LiveChat] support:history", payload);
                        setMessages(payload.messages.data.slice().reverse());
                    }
                );

                // Deduplicate: replace optimistic temp message with real one if it matches,
                // otherwise append. Prevents doubles when server echoes back your own send.
                socket.on("support:message:receive", (msg: ChatMessage) => {
                    console.log("[LiveChat] message:receive", msg);
                    setMessages((prev) => {
                        const tempIndex = prev.findIndex(
                            (m) => m.id.startsWith("temp-") && m.content === msg.content && !m.senderIsAdmin
                        );
                        if (tempIndex !== -1) {
                            // Swap the optimistic placeholder for the confirmed message
                            const updated = [...prev];
                            updated[tempIndex] = msg;
                            return updated;
                        }
                        // Message from the other side — just append
                        return [...prev, msg];
                    });
                });

                socket.on("support:closed", (payload: { conversationId: string; reason: string; reopenable: boolean }) => {
                    console.log("[LiveChat] support:closed", payload);
                    setClosed({ reason: payload.reason });
                });
            } catch (err) {
                console.error("[LiveChat] connect failed:", err);
                setConnectError("Could not connect to support chat.");
                setConnecting(false);
            }
        };

        connect();

        return () => {
            console.log("[LiveChat] cleanup: disconnecting socket");
            if (fallbackTimer) clearTimeout(fallbackTimer);
            socket?.disconnect();
            socketRef.current = null;
        };
    }, [isOpen]);

    // Reset state whenever modal closes so reopening starts fresh
    useEffect(() => {
        if (!isOpen) {
            setConnecting(true);
            setConnectError(null);
            setConversationId(null);
            setTopicName(null);
            setMessages([]);
            setInput("");
            setClosed(null);
            setAllTopics([]);
            setActivePills([]);
            setPickedTopicIds(new Set());
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activePills]);

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

    // Clicking a topic pill: send it as a message, then drill into children if any
    const handlePickPill = useCallback(
        (topic: Topic) => {
            if (!conversationId || closed) return;

            setPickedTopicIds((prev) => new Set(prev).add(topic.id));
            appendAndSend(topic.name);

            if (topic.children && topic.children.length > 0) {
                setActivePills(topic.children);
                setPickedTopicIds(new Set());
            } else {
                setActivePills([]);
            }
        },
        [conversationId, closed, appendAndSend]
    );

    const handleSend = useCallback(() => {
        if (!input.trim() || !conversationId || closed) return;
        setSending(true);
        appendAndSend(input.trim());
        setInput("");
        setSending(false); // optimistic — server ack isn't strictly needed for UX here
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
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold font-heading text-black">
                        {topicName ?? "Live Chat"}
                    </h2>
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
                                        <img src={msg.fileUrl} alt="attachment" className="rounded-lg max-w-full" />
                                    ) : (
                                        msg.content
                                    )}
                                </div>
                            ))}

                            {/* Topic pills (quick replies) */}
                            {activePills.length > 0 && !closed && (
                                <div className="flex flex-wrap gap-2 self-end justify-end">
                                    {activePills
                                        .filter((t) => !pickedTopicIds.has(t.id))
                                        .map((topic) => (
                                            <button
                                                key={topic.id}
                                                onClick={() => handlePickPill(topic)}
                                                className="border border-[#E05C5C] text-[#E05C5C] rounded-full px-4 py-1.5 text-sm font-medium hover:bg-[#E05C5C] hover:text-white transition-colors"
                                            >
                                                {topic.name}
                                            </button>
                                        ))}
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Footer */}
                {closed ? (
                    <div className="px-5 py-4 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-500">
                            This chat has been closed
                            {closed.reason === "INACTIVITY_24H" ? " due to inactivity." : "."}
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100">
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

export default LiveChatModal;