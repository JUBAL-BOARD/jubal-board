"use client";
import { useState } from "react";
import ConversationList from "./conversationList";
import ChatWindow from "./chatWindow";
import { conversations } from "@/app/data/messagesData";

interface Props {
  showChat: boolean;
  onSelectConversation: () => void;
  onBack: () => void;
}

const MessagesContent: React.FC<Props> = ({ showChat, onSelectConversation, onBack }) => {
  const [activeId, setActiveId] = useState<string>(conversations[0].id);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? conversations[0];

  const handleSelect = (id: string) => {
    setActiveId(id);
    onSelectConversation();
  };

  return (
    <div className="flex flex-1 h-full overflow-hidden bg-[#fafafa] p-6">

      {/* Conversation list — full screen on mobile when no chat open */}
      <div className={`${showChat ? "hidden" : "flex"} lg:flex w-full lg:w-[280px] flex-shrink-0 flex-col border-r border-gray-200`}>
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelect}
        />
      </div>

      {/* Chat window — full screen on mobile when chat open */}
      <div className={`${showChat ? "flex" : "hidden"} lg:flex flex-1 flex-col overflow-hidden`}>
        <ChatWindow
          conversation={activeConversation}
          onBack={onBack}
        />
      </div>

    </div>
  );
};

export default MessagesContent;