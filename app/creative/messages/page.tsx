"use client";
import { useState } from "react";
import { Loader2, X, MessageCircle } from "lucide-react";
import Sidebar from "@/app/components/creative/dashboard/sideBar";
import DashboardTopbar from "@/app/components/creative/dashboard/dashboardTopbar";
import ConversationList from "@/app/components/creative/messages/conversationList";
import { useCreativeProfile } from "@/app/lib/hooks/useCreativeProfile";

const MessagesPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, loading: profileLoading, error } = useCreativeProfile();

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 size={48} className="animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Error loading profile: {error}</p>
      </div>
    );
  }

  const userName = profile?.fullName || "Creative";
  const userAvatar =
    profile?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

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

      <div className="flex flex-1 overflow-hidden min-h-0 relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div
          className={`
            absolute top-0 left-0 h-full z-40
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:relative lg:translate-x-0 lg:h-full lg:z-10
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
          {/* Conversation list */}
          <div className="w-full lg:w-72 xl:w-80 border-r border-gray-200 flex flex-col overflow-hidden">
            <div className="px-4 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-lg font-heading font-bold text-gray-900">
                Messages
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <ConversationList />
            </div>
          </div>

          {/* Empty state — desktop only */}
          <div className="hidden lg:flex flex-1 flex-col items-center justify-center text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <MessageCircle size={28} className="text-black" />
            </div>
            <p className="text-sm font-semibold text-black">
              Select a conversation
            </p>
            <p className="text-xs text-black max-w-[200px]">
              Choose from your existing conversations or start a new one by
              clicking Chat Client on any gig.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;