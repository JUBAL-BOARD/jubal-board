"use client";

import { useState } from "react";
import Sidebar from "../../components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/client/dashboard/dashboardTopbar";
import Breadcrumb from "../../components/client/my-desk/breadcrumb";
import ProjectFilterTabs from "../../components/client/my-desk/projectFilterTabs";
import ProjectCard from "../../components/client/my-desk/projectCard";
import Pagination from "../../components/client/my-desk/pagination";
import { Search, ListFilter, ChevronDown, X } from "lucide-react";
import { deskProjects } from "../../data/myDeskData";
import type { ProjectStatus } from "../../data/myDeskData";

type FilterTab = "All Projects" | "Active Projects" | "Recent Projects" | "Completed Projects" | "Revised Projects";

const tabStatusMap: Partial<Record<FilterTab, ProjectStatus>> = {
  "Active Projects":    "In Progress",
  "Completed Projects": "Completed",
  "Revised Projects":   "Revision",
};

const MyDesk: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [activeTab, setActiveTab] = useState<FilterTab>("All Projects");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filtered = deskProjects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.assignee.toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      activeTab === "All Projects" || p.status === tabStatusMap[activeTab];
    return matchesSearch && matchesTab;
  });

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

          <Sidebar activeItem="My Desk" />
        </div>

        {/* Main content — full width, no margin offset needed */}
        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">

          <Breadcrumb crumbs={[
            { label: "Dashboard", path: "/client/dashboard" },
            { label: "My Desk" },
          ]} />

          <h1 className="text-[26px] font-extrabold text-[#1a1a2e] m-0 mb-5">
            My Desk
          </h1>

          {/* Search + Filter */}
          <div className="flex gap-3 mb-5">
            <div className="flex-1 flex items-center gap-2.5 border-[1.5px] border-gray-200 rounded-lg px-3.5 py-2.5 bg-white">
              <Search size={18} stroke="black" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by projects, creatives or services"
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

          {/* Project List */}
          {filtered.length === 0 ? (
            <p className="text-gray-500 text-[14px] text-center mt-10">
              No projects found.
            </p>
          ) : (
            filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={25}
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