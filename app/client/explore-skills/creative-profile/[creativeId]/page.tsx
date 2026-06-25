"use client";
import Sidebar from "@/app/components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/client/dashboard/dashboardTopbar";
import MyProfileContent from "@/app/components/client/explore-skills/creative-profile/myProfileContent";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import usePageReady from "@/app/lib/hooks/usePageReady";
import WithPageTransition from "@/app/components/shared/withPageTransition";
import FadeInSection from "@/app/components/shared/fadeInSection";

type ClientProfile = {
  name: string;
  clientProfile: {
    fullName: string;
    imageUrl: string | null;
  };
};

const CreativeProfilePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [creativeId, setCreativeId] = useState<string>("");

  const isReady = usePageReady(profileLoading);

  useEffect(() => {
    const segments = window.location.pathname.split("/");
    setCreativeId(segments[segments.length - 1]);

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

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <DashboardTopbar
        userName={userName}
        userAvatar={userAvatar}
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex flex-1 relative">
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
            lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-10
          `}
        >
          <button
            className="absolute top-4 right-4 z-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={22} />
          </button>
          <Sidebar activeItem="Hire A Pro" />
        </div>

        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <WithPageTransition isReady={isReady} variant="profile">
            <FadeInSection delay={0}>
              <MyProfileContent creativeId={creativeId} />
            </FadeInSection>
          </WithPageTransition>
        </main>
      </div>
    </div>
  );
};

export default CreativeProfilePage;