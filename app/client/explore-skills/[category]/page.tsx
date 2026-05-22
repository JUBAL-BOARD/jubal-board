"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/app/components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/client/dashboard/dashboardTopbar";
import { Search, SlidersHorizontal, ChevronDown, BadgeCheck, X, Loader2 } from "lucide-react";
import Breadcrumb from "@/app/components/client/my-desk/breadcrumb";
import Image from "next/image";
import Link from "next/link";

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

interface Service {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
}

interface SuggestedCreative {
  id: string;
  name: string;
  professionalRole: string;
  photo: string | null;
  imageUrl: string | null;
  overallRating: number;
  isPremium: boolean;
  isVerified: boolean;
}

interface CategoryCreatives {
  recommended: SuggestedCreative[];
  topRated: SuggestedCreative[];
  verified: SuggestedCreative[];
}

const filterChips = ["All", "Recent", "$100-$200", "Graphic Designers", "Logo Design", "Posters", "Brand Identity", "Packaging"];

interface CreativeCardProps {
  id: string;
  name: string;
  role: string;
  rating: number;
  avatar: string;
  verified?: boolean;
  premium?: boolean;
}

const CreativeCard: React.FC<CreativeCardProps> = ({ id, name, role, rating, avatar, verified, premium }) => (
  <div className="bg-white border border-gray-100 rounded-xl overflow-hidden flex-shrink-0 w-[200px] lg:w-[220px]">
    <div className="relative h-32 bg-gray-100">
      <img src={avatar} alt={name} className="w-full h-full object-cover" />
      {premium && (
        <span className="absolute top-2 right-2 bg-orange-400 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
          Premium
        </span>
      )}
    </div>
    <div className="p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover border-2 border-white" />
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full border border-white" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-xs font-semibold text-gray-900 leading-tight">{name}</p>
              {verified && <BadgeCheck fill="blue" stroke="white" size={11} />}
            </div>
            <p className="text-[10px] text-gray-500">{role}</p>
          </div>
        </div>
        <button className="w-7 h-7 rounded-full bg-[#1c1c3a] flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 20 20" fill="white" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <div className="w-[50%] mx-auto flex items-center gap-1 mb-2">
        <svg viewBox="0 0 20 20" fill="#F5A623" className="w-3 h-3">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span className="text-xs font-semibold text-gray-800">{rating.toFixed(1)}</span>
      </div>
      <div className="text-center">
        <Link href={`/client/explore-skills/creative-profile`}>
          <span className="text-xs text-red-500 font-semibold hover:underline cursor-pointer">
            View Profile
          </span>
        </Link>
      </div>
    </div>
  </div>
);

const CategoryGigsPage: React.FC = () => {
  const params = useParams();
  const categoryName = decodeURIComponent(params.category as string);

  const [activeChip, setActiveChip] = useState("All");
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [categoryCreatives, setCategoryCreatives] = useState<CategoryCreatives>({
    recommended: [],
    topRated: [],
    verified: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        const { token } = await tokenRes.json();
        const headers = { Authorization: `Bearer ${token}` };

        const [profileRes, categoriesRes, suggestedRes] = await Promise.all([
          fetch("/api/v1/clients/me", { headers, credentials: "include" }),
          fetch("/api/v1/categories", { headers, credentials: "include" }),
          fetch("/api/v1/creatives/suggested", { headers, credentials: "include" }),
        ]);

        // Profile
        if (profileRes.ok) {
          const profileJson = await profileRes.json();
          setProfile(profileJson.data);
        }

        // Build imageUrl lookup map from suggested endpoint
        const imageMap: Record<string, string> = {};
        if (suggestedRes.ok) {
          const suggestedJson = await suggestedRes.json();
          (Array.isArray(suggestedJson.data) ? suggestedJson.data : []).forEach((c: any) => {
            if (c.id && c.imageUrl) imageMap[c.id] = c.imageUrl;
          });
        }

        // Categories
        if (categoriesRes.ok) {
          const categoriesJson = await categoriesRes.json();
          const allCategories = Array.isArray(categoriesJson.data)
            ? categoriesJson.data
            : categoriesJson.data ?? [];

          const matched = allCategories.find(
            (c: any) => c.name.toLowerCase() === categoryName.toLowerCase()
          );

          if (matched) {
            const [detailRes, recommendedRes, topRatedRes, verifiedRes] = await Promise.all([
              fetch(`/api/v1/categories/${matched.id}`, { headers, credentials: "include" }),
              fetch(`/api/v1/creatives?categoryId=${matched.id}&recommended=true&sort=recommended`, { headers, credentials: "include" }),
              fetch(`/api/v1/creatives?categoryId=${matched.id}&sort=rating`, { headers, credentials: "include" }),
              fetch(`/api/v1/creatives?categoryId=${matched.id}&verified=true`, { headers, credentials: "include" }),
            ]);

            if (detailRes.ok) {
  const detailJson = await detailRes.json();
  const detail = detailJson.data ?? detailJson;
  console.log("Category detail:", JSON.stringify(detail, null, 2)); // 👈
  setServices(Array.isArray(detail.services) ? detail.services : []);
}

            const parseCreatives = async (res: Response): Promise<SuggestedCreative[]> => {
              if (!res.ok) return [];
              const json = await res.json();
              return (Array.isArray(json.data) ? json.data : []).map((c: any) => ({
                ...c,
                imageUrl: imageMap[c.id] ?? c.photo ?? null,
              }));
            };

            const [recommended, topRated, verified] = await Promise.all([
              parseCreatives(recommendedRes),
              parseCreatives(topRatedRes),
              parseCreatives(verifiedRes),
            ]);

            setCategoryCreatives({ recommended, topRated, verified });
          }
        }
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [categoryName]);

  const userName = profile?.clientProfile?.fullName || profile?.name || "Client";
  const userAvatar =
    profile?.clientProfile?.imageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

  const creativeGroups = [
    { label: "Suggested", creatives: categoryCreatives.recommended },
    { label: "Top Rated", creatives: categoryCreatives.topRated },
    { label: "Verified", creatives: categoryCreatives.verified },
  ];

  const filterCreatives = (creatives: SuggestedCreative[]) =>
    creatives.filter(
      (c) =>
        search === "" ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.professionalRole.toLowerCase().includes(search.toLowerCase())
    );

  if (loading) {
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
          <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <div
          className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-10`}
        >
          <button className="absolute top-4 right-4 z-50 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={22} />
          </button>
          <Sidebar activeItem="Hire A Pro" />
        </div>

        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <Breadcrumb
            crumbs={[
              { label: "Dashboard", path: "/client/dashboard" },
              { label: "Hire A Pro", path: "/client/explore-skills" },
              { label: categoryName },
            ]}
          />

          <h1 className="text-2xl font-bold text-gray-900 mb-5">Hire A Pro</h1>

          {/* Search + Filter */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors">
              <SlidersHorizontal size={15} className="text-red-400" />
              Filter By
              <ChevronDown size={14} />
            </button>
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-2 mb-7 flex-wrap">
            {filterChips.map((chip) => (
              <button
                key={chip}
                onClick={() => setActiveChip(chip)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeChip === chip
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Services */}
          <div className="mb-8 bg-[#fafafa] p-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Services ({services.length})
            </h2>
            {services.length === 0 ? (
              <p className="text-sm text-gray-400">No services found for this category.</p>
            ) : (
              <div className="flex gap-3.5 overflow-x-auto pb-1 scroll-smooth">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="relative rounded-lg overflow-hidden h-[300px] flex-shrink-0 cursor-pointer group"
                  >
                    <Image
                      src={service.imageUrl || "/placeholder.png"}
                      alt={service.name}
                      width={300}
                      height={300}
                      className="w-[300px] h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute bottom-0 left-0 right-0 h-[20%] flex items-center justify-center px-3 bg-[#1c1c3a]">
                      <p className="text-white font-semibold text-sm">{service.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Creative groups */}
          {creativeGroups.map((group) => (
            <div key={group.label} className="bg-[#fafafa] p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{group.label}</h2>
              {filterCreatives(group.creatives).length === 0 ? (
                <p className="text-sm text-gray-400">No creatives found.</p>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2 scroll-smooth">
                  {filterCreatives(group.creatives).map((c) => (
                    <CreativeCard
                      key={c.id}
                      id={c.id}
                      name={c.name}
                      role={c.professionalRole}
                      rating={c.overallRating}
                      avatar={
                        c.imageUrl ??
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=1a1a2e&color=fff&size=128`
                      }
                      verified={c.isVerified}
                      premium={c.isPremium}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </main>
      </div>
    </div>
  );
};

export default CategoryGigsPage;