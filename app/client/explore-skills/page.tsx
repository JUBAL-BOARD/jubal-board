"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/client/dashboard/dashboardTopbar";
import ExploreSearchBar from "../../components/client/explore-skills/exploreSearchBar";
import SkillCategoryAccordion from "../../components/client/explore-skills/skillCategoryAccordion";
import { X, Loader2 } from "lucide-react";
import { useCategories } from "@/app/lib/hooks/useCategories";

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

const ExploreSkills: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["Graphics Designer"]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        if (!tokenRes.ok) return;
        const { token } = await tokenRes.json();
        if (!token) return;

        const res = await fetch("/api/v1/clients/me", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (!res.ok) return;

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

  const userName = profile?.clientProfile?.fullName || profile?.name || "Client";
  const userAvatar =
    profile?.clientProfile?.imageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

  if (profileLoading || categoriesLoading) {
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
          <Sidebar activeItem="Hire A Pro" />
        </div>

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
    </div>
  );
};

export default ExploreSkills;