"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useMessageStore } from "../../../lib/stores/messageStore";
import { useOpenClientChat } from "../../../lib/hooks/useOpenClientChat";
import { Conversation } from "@/app/types";

const ClientConversationList = () => {
  const [search, setSearch] = useState("");
  const conversations = useMessageStore((s) => s.conversations);
  const activeConversationId = useMessageStore((s) => s.activeConversationId);
  const { openDM, openGroup } = useOpenClientChat();

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (convo: Conversation) => {
    if (convo.type === "group" || convo.isGroup) {
      openGroup({
        id: convo.id,
        title: convo.name,
        members: convo.members ?? [],
      });
    } else {
      openDM({
        id: convo.id,
        name: convo.name,
        avatar: convo.avatar ?? "",
        isOnline: convo.isOnline,
      });
    }
  };

  return (
    <div className="w-full flex flex-col overflow-hidden">
      {/* Search */}
      <div className="p-3 border-b border-gray-100 flex-shrink-0">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-xs text-gray-400 text-center mt-10">No conversations yet.</p>
        ) : (
          filtered.map((convo) => (
            <div
              key={convo.id}
              onClick={() => handleSelect(convo)}
              className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors border-b border-gray-50 ${
                activeConversationId === convo.id ? "bg-blue-50" : "hover:bg-gray-50" // 👈 blue tint for client
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {convo.type === "group" || convo.isGroup ? (
                  <div className="w-10 h-10 relative">
                    {convo.members?.slice(0, 2).map((m, i) => (
                      <img
                        key={i}
                        src={m.avatar}
                        alt={m.name}
                        className={`w-7 h-7 rounded-full object-cover border-2 border-white absolute ${
                          i === 0 ? "top-0 left-0" : "bottom-0 right-0"
                        }`}
                      />
                    ))}
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">G</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={convo.avatar}
                      alt={convo.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {convo.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-sm font-semibold text-gray-900 truncate">{convo.name}</p>
                  <span className="text-[11px] text-gray-400 flex-shrink-0 ml-1">{convo.lastTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400 truncate">
                    {convo.type === "group" && convo.lastMessage
                      ? `${convo.lastSender ?? "Someone"}: ${convo.lastMessage}`
                      : convo.lastMessage}
                  </p>
                  {(convo.unread ?? 0) > 0 && (
                    <span className="ml-1 flex-shrink-0 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                      {convo.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientConversationList;