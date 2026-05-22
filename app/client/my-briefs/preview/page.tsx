"use client";

import { Suspense, useEffect } from "react";
import Sidebar from "../../../components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/client/dashboard/dashboardTopbar";
import BriefPreviewContent from "@/app/components/client/my-briefs/briefPreviewContent";
import { useState } from "react";
import { Loader2, X } from "lucide-react";

type ClientProfile = {
  name: string;
  email: string;
  clientProfile: {
    fullName: string;
    contactNumber: string;
    locationCity: string;
    country: string | null;
    state: string | null;
    streetAddress: string;
    postalCode: string;
    preferredCommunication: string;
    languagePreference: string;
    imageUrl: string | null;
  };
};

const BriefPreviewPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        if (!tokenRes.ok) return;
        const { token } = await tokenRes.json();
        if (!token) return;

        const res = await fetch("/api/v1/clients/me", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (!res.ok) return;

        const json = await res.json();
        setProfile(json.data);
      } catch {
        // fail silently — dashboard still loads without profile
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#2563EB] mb-4" size={48} />
        <p className="text-gray-500 font-medium">Loading Dashboard...</p>
      </div>
    );
  }

  const userName = profile?.clientProfile?.fullName || profile?.name || "Client";
  const userAvatar = profile?.clientProfile?.imageUrl ||
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
          <Sidebar activeItem="My Briefs" />
        </div>
        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto pb-28">
          <Suspense fallback={<div className="text-sm text-gray-400">Loading preview...</div>}>
            <BriefPreviewContent />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default BriefPreviewPage;