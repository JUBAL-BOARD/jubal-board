"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import Sidebar from "@/app/components/creative/dashboard/sideBar";
import DashboardTopbar from "@/app/components/creative/dashboard/dashboardTopbar";
import ConversationList from "@/app/components/creative/messages/conversationList";
import ChatWindow from "@/app/components/creative/messages/chatWindow";
import { useCreativeProfile } from "@/app/lib/hooks/useCreativeProfile";
import { useConversations } from "@/app/lib/hooks/useConversations";

export default function ConversationPage() {
  const { conversationId } = useParams();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { profile, loading: profileLoading } = useCreativeProfile();
  const { conversations, loading: convsLoading } = useConversations();

  if (profileLoading || convsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 size={48} className="animate-spin text-gray-500" />
      </div>
    );
  }

  const userName = profile?.fullName || "Creative";
  const userAvatar =
    profile?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

  const currentUserId = profile?.id || "";

  const conversation = conversations.find((c) => c.id === conversationId);

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400 text-sm">Conversation not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <div className="flex-shrink-0">
        <DashboardTopbar
          userName={userName}
          userAvatar={userAvatar}
          sidebarOpen={sidebarOpen}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div
          className={`
            fixed top-0 left-0 h-full z-40
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:sticky lg:top-0 lg:h-full lg:z-10
          `}
        >
          <button
            className="absolute top-4 right-4 z-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={22} />
          </button>
          <Sidebar activeItem="Messages" />
        </div>

        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Conversation list — desktop only */}
          <div className="hidden lg:flex w-72 xl:w-80 border-r border-gray-200 flex-col flex-shrink-0 overflow-hidden">
            <div className="px-4 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-lg font-heading font-bold text-gray-900">
                Messages
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <ConversationList activeId={conversationId as string} />
            </div>
          </div>

          {/* Chat window */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            <ChatWindow
              conversation={conversation}
              currentUserId={currentUserId}
              onBack={() => router.push("/creative/messages")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}