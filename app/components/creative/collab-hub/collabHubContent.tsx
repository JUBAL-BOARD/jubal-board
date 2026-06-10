"use client";
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, ChevronDown, Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import CollabCard from "./collabCard";
import GigsPagination from "@/app/components/creative/my-gigs/gigsPagination";

interface Creative {
  id: string;
  name: string;
  role: string;
  rating: number;
  avatar: string;
  portfolioImg: string;
  verified?: boolean;
  premium?: boolean;
}

const filterChips = ["All", "Design", "Development", "Video", "Writing", "Marketing", "Photography"];

const CollabHubContent: React.FC = () => {
  const router = useRouter();
  const [activeChip, setActiveChip] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(9);
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCreatives = async () => {
      setLoading(true);
      setError(null);
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        const { token } = await tokenRes.json();
        const res = await fetch("/api/v1/creatives/", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });

        console.log("Status:", res.status);
        const json = await res.json();
        console.log("Response:", json);

        if (!res.ok) throw new Error("Failed to fetch creatives");
        const list = Array.isArray(json.data) ? json.data : [];
        const mapped: Creative[] = list.map((c: any) => ({
          id: c.id,
          name: c.name ?? "Creative",
          role: c.professionalRole ?? "Creative",
          rating: c.overallRating ?? 0,
          avatar:
            c.imageUrl ??
            `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name ?? "C")}&background=1a1a2e&color=fff&size=128`,
          portfolioImg: c.portfolioImg ?? c.portfolioImageUrl ?? "/placeholder.png",
          verified: c.isVerified ?? false,
          premium: c.isPremium ?? false,
        }));
        setCreatives(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchCreatives();
  }, []);

  const filtered = creatives.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase());
    const matchesChip =
      activeChip === "All" || c.role.toLowerCase().includes(activeChip.toLowerCase());
    return matchesSearch && matchesChip;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <Breadcrumb
        crumbs={[
          { label: "Dashboard", path: "/creative/dashboard" },
          { label: "Collab Hub" },
        ]}
      />

      {/* Title row with Invitations button */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900 mb-1">Collaborate</h1>
          <p className="text-md text-black font-body">Invite to Collab on a Project</p>
        </div>
        <button
          onClick={() => router.push("/creative/collab-hub/invitations")}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a3e] hover:bg-[#2a2a5e] text-white text-sm font-semibold rounded-lg transition-colors shrink-0"
        >
          <Mail size={15} />
          Invitations
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {filterChips.map((chip) => (
          <button
            key={chip}
            onClick={() => { setActiveChip(chip); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-heading font-medium transition-colors ${
              activeChip === chip
                ? "bg-[#E2554F] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* States */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
          <Loader2 size={20} className="animate-spin text-[#E2554F]" />
          <span className="text-sm">Loading creatives...</span>
        </div>
      )}

      {error && !loading && (
        <p className="text-sm text-red-500 text-center py-10">{error}</p>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-10">No creatives found.</p>
      )}

      {/* Grid */}
      {!loading && !error && filtered.length > 0 && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((creative) => (
              <CollabCard key={creative.id} creative={creative} />
            ))}
          </div>

          <GigsPagination
            currentPage={page}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={(val) => { setPerPage(val); setPage(1); }}
          />
        </>
      )}
    </div>
  );
};

export default CollabHubContent;