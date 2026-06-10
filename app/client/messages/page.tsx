"use client";
import { useEffect, useState } from "react";
import { Loader2, MessageCircle, X } from "lucide-react";
import Sidebar from "@/app/components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/client/dashboard/dashboardTopbar";
import ClientConversationList from "@/app/components/client/messages/conversationList";

type ClientProfile = {
  id: string;
  name: string;
  clientProfile: {
    fullName: string;
    imageUrl: string | null;
  };
};

const ClientMessagesPage: React.FC = () => {
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
      <div className="flex-shrink-0">
        <DashboardTopbar
          userName={userName}
          userAvatar={userAvatar}
          sidebarOpen={sidebarOpen}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0 relative">

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

          {/* Conversation list */}
          <div className="w-full lg:w-72 xl:w-80 border-r border-gray-200 flex flex-col overflow-hidden">
            <div className="px-4 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-lg font-heading font-bold text-gray-900">Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <ClientConversationList />
            </div>
          </div>

          {/* Empty state — desktop only */}
          <div className="hidden lg:flex flex-1 flex-col items-center justify-center text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <MessageCircle size={28} className="text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-800">
              Select a conversation
            </p>
            <p className="text-xs text-gray-400 max-w-[200px]">
              Choose from your existing conversations or start a new one by clicking Chat Creative on any gig.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ClientMessagesPage;