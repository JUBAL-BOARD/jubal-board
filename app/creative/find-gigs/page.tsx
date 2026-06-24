"use client";
import { useState } from "react";
import Sidebar from "@/app/components/creative/dashboard/sideBar";
import DashboardTopbar from "@/app/components/creative/dashboard/dashboardTopbar";
import ExploreSearchBar from "../../components/creative/find-gigs/exploreSearchBar";
import SkillCategoryAccordion from "../../components/creative/find-gigs/skillCategoryAccordion";
import { useCategories } from "@/app/lib/hooks/useCategories";
import { useCreativeProfile } from "@/app/lib/hooks/useCreativeProfile";
import { X } from "lucide-react";
import usePageReady from "@/app/lib/hooks/usePageReady";
import WithPageTransition from "@/app/components/shared/withPageTransition";
import FadeInSection from "@/app/components/shared/fadeInSection";

const ExploreSkills: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["Graphics Designer"]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { profile, loading: profileLoading, error } = useCreativeProfile();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();

  const isReady = usePageReady(profileLoading, categoriesLoading);

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
          <Sidebar activeItem="Find Gigs" />
        </div>

        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <WithPageTransition isReady={isReady} variant="gigs">
            <>
              {categoriesError && (
                <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">
                  {categoriesError}
                </div>
              )}

              <FadeInSection delay={0}>
                <h1 className="text-[30px] font-heading font-extrabold text-[#1a1a2e] m-0 mb-6">
                  Find Gigs by Categories
                </h1>
              </FadeInSection>

              <FadeInSection delay={80}>
                <ExploreSearchBar value={search} onChange={setSearch} />
              </FadeInSection>

              <FadeInSection delay={160}>
                <div className="bg-[#fafafa] p-10">
                  {filtered.map((category, i) => (
                    <SkillCategoryAccordion
                      key={category.id}
                      category={{
                        ...category,
                        skills: category.services.flatMap((s) =>
                          s.skills.map((sk) => sk.name)
                        ),
                      }}
                      selectedSkills={selectedSkills}
                      onToggleSkill={handleToggleSkill}
                      defaultOpen={i < 3}
                    />
                  ))}
                </div>
              </FadeInSection>
            </>
          </WithPageTransition>
        </main>
      </div>
    </div>
  );
};

export default ExploreSkills;