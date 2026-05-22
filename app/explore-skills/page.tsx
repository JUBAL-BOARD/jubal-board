"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/home/navbar";
import ExploreSearchBar from "../components/explore-skills/exploreSearchBar";
import SkillCategoryAccordion from "../components/explore-skills/skillCategoryAccordion";
import { X, Loader2 } from "lucide-react";
import { useCategories } from "@/app/lib/hooks/useCategories";

const ExploreSkills: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["Graphics Designer"]);
  const [profileLoading, setProfileLoading] = useState(true);
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();

  const handleToggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const filtered = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      cat.services.some(
        (service) =>
          service.name.toLowerCase().includes(search.toLowerCase()) ||
          service.skills.some((skill) =>
            skill.name.toLowerCase().includes(search.toLowerCase())
          )
      )
  );

  if ( categoriesLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#E2554F]" size={40} />
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <p className="text-red-500">{categoriesError}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar
      />

      {/* <div className="flex flex-1 relative">
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
        </div> */}

        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <h1 className="text-[30px] font-extrabold text-[#1a1a2e] m-0 mb-6">
            Hire A Pro by Categories
          </h1>

          <ExploreSearchBar value={search} onChange={setSearch} />

          <div className="bg-[#fafafa] p-10">
            {filtered.map((category, i) => (
              <SkillCategoryAccordion
                key={category.id}
                category={{
                  ...category,
                  skills: category.services.flatMap((s) => s.skills.map((sk) => sk.name)),
                }}
                selectedSkills={selectedSkills}
                onToggleSkill={handleToggleSkill}
                defaultOpen={i < 3}
              />
            ))}
          </div>
        </main>
      </div>
  );
};

export default ExploreSkills;