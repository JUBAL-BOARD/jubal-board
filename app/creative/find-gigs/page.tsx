"use client";

import { useState } from "react";
import Sidebar from "@/app/components/creative/dashboard/sideBar";
import DashboardTopbar from "@/app/components/creative/dashboard/dashboardTopbar";
import ExploreSearchBar from "../../components/creative/find-gigs/exploreSearchBar";
import SkillCategoryAccordion from "../../components/creative/find-gigs/skillCategoryAccordion";
import { skillCategories } from "../../data/exploreSkillsData";
import { X } from "lucide-react";

const ExploreSkills: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["Graphics Designer"]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const filtered = skillCategories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      cat.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
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

          <Sidebar activeItem="Find Gigs" />
        </div>
        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">

          <h1 className="text-[30px] font-extrabold text-[#1a1a2e] m-0 mb-6">
            Explore Gigs by Categories
          </h1>

          <ExploreSearchBar value={search} onChange={setSearch} />

          <div className="bg-[#fafafa] p-10">
            {filtered.map((category, i) => (
              <SkillCategoryAccordion
                key={category.name}
                category={category}
                selectedSkills={selectedSkills}
                onToggleSkill={handleToggleSkill}
                defaultOpen={i < 3}
              />
            ))}
          </div>

        </main>
      </div>

    </div>
  );
};

export default ExploreSkills;