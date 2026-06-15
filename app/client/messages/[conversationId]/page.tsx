"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { useConversations } from "@/app/lib/hooks/useConversations";
import ClientChatWindow from "@/app/components/client/messages/chatWindow";
import ClientConversationList from "@/app/components/client/messages/conversationList";
import Sidebar from "@/app/components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/client/dashboard/dashboardTopbar";

type ClientProfile = {
  id: string;
  name: string;
  clientProfile: {
    fullName: string;
    imageUrl: string | null;
  };
};

export default function ClientConversationPage() {
  const { conversationId } = useParams();
  const router = useRouter();
  const { conversations, loading: convsLoading } = useConversations();
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

  const conversation = conversations.find((c) => c.id === conversationId);
  const currentUserId = profile?.id ?? "";

  console.log("All conversation IDs:", conversations.map(c => c.id));
  console.log("Looking for:", conversationId);

  const userName = profile?.clientProfile?.fullName || profile?.name || "Client";
  const userAvatar =
    profile?.clientProfile?.imageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

  if (profileLoading || convsLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#E2554F]" size={40} />
      </div>
    );
  }

  if (!conversation) {
  if (convsLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#E2554F]" size={40} />
      </div>
    );
  }
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-white">
      <p className="text-sm text-gray-400">Conversation not found.</p>
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

        {/* Messages layout */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* Conversation list — hidden on mobile */}
          <div className="hidden lg:flex w-72 xl:w-80 border-r border-gray-200 flex-col flex-shrink-0 overflow-hidden">
            <div className="px-4 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-lg font-heading font-bold text-gray-900">Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <ClientConversationList activeId={conversationId as string} />
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            <ClientChatWindow
              conversation={conversation}
              currentUserId={currentUserId}
              onBack={() => router.push("/client/messages")}
            />
          </div>

        </div>
      </div>
    </div>
  );
}