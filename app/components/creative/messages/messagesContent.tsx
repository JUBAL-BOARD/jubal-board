"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ConversationList from "./conversationList";
import ChatWindow from "./chatWindow";
import { Conversation } from "@/app/lib/api/messageApi";
import { useConversations } from "@/app/lib/hooks/useConversations";

interface Props {
  showChat: boolean;
  onSelectConversation: () => void;
  onBack: () => void;
  currentUserId: string;
}

const MessagesContent: React.FC<Props> = ({
  showChat,
  onSelectConversation,
  onBack,
  currentUserId,
}) => {
  const router = useRouter();
  const { conversations } = useConversations();
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  const handleSelect = (id: string) => {
    setActiveId(id);
    onSelectConversation();
  };

  return (
    <div className="flex flex-1 h-screen overflow-hidden bg-[#fafafa] p-6">
      {/* Conversation list */}
      <div
        className={`${
          showChat ? "hidden" : "flex"
        } lg:flex w-full lg:w-[280px] flex-shrink-0 flex-col border-r border-gray-200`}
      >
        <ConversationList
          activeId={activeId ?? undefined}
        />
      </div>

      {/* Chat window */}
      <div
        className={`${
          showChat ? "flex" : "hidden"
        } lg:flex flex-1 flex-col overflow-hidden`}
      >
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            currentUserId={currentUserId}
            onBack={onBack}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
            Select a conversation to start chatting.
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesContent;