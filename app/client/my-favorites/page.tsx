"use client";
import { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/client/dashboard/dashboardTopbar";
import Breadcrumb from "../../components/client/my-desk/breadcrumb";
import FavoriteCreativeCard from "../../components/client/my-favorites/favoriteCreativeCard";
import SendBriefForm from "../../components/client/my-favorites/sendBriefForm";
import { FavoriteCreative } from "../../data/favoritesData";
import { Search, X } from "lucide-react";
import usePageReady from "@/app/lib/hooks/usePageReady";
import WithPageTransition from "@/app/components/shared/withPageTransition";
import FadeInSection from "@/app/components/shared/fadeInSection";

type ClientProfile = {
  name: string;
  clientProfile: {
    fullName: string;
    imageUrl: string | null;
  };
};

const Favorites: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteCreative[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);

  const isReady = usePageReady(profileLoading, favoritesLoading);

  // fetch profile
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
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // fetch favorites
  const fetchFavorites = useCallback(async () => {
    setFavoritesLoading(true);
    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();

      if (!token) {
        console.error("No token found");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const favRes = await fetch("/api/v1/favorites", { headers });

      if (!favRes.ok) {
        console.error("Favorites fetch failed with status:", favRes.status);
        return;
      }

      const favJson = await favRes.json();

      const favList = Array.isArray(favJson.data) ? favJson.data : [];

      if (favList.length === 0) {
        setFavorites([]);
        return;
      }

      const mapped: FavoriteCreative[] = await Promise.all(
        favList.map(async (fav: any) => {
          let photo = null;

          try {
            const profileRes = await fetch(`/api/v1/creatives/${fav.creativeId}/public-profile`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const profileJson = await profileRes.json();
            photo = profileJson.data?.imageUrl || null;
          } catch (err) {
            console.error("Failed to fetch creative profile:", err);
          }

          return {
            id: fav.creativeId,
            name: fav.name ?? "Creative",
            role: fav.professionalRole ?? "Creative",
            avatar:
              photo ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(fav.name ?? "Creative")}&background=1a1a2e&color=fff&size=128`,
            rating: fav.overallRating ?? 0,
            rate: fav.services?.[0]
              ? `$${fav.services[0].priceFrom.toLocaleString()}`
              : "—",
            completedProjects: fav.completedProjects ?? 0,
            online: fav.isOnline ?? false,
            verified: fav.isPremium ?? false,
          };
        })
      );

      setFavorites(mapped);
      if (mapped.length > 0) setSelectedId(String(mapped[0].id));
    } catch (err) {
      console.error("Favorites fetch error:", err);
    } finally {
      setFavoritesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const filtered = favorites.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase())
  );

  const userName =
    profile?.clientProfile?.fullName || profile?.name || "Client";
  const userAvatar =
    profile?.clientProfile?.imageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      userName
    )}&background=1a1a2e&color=fff&size=128`;

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
          <Sidebar activeItem="Dashboard" />
        </div>

        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <WithPageTransition isReady={isReady} variant="profile">
            <>
              <FadeInSection delay={0}>
                <Breadcrumb
                  crumbs={[
                    { label: "Dashboard", path: "/client/dashboard" },
                    { label: "My Favorites" },
                  ]}
                />
                <h1 className="text-[26px] font-extrabold text-[#1a1a2e] m-0 mb-6">
                  My Favorites
                </h1>

                <div className="flex gap-6" style={{ height: "calc(100vh - 200px)" }}>
                  {/* Left — Creatives List */}
                  <div className="w-[320px] flex-shrink-0 bg-[#fafafa] px-2 py-4 flex flex-col gap-0">
                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 bg-white mb-3.5">
                      <Search size={15} stroke="#9CA3AF" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search creative or services"
                        className="border-none outline-none text-[13px] flex-1 text-black bg-transparent placeholder:text-gray-400"
                      />
                    </div>

                    <div className="overflow-y-auto flex-1">
                      {filtered.length === 0 ? (
                        <p className="text-center text-sm text-black py-10">
                          No favorites yet.
                        </p>
                      ) : (
                        filtered.map((creative) => (
                          <FavoriteCreativeCard
                            key={creative.id}
                            creative={creative}
                            isSelected={selectedId === String(creative.id)}
                            onSelect={(id) => setSelectedId(String(id))}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right — Send Brief Form */}
                  <div className="flex-1 bg-[#fafafa] border border-gray-200 rounded-[10px] p-6 overflow-y-auto flex flex-col">
                    <SendBriefForm />
                  </div>
                </div>
              </FadeInSection>
            </>
          </WithPageTransition>
        </main>
      </div>
    </div>
  );
};

export default Favorites;