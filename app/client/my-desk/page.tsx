"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/client/dashboard/dashboardTopbar";
import Breadcrumb from "../../components/client/my-desk/breadcrumb";
import ProjectFilterTabs from "../../components/client/my-desk/projectFilterTabs";
import ProjectCard from "../../components/client/my-desk/projectCard";
import Pagination from "../../components/client/my-desk/pagination";
import { Search, ListFilter, ChevronDown, X, Loader2 } from "lucide-react";
import { useClientProjects } from "../../lib/hooks/useClientProjects";

type FilterTab = "All Projects" | "Active Projects" | "Recent Projects" | "Completed Projects" | "Revised Projects";

const tabStatusMap: Partial<Record<FilterTab, string>> = {
  "Active Projects": "PENDING_PAYMENT",
  "Completed Projects": "COMPLETED",
  "Revised Projects": "REVISION",
};

type ClientProfile = {
  name: string;
  clientProfile: {
    fullName: string;
    imageUrl: string | null;
  };
};

const MyDesk: React.FC = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("All Projects");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const { projects, loading, error } = useClientProjects(tabStatusMap[activeTab]);

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

  const filtered = projects.filter((project) =>
    project.title.toLowerCase().includes(search.toLowerCase()) ||
    project.assignee.name.toLowerCase().includes(search.toLowerCase())
  );

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
          <Sidebar activeItem="My Desk" />
        </div>

        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <Breadcrumb crumbs={[
            { label: "Dashboard", path: "/client/dashboard" },
            { label: "My Desk" },
          ]} />

          <h1 className="text-[26px] font-extrabold text-[#1a1a2e] m-0 mb-5">My Desk</h1>

          {/* Search + Filter */}
          <div className="flex gap-3 mb-5">
            <div className="flex-1 flex items-center gap-2.5 border-[1.5px] border-gray-200 rounded-lg px-3.5 py-2.5 bg-white">
              <Search size={18} stroke="black" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by projects or creatives"
                className="border-none outline-none flex-1 text-[13px] bg-transparent text-black placeholder:text-gray-400"
              />
            </div>
            <button className="flex items-center gap-2 bg-transparent border-none rounded-lg px-[18px] py-2.5 cursor-pointer text-[#e2554f] font-semibold text-[13px] hover:bg-gray-50 transition-colors">
              <ListFilter size={16} stroke="#E2554F" />
              Filter By
              <ChevronDown size={12} stroke="#E2554F" />
            </button>
          </div>

          {/* Tabs */}
          <ProjectFilterTabs
            active={activeTab}
            onChange={(tab) => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
          />

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#E2554F]" size={36} />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 text-center py-10">{error}</p>
          )}

          {!loading && !error && filtered.length === 0 && (
            <p className="text-gray-500 text-[14px] text-center mt-10">No projects found.</p>
          )}

          {!loading && !error && filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}

          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filtered.length / perPage)}
            perPage={perPage}
            onPageChange={setCurrentPage}
            onPerPageChange={setPerPage}
          />
        </main>
      </div>
    </div>
  );
};

export default MyDesk;