"use client";

import { useState } from "react";
import Sidebar from "../../components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/client/dashboard/dashboardTopbar";
import Breadcrumb from "../../components/client/my-desk/breadcrumb";
import FavoriteCreativeCard from "../../components/client/my-favorites/favoriteCreativeCard";
import SendBriefForm from "../../components/client/my-favorites/sendBriefForm";
import { favoriteCreatives } from "../../data/favoritesData";
import { Search, X } from "lucide-react";

const Favorites: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [selectedId, setSelectedId] = useState<number>(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filtered = favoriteCreatives.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.role.toLowerCase().includes(search.toLowerCase())
  );

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

          <Breadcrumb crumbs={[
            { label: "Dashboard", path: "/client/dashboard" },
            { label: "My Favorites" },
          ]} />

          <h1 className="text-[26px] font-extrabold text-[#1a1a2e] m-0 mb-6">
            My Favorites
          </h1>

          {/* Two Panel Layout */}
          <div className="flex gap-6" style={{ height: "calc(100vh - 200px)" }}>

            {/* Left — Creatives List */}
            <div className="w-[320px] flex-shrink-0 bg-[#fafafa] px-2 py-4 flex flex-col gap-0">

              {/* Search */}
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 bg-white mb-3.5">
                <Search size={15} stroke="#9CA3AF" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search creative or services"
                  className="border-none outline-none text-[13px] flex-1 text-black bg-transparent placeholder:text-gray-400"
                />
              </div>

              {/* List */}
              <div className="overflow-y-auto flex-1">
                {filtered.map((creative) => (
                  <FavoriteCreativeCard
                    key={creative.id}
                    creative={creative}
                    isSelected={selectedId === creative.id}
                    onSelect={setSelectedId}
                  />
                ))}
              </div>
            </div>

            {/* Right — Send Brief Form */}
            <div className="flex-1 bg-[#fafafa] border border-gray-200 rounded-[10px] p-6 overflow-y-auto flex flex-col">
              <SendBriefForm />
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Favorites;