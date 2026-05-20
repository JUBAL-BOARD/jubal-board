"use client";
import Sidebar from "@/app/components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/client/dashboard/dashboardTopbar";
import MyProfileContent from "@/app/components/client/explore-skills/creative-profile/myProfileContent";
import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

type ClientProfile = {
  name: string;
  clientProfile: {
    fullName: string;
    imageUrl: string | null;
  };
};

const MyProfilePage: React.FC = () => {
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
    <div className="flex flex-col min-h-screen bg-white">

       <DashboardTopbar
        userName={userName}
        userAvatar={userAvatar}
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex flex-1 relative">

        {/* Dark overlay — mobile only, shows when sidebar is open */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — slides in on mobile, always visible on desktop */}
        <div
          className={`
            fixed top-0 left-0 h-full z-40
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-10
          `}
        >
          {/* Close button inside sidebar on mobile */}
          <button
            className="absolute top-4 right-4 z-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={22} />
          </button>

          <Sidebar activeItem="Hire A Pro" />
        </div>

        {/* Main content — full width, no margin offset needed */}
        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <MyProfileContent />
        </main>
      </div>
    </div>
  );
};

export default MyProfilePage;