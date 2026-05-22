// app/client/messages/[conversationId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMessageStore } from "../../../lib/stores/messageStore";
import { Loader2, X } from "lucide-react";
import ClientChatWindow from "../../../components/client/messages/chatWindow";
import ClientConversationList from "../../../components/client/messages/conversationList";
import Sidebar from "@/app/components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/creative/dashboard/dashboardTopbar";

type ClientProfile = {
  name: string;
  clientProfile: {
    fullName: string;
    imageUrl: string | null;
  };
};

export default function ClientConversationPage() {
  const { conversationId } = useParams();
  const router = useRouter();
  const { conversations, setActiveConversation } = useMessageStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        const { token } = await tokenRes.json();
        const res = await fetch("/api/v1/clients/me", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        const json = await res.json();
        setProfile(json.data);
      } catch {
        // fail silently
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (conversationId) {
      setActiveConversation(conversationId as string);
    }
  }, [conversationId]);

  const conversation = conversations.find((c) => c.id === conversationId);
  if (!conversation) return null;

  const userName = profile?.clientProfile?.fullName || profile?.name || "Client";
  const userAvatar =
    profile?.clientProfile?.imageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

  if (profileLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#E2554F]" size={40} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">

      {/* Topbar */}
      <div className="flex-shrink-0">
        <DashboardTopbar
          userName={userName}
          userAvatar={userAvatar}
          sidebarOpen={sidebarOpen}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
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

        {/* Messages layout */}
        <div className="flex flex-1 overflow-hidden mt-[100px] min-h-0">

          {/* Conversation list */}
          <div className="hidden lg:flex w-72 xl:w-80 border-r border-gray-200 flex-col flex-shrink-0 overflow-hidden">
            <div className="px-4 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900">Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <ClientConversationList />
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            <ClientChatWindow
              conversation={conversation}
              onBack={() => router.push("/client/messages")}
            />
          </div>

        </div>
      </div>
    </div>
  );
}