"use client";
import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useConversations } from "@/app/lib/hooks/useConversations";
import { Conversation } from "@/app/lib/api/messageApi";
import { formatDistanceToNow } from "date-fns";

interface Props {
  activeId?: string;
}

const ConversationItem: React.FC<{
  convo: Conversation;
  isActive: boolean;
  onSelect: (c: Conversation) => void;
}> = ({ convo, isActive, onSelect }) => {
  const participant = convo.otherParticipant;
  const avatarUrl = participant.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.name)}&background=1a1a2e&color=fff&size=64`;
  const displayName = convo.project?.title ?? participant.name;

  return (
    <div
      onClick={() => onSelect(convo)}
      className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors border-b border-gray-50 ${
        isActive ? "bg-amber-50" : "hover:bg-gray-50"
      }`}
    >
      <div className="relative flex-shrink-0">
        {convo.type === "GROUP" ? (
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-orange-500 text-xs font-bold">G</span>
          </div>
        ) : (
          <img
            src={avatarUrl}
            alt={participant.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        )}
        {convo.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E2554F] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {convo.unreadCount > 9 ? "9+" : convo.unreadCount}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {displayName}
          </p>
          {convo.lastMessage && (
            <span className="text-[11px] text-gray-400 flex-shrink-0 ml-1">
              {formatDistanceToNow(new Date(convo.lastMessage.createdAt), {
                addSuffix: true,
              })}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400 truncate">
            {convo.topic?.name && (
              <span className="text-[10px] bg-gray-100 text-gray-500 rounded px-1 py-0.5 mr-1">
                {convo.topic.name}
              </span>
            )}
            {convo.lastMessage
              ? convo.lastMessage.contentType === "TEXT"
                ? convo.lastMessage.content
                : convo.lastMessage.contentType === "IMAGE"
                ? "📷 Image"
                : "📎 File"
              : "No messages yet"}
          </p>
        </div>

        {/* Show participant name as subtitle under project title */}
        {convo.project?.title && (
          <p className="text-[10px] text-gray-400 truncate mt-0.5">
            with {participant.name}
          </p>
        )}
      </div>
    </div>
  );
};

const ConversationList: React.FC<Props> = ({ activeId }) => {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { conversations, loading, error } = useConversations();

  const filtered = conversations.filter((c) => {
    const title = c.project?.title ?? c.otherParticipant.name;
    return title.toLowerCase().includes(search.toLowerCase());
  });

  const handleSelect = (convo: Conversation) => {
    router.push(`/creative/messages/${convo.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-[#E2554F]" size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-xs text-red-400 text-center mt-10 px-4">{error}</p>
    );
  }

  return (
    <div className="w-full flex flex-col overflow-hidden">
      <div className="p-3 border-b border-gray-100 flex-shrink-0">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search projects or people"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-xs text-gray-400 text-center mt-10">
            No conversations yet.
          </p>
        ) : (
          filtered.map((convo) => (
            <ConversationItem
              key={convo.id}
              convo={convo}
              isActive={convo.id === activeId}
              onSelect={handleSelect}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;