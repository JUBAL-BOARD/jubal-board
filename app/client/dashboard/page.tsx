"use client";

import Sidebar from "@/app/components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/client/dashboard/dashboardTopbar";
import UpdateBanner from "@/app/components/client/dashboard/updateBanner";
import WelcomeBar from "@/app/components/client/dashboard/welcomeBar";
import SearchBar from "@/app/components/client/dashboard/searchBar";
import QuickActions from "@/app/components/client/dashboard/quickActions";
import SuggestedCreatives from "@/app/components/client/dashboard/suggestedCreatives";
import ServicesCarousel from "@/app/components/client/dashboard/servicesCarousel";
import ActiveProjects from "@/app/components/client/dashboard/activeProjects";
import IncomingPitches from "@/app/components/client/dashboard/incomingPitches";
import { services } from "../../data";
import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useKycStatus } from "../../lib/hooks/useKycStatus";
import KycModal from "../../components/verification/kycModal";

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

const ClientDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableBalance, setAvailableBalance] = useState<string | null>(null);
  const { kycStatus, loading: kycLoading } = useKycStatus();
  const [showKycModal, setShowKycModal] = useState(false);

  useEffect(() => {
    console.log("kycLoading:", kycLoading, "kycStatus:", kycStatus);
    if (!kycLoading && kycStatus !== null && kycStatus === "UNVERIFIED") {
      setShowKycModal(true);
    }
  }, [kycStatus, kycLoading]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        if (!tokenRes.ok) return;
        const { token } = await tokenRes.json();
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };

        const [profileRes, walletRes] = await Promise.all([
          fetch("/api/v1/clients/me", { headers, credentials: "include" }),
          fetch("/api/v1/wallet", { headers, credentials: "include" }),
        ]);

        if (profileRes.ok) {
          const json = await profileRes.json();
          setProfile(json.data);
        }

        if (walletRes.ok) {
          const walletJson = await walletRes.json();
          const w = walletJson.data ?? walletJson;
          const balance = w.availableBalance ?? 0;
          setAvailableBalance(
            `₦${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
          );
        }
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading || kycLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#2563EB] mb-4" size={48} />
        <p className="text-gray-500 font-medium">Loading Dashboard...</p>
      </div>
    );
  }

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
        {showKycModal && (
          <KycModal
            status={kycStatus}
            onClose={() => setShowKycModal(false)}
          />
        )}

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
          <Sidebar activeItem="Dashboard" />
        </div>

        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <UpdateBanner />
          <WelcomeBar userName={userName} />
          <SearchBar />
          <QuickActions availableBalance={availableBalance} />
          <SuggestedCreatives />
          <ServicesCarousel />
          <div className="lg:flex gap-6">
            <ActiveProjects />
            <IncomingPitches />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientDashboard;