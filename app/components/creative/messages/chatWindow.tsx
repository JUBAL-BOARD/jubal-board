"use client";
import { useState, useRef, useEffect } from "react";
import { Smile, Paperclip, ArrowLeft, Mic, Loader2 } from "lucide-react";
import { Conversation } from "@/app/lib/api/messageApi";
import { useConversationDetail } from "@/app/lib/hooks/useConversationDetail";
import { sendMessage } from "@/app/lib/api/messageApi";
import TopicChips from "@/app/components/creative/messages/topicChips";
import { Topic } from "../../../lib/topic";
import { formatDistanceToNow } from "date-fns";

interface Props {
  conversation: Conversation;
  currentUserId: string;
  onBack?: () => void;
}

const ChatWindow: React.FC<Props> = ({
  conversation,
  currentUserId,
  onBack,
}) => {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showChips, setShowChips] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { detail, loading, refetch } = useConversationDetail(
    conversation.id,
    conversation.type
  );

  const messages = detail?.messages.data ?? [];

  useEffect(() => {
    setShowChips(true);
  }, [conversation.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    try {
      setSending(true);
      setInput("");
      await sendMessage(conversation.id, {
        content,
        contentType: "TEXT",
      });
      await refetch();
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setSending(false);
    }
  };

  const handleTopicSelect = (topic: Topic) => {
    handleSend(topic.label);
    if (!topic.subtopics?.length) setShowChips(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
            <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-500 text-xs font-bold">G</span>
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
            {participant.name}
          </p>
          <p className="text-xs text-gray-400">{conversation.topic.name}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-3 bg-white min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-[#E2554F]" size={24} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400">
              No messages yet. Say hello!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const fromMe = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  fromMe ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[80%] lg:max-w-[65%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    fromMe
                      ? "bg-orange-400 text-white rounded-br-sm"
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
                  {formatDistanceToNow(new Date(msg.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            );
          })
        )}

        {showChips && messages.length === 0 && (
          <TopicChips onSelect={handleTopicSelect} />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-gray-100 bg-white flex items-center gap-2 flex-shrink-0">
        <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
          <Smile size={19} />
        </button>
        <input
          type="text"
          placeholder="Send a message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none min-w-0"
        />
        <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
          <Paperclip size={19} />
        </button>

        {input.trim() ? (
          <button
            onClick={() => handleSend()}
            disabled={sending}
            className="w-8 h-8 bg-[#1a1a2e] hover:bg-[#2a2a4e] rounded-full flex items-center justify-center transition-colors flex-shrink-0 disabled:opacity-50"
          >
            {sending ? (
              <Loader2 size={14} className="animate-spin text-white" />
            ) : (
              <svg
                viewBox="0 0 20 20"
                fill="white"
                className="w-4 h-4 rotate-90"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        ) : (
          <button className="w-8 h-8 bg-[#1a1a2e] hover:bg-[#2a2a4e] rounded-full flex items-center justify-center transition-colors flex-shrink-0">
            <Mic size={15} className="text-white" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;