"use client";
import { useState, useRef, useEffect } from "react";
import { Smile, Image, Mic, ArrowLeft } from "lucide-react";
import { Conversation } from "@/app/types";

interface Props {
  conversation: Conversation;
  onBack?: () => void;
}

const ChatWindow: React.FC<Props> = ({ conversation, onBack }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(conversation.messages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(conversation.messages);
  }, [conversation.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: input.trim(), fromMe: true, time: "Now" },
    ]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 lg:px-5 py-3 lg:py-4 border-b border-gray-200 bg-white flex-shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            className="lg:hidden p-1 -ml-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="relative">
          <img
            src={conversation.avatar}
            alt={conversation.name}
            className="w-9 h-9 lg:w-10 lg:h-10 rounded-full object-cover"
          />
          {conversation.isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{conversation.name}</p>
          <p className="text-xs text-green-500">{conversation.isOnline ? "Online" : "Offline"}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 lg:px-5 py-4 flex flex-col gap-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.fromMe ? "items-end" : "items-start"}`}>
            {msg.isQuickReply ? (
              <div className="bg-cyan-100 text-cyan-800 text-xs font-medium px-4 py-2 rounded-full">
                {msg.text}
              </div>
            ) : (
              <div
                className={`max-w-[80%] lg:max-w-[65%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.fromMe
                    ? "bg-white border border-gray-200 text-gray-800 rounded-br-sm"
                    : "bg-yellow-50 border border-yellow-100 text-gray-800 rounded-bl-sm"
                }`}
              >
                {msg.text}
              </div>
            )}
            <span className="text-[11px] text-gray-400 mt-1">{msg.time}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 lg:px-4 py-3 border-t border-gray-200 bg-white flex items-center gap-2 lg:gap-3 flex-shrink-0">
        <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
          <Smile size={20} />
        </button>
        <input
          type="text"
          placeholder="Message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none min-w-0"
        />
        <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
          <Image size={20} />
        </button>
        <button
          onClick={handleSend}
          className="w-9 h-9 bg-[#1a1a2e] hover:bg-[#2a2a4e] rounded-full flex items-center justify-center transition-colors flex-shrink-0"
        >
          <Mic size={16} className="text-white" />
        </button>
      </div>

    </div>
  );
};

export default ChatWindow;