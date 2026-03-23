"use client";
import { useState } from "react";
import { X } from "lucide-react";
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
import { freshGigs, todoItems, ongoingGigs, creativePitches, courses } from "../../data";
import QuickActions from "@/app/components/creative/dashboard/quickActions";

const CreativeDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Topbar */}
      <DashboardTopbar
        userName="Natasha John"
        userAvatar="https://i.pravatar.cc/150?img=47"
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
          <WelcomeBar userName="Natasha John" />
          <SearchBar />
          <QuickActions />
          <FreshGigs gigs={freshGigs} />
          <TodoList todos={todoItems} />
          <OngoingGigs gigs={ongoingGigs} />
          <YourPitches pitches={creativePitches} />
          <LearningHub courses={courses} />
        </main>

      </div>
    </div>
  );
};

export default CreativeDashboard;