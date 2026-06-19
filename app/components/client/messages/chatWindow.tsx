"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Smile, Paperclip, ArrowLeft, Mic, Loader2 } from "lucide-react";
import { Conversation } from "@/app/lib/api/messageApi";
import { useConversationDetail } from "@/app/lib/hooks/useConversationDetail";
import { useSocket, getGlobalSocket } from "@/app/lib/hooks/useSocket";
import ClientTopicChips from "@/app/components/client/messages/topicChips";
import { Topic } from "@/app/lib/topic";
import { formatDistanceToNow } from "date-fns";

interface Props {
  conversation: Conversation;
  currentUserId: string;
  onBack?: () => void;
}

async function getToken(): Promise<string> {
  const res = await fetch("/api/auth/session/token", { credentials: "include" });
  const { token } = await res.json();
  return token || "";
}

// Works whether the name came from history (msg.sender.name)
// or a live socket push (msg.senderName) — the two payload shapes differ.
const getSenderName = (msg: any): string =>
  msg.sender?.name ?? msg.senderName ?? "Unknown";

const ClientChatWindow: React.FC<Props> = ({ conversation, currentUserId, onBack }) => {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showChips, setShowChips] = useState(true);
  const [token, setToken] = useState("");
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [currentTopic, setCurrentTopic] = useState(conversation.topic ?? null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { detail, loading, appendMessage } = useConversationDetail(
    conversation.id,
    conversation.type
  );

  const messages = detail?.messages.data ?? [];
  const hasTopic = !!currentTopic?.id;
  const isClosed =
    (conversation as any).projectStatus === "COMPLETED" ||
    (conversation as any).projectStatus === "CANCELLED";

  useEffect(() => {
    getToken().then(setToken);
  }, []);

  useEffect(() => {
    setShowChips(true);
    setCurrentTopic(conversation.topic ?? null);
  }, [conversation.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherTyping]);

  const handleNewMessage = useCallback(
    (msg: any) => {
      appendMessage(msg);
    },
    [appendMessage]
  );

  const handleTyping = useCallback(
    (data: { userId: string; isTyping: boolean }) => {
      if (data.userId === currentUserId) return;
      setIsOtherTyping(data.isTyping);
      if (data.isTyping) {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsOtherTyping(false), 3000);
      }
    },
    [currentUserId]
  );

  const { emitMessage, emitTyping, emitRead } = useSocket({
    token,
    conversationId: conversation.id,
    onNewMessage: handleNewMessage,
    onTyping: handleTyping,
  });

  const handleSend = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || sending || !hasTopic || isClosed) return;
    setSending(true);
    setInput("");
    emitTyping(false);
    emitMessage(content, "TEXT");
    setSending(false);
  };

  const handleTopicSelect = (topic: Topic) => {
    const socket = getGlobalSocket();
    if (!socket || isClosed) return;

    if (!currentTopic?.id) {
      // No topic set yet — set it first then send the label as a message
      socket.emit("conversation:set-topic", {
        conversationId: conversation.id,
        topicId: topic.id,
      });

      socket.once("conversation:topic-set", (data: any) => {
        setCurrentTopic(data.topic);
        emitMessage(topic.label, "TEXT");
        if (!topic.subtopics?.length) setShowChips(false);
      });
    } else {
      // Topic already set — just send subtopic as a message
      emitMessage(topic.label, "TEXT");
      if (!topic.subtopics?.length) setShowChips(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    const unread = messages.filter(
      (m) => !m.isRead && m.senderId !== currentUserId
    );
    unread.forEach((m) => emitRead(m.id));
  }, [messages, currentUserId, emitRead]);

  const participant = conversation.otherParticipant;
  const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    participant.name
  )}&background=1a1a2e&color=fff&size=64`;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            className="lg:hidden p-1 -ml-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="relative">
          {conversation.type === "GROUP" ? (
            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-500 text-xs font-bold">G</span>
            </div>
          ) : (
            <img
              src={participant.avatarUrl || avatarFallback}
              alt={participant.name}
              className="w-9 h-9 rounded-full object-cover"
            />
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">
            {(conversation as any).project?.title ?? participant.name}
          </p>
          <p className="text-xs text-gray-400">
            {isOtherTyping ? (
              <span className="text-blue-400 italic">typing...</span>
            ) : (
              currentTopic?.name ?? "No topic set"
            )}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white min-h-0">
        <div className="flex flex-col gap-3 px-3 py-8 justify-end min-h-full">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-[#E2554F]" size={24} />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-400">No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const fromMe = msg.senderId === currentUserId;
              const prevMsg = messages[index - 1];
              const showSenderName =
                conversation.type === "GROUP" &&
                !fromMe &&
                msg.senderId !== prevMsg?.senderId;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${fromMe ? "items-end" : "items-start"}`}
                >
                  {showSenderName && (
                    <span className="text-xs font-medium text-gray-500 mb-1 px-1">
                      {getSenderName(msg)}
                    </span>
                  )}
                  <div
                    className={`max-w-[80%] lg:max-w-[65%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      fromMe
                        ? "bg-blue-500 text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-800 rounded-bl-sm"
                    }`}
                  >
                    {msg.contentType === "TEXT" && msg.content}
                    {msg.contentType === "IMAGE" && (
                      <img
                        src={msg.fileUrl || ""}
                        alt="image"
                        className="rounded-lg max-w-full"
                      />
                    )}
                    {msg.contentType === "FILE" && (
                      <a
                        href={msg.fileUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline flex items-center gap-1"
                      >
                        <Paperclip size={12} /> {msg.content || "File"}
                      </a>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                  </span>
                </div>
              );
            })
          )}

          {/* Typing indicator */}
          {isOtherTyping && (
            <div className="flex items-start">
              <div className="bg-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          {showChips && messages.length === 0 && (
            <ClientTopicChips onSelect={handleTopicSelect} />
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Closed chat banner */}
      {isClosed && (
        <div className="px-4 py-2 bg-gray-100 text-center text-xs text-gray-500 flex-shrink-0">
          This project is closed. Messaging is disabled.
        </div>
      )}

      {/* Input */}
      <div
        className={`px-3 py-3 border-t border-gray-100 bg-white flex items-center gap-2 flex-shrink-0 ${
          isClosed ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
          <Smile size={19} />
        </button>
        <input
          type="text"
          placeholder={
            isClosed
              ? "Chat is closed"
              : !hasTopic
              ? "Select a topic first..."
              : "Send a message"
          }
          disabled={!hasTopic || isClosed}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            emitTyping(e.target.value.length > 0);
          }}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none min-w-0 disabled:cursor-not-allowed"
        />
        <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
          <Paperclip size={19} />
        </button>

        {input.trim() ? (
          <button
            onClick={() => handleSend()}
            disabled={sending || !hasTopic || isClosed}
            className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <Loader2 size={14} className="animate-spin text-white" />
            ) : (
              <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4 rotate-90">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        ) : (
          <button
            disabled={isClosed}
            className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors flex-shrink-0 disabled:opacity-50"
          >
            <Mic size={15} className="text-white" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ClientChatWindow;