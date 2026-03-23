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
import { suggestedCreatives, services, activeProjects, incomingPitches } from "../../data";
import { useState } from "react";
import { X } from "lucide-react";

const ClientDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex flex-col min-h-screen bg-white">

      <DashboardTopbar
        userName="Charles Eden"
        userAvatar="https://i.pravatar.cc/150?img=33"
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

          <Sidebar activeItem="Dashboard" />
        </div>

        {/* Main content — full width, no margin offset needed */}
        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <UpdateBanner />
          <WelcomeBar userName="Charles Eden" />
          <SearchBar />
          <QuickActions />
          <SuggestedCreatives creatives={suggestedCreatives} />
          <ServicesCarousel services={services} />
          <div className="lg:flex gap-6">
            <ActiveProjects projects={activeProjects} />
            <IncomingPitches pitches={incomingPitches} />
          </div>
        </main>
      </div>

    </div>
  );
};

export default ClientDashboard;