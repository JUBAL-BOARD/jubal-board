"use client";
import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import Sidebar from "@/app/components/creative/dashboard/sideBar";
import DashboardTopbar from "@/app/components/creative/dashboard/dashboardTopbar";
import UpdateBanner from "@/app/components/creative/dashboard/updateBanner";
import WelcomeBar from "@/app/components/creative/dashboard/welcomeBar";
import SearchBar from "@/app/components/creative/dashboard/searchBar";
import FreshGigs from "@/app/components/creative/dashboard/freshGigs";
import TodoList from "@/app/components/creative/dashboard/todoList";
import OngoingGigs from "@/app/components/creative/dashboard/ongoingGigs";
import YourPitches from "@/app/components/creative/dashboard/yourPitches";
import LearningHub from "@/app/components/creative/dashboard/learningHub";
import QuickActions from "@/app/components/creative/dashboard/quickActions";
import { useCreativeProfile } from "@/app/lib/hooks/useCreativeProfile";
import { useMyPitches } from "@/app/lib/hooks/useMyPitches";
import { freshGigs, todoItems, ongoingGigs, creativePitches, courses } from "../../data";
import { useKycStatus } from "../../lib/hooks/useKycStatus";
import KycModal from "../../components/verification/kycModal";

const CreativeDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, loading: profileLoading, error } = useCreativeProfile();
  const { pitches } = useMyPitches();
  const { kycStatus, loading: kycLoading } = useKycStatus();
  const [showKycModal, setShowKycModal] = useState(false);

  useEffect(() => {
  if (!kycLoading && kycStatus !== null && kycStatus !== "PROVIDER_APPROVED") {
    setShowKycModal(true);
  }
}, [kycStatus, kycLoading]);
console.log("kycStatus:", kycStatus, "kycLoading:", kycLoading);

  if (profileLoading || kycLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#E2554F]" size={40} />
      </div>
    );
  }

  const userName = profile?.fullName || "Creative";
  const userAvatar =
    profile?.avatar ||
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
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              Note: Could not sync latest profile data.
            </div>
          )}
          <UpdateBanner />
          <WelcomeBar userName={userName} />
          <SearchBar />
          <QuickActions />
          <FreshGigs />
          <TodoList />
          <OngoingGigs />
          <YourPitches />
          <LearningHub />
        </main>
      </div>
    </div>
  );
};

export default CreativeDashboard;