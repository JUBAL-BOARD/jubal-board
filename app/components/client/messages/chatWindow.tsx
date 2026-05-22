// app/components/client/messages/clientChatWindow.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { Smile, Paperclip, ArrowLeft, Mic } from "lucide-react";
import { Conversation } from "@/app/types";
import { useMessageStore } from "../../../lib/stores/messageStore";
import ClientTopicChips from "./topicChips";
import { Topic } from "../../../lib/topic";

interface Props {
  conversation: Conversation;
  onBack?: () => void;
}

const ClientChatWindow: React.FC<Props> = ({ conversation, onBack }) => {
  const [input, setInput] = useState("");
  const [showChips, setShowChips] = useState(true);
  const sendMessageAs = useMessageStore((s) => s.sendMessageAs);
  const conversations = useMessageStore((s) => s.conversations);
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages =
    conversations.find((c) => c.id === conversation.id)?.messages ?? [];

  useEffect(() => {
    setShowChips(true);
  }, [conversation.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text?: string) => {
    const content = text ?? input;
    if (!content.trim()) return;
    // 👇 fromMe: true means this is the CLIENT sending
    sendMessageAs(conversation.id, content.trim(), true);
    setInput("");
  };

  const handleTopicSelect = (topic: Topic) => {
    sendMessageAs(conversation.id, topic.label, true);
    if (!topic.subtopics?.length) setShowChips(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
        {onBack && (
          <button onClick={onBack} className="lg:hidden p-1 -ml-1 text-gray-500">
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="relative">
          <img
            src={conversation.avatar}
            alt={conversation.name}
            className="w-9 h-9 rounded-full object-cover"
          />
          {conversation.isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{conversation.name}</p>
          <p className="text-xs text-gray-400">
            {conversation.isOnline ? "Online" : "typically replies in 10 minutes"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-3 bg-white min-h-0">

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.fromMe ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[80%] lg:max-w-[65%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.fromMe
                  ? "bg-orange-400 text-white rounded-br-sm"   // 👈 blue for client
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[11px] text-gray-400 mt-1">{msg.time}</span>
          </div>
        ))}

        {showChips && <ClientTopicChips onSelect={handleTopicSelect} />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-gray-100 bg-white flex items-center gap-2 flex-shrink-0">
        <button className="p-1.5 text-gray-400 hover:text-gray-600 flex-shrink-0">
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
        <button className="p-1.5 text-gray-400 hover:text-gray-600 flex-shrink-0">
          <Paperclip size={19} />
        </button>
        {input.trim() ? (
          <button
            onClick={() => handleSend()}
            className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
          >
            <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4 rotate-90">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        ) : (
          <button className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors flex-shrink-0">
            <Mic size={15} className="text-white" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ClientChatWindow;