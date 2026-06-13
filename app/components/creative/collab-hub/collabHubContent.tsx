// "use client";
// import { useState, useEffect } from "react";
// import { Search, SlidersHorizontal, ChevronDown, Loader2, Mail } from "lucide-react";
// import { useRouter } from "next/navigation";
// import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
// import CollabCard from "./collabCard";
// import GigsPagination from "@/app/components/creative/my-gigs/gigsPagination";

// interface Creative {
//   id: string;
//   name: string;
//   role: string;
//   rating: number;
//   avatar: string;
//   portfolioImg: string;
//   verified?: boolean;
//   premium?: boolean;
// }

// const filterChips = ["All", "Design", "Development", "Video", "Writing", "Marketing", "Photography"];

// const CollabHubContent: React.FC = () => {
//   const router = useRouter();
//   const [activeChip, setActiveChip] = useState("All");
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);
//   const [perPage, setPerPage] = useState(9);
//   const [creatives, setCreatives] = useState<Creative[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchCreatives = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const tokenRes = await fetch("/api/auth/session/token");
//         const { token } = await tokenRes.json();
//         const res = await fetch("/api/v1/creatives/", {
//           headers: { Authorization: `Bearer ${token}` },
//           credentials: "include",
//         });

//         console.log("Status:", res.status);
//         const json = await res.json();
//         console.log("Response:", json);

//         if (!res.ok) throw new Error("Failed to fetch creatives");
//         const list = Array.isArray(json.data) ? json.data : [];
//         const mapped: Creative[] = list.map((c: any) => ({
//           id: c.id,
//           name: c.name ?? "Creative",
//           role: c.professionalRole ?? "Creative",
//           rating: c.overallRating ?? 0,
//           avatar:
//             c.imageUrl ??
//             `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name ?? "C")}&background=1a1a2e&color=fff&size=128`,
//           portfolioImg: c.portfolioImg ?? c.portfolioImageUrl ?? "/placeholder.png",
//           verified: c.isVerified ?? false,
//           premium: c.isPremium ?? false,
//         }));
//         setCreatives(mapped);
//       } catch (err) {
//         setError(err instanceof Error ? err.message : "Something went wrong");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchCreatives();
//   }, []);

//   const filtered = creatives.filter((c) => {
//     const matchesSearch =
//       c.name.toLowerCase().includes(search.toLowerCase()) ||
//       c.role.toLowerCase().includes(search.toLowerCase());
//     const matchesChip =
//       activeChip === "All" || c.role.toLowerCase().includes(activeChip.toLowerCase());
//     return matchesSearch && matchesChip;
//   });

//   const totalPages = Math.ceil(filtered.length / perPage);
//   const paginated = filtered.slice((page - 1) * perPage, page * perPage);

//   return (
//     <div>
//       <Breadcrumb
//         crumbs={[
//           { label: "Dashboard", path: "/creative/dashboard" },
//           { label: "Collab Hub" },
//         ]}
//       />

//       {/* Title row with Invitations button */}
//       <div className="flex items-start justify-between gap-4 mb-5">
//         <div>
//           <h1 className="text-2xl font-bold font-heading text-gray-900 mb-1">Collaborate</h1>
//           <p className="text-md text-black font-body">Invite to Collab on a Project</p>
//         </div>
//         <button
//           onClick={() => router.push("/creative/collab-hub/invitations")}
//           className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a3e] hover:bg-[#2a2a5e] text-white text-sm font-semibold rounded-lg transition-colors shrink-0"
//         >
//           <Mail size={15} />
//           Invitations
//         </button>
//       </div>

//       {/* Search + Filter */}
//       <div className="flex items-center gap-3 mb-4">
//         <div className="flex-1 relative">
//           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search"
//             value={search}
//             onChange={(e) => { setSearch(e.target.value); setPage(1); }}
//             className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-all"
//           />
//         </div>
//         <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors">
//           <SlidersHorizontal size={15} className="text-red-400" />
//           Filter By
//           <ChevronDown size={14} />
//         </button>
//       </div>

//       {/* Filter chips */}
//       <div className="flex items-center gap-2 mb-6 flex-wrap">
//         {filterChips.map((chip) => (
//           <button
//             key={chip}
//             onClick={() => { setActiveChip(chip); setPage(1); }}
//             className={`px-4 py-1.5 rounded-full text-sm font-heading font-medium transition-colors ${
//               activeChip === chip
//                 ? "bg-[#E2554F] text-white"
//                 : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//             }`}
//           >
//             {chip}
//           </button>
//         ))}
//       </div>

//       {/* States */}
//       {loading && (
//         <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
//           <Loader2 size={20} className="animate-spin text-[#E2554F]" />
//           <span className="text-sm">Loading creatives...</span>
//         </div>
//       )}

//       {error && !loading && (
//         <p className="text-sm text-red-500 text-center py-10">{error}</p>
//       )}

//       {!loading && !error && filtered.length === 0 && (
//         <p className="text-sm text-gray-400 text-center py-10">No creatives found.</p>
//       )}

//       {/* Grid */}
//       {!loading && !error && filtered.length > 0 && (
//         <>
//           <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
//             {paginated.map((creative) => (
//               <CollabCard key={creative.id} creative={creative} />
//             ))}
//           </div>

//           <GigsPagination
//             currentPage={page}
//             totalPages={totalPages}
//             perPage={perPage}
//             onPageChange={setPage}
//             onPerPageChange={(val) => { setPerPage(val); setPage(1); }}
//           />
//         </>
//       )}
//     </div>
//   );
// };

// export default CollabHubContent;



"use client";
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, ChevronDown, Loader2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";

interface Brief {
  id: string;
  role: string;
  description: string;
  proposedFee: number;
  workMode: string;
  deliveryDate: string;
  timeline: string;
  expectedDeliverables: string[];
  project: {
    id: string;
    title: string;
    status: string;
    leadCreativeId: string;
  };
}

interface Collab {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "REVISED";
  rejectionReason: string | null;
  createdAt: string;
  progress: any[];
  brief: Brief;
}

const filterChips = [
  { label: "All Briefs", value: "ALL" },
  { label: "Pending Review", value: "PENDING" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Revised", value: "REVISED" },
];

const statusStyles: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-orange-50 text-orange-400 border border-orange-200" },
  ACCEPTED: { label: "Accepted", className: "bg-green-50 text-green-500 border border-green-200" },
  REJECTED: { label: "Rejected", className: "bg-red-50 text-red-400 border border-red-200" },
  REVISED: { label: "Revised", className: "bg-purple-50 text-purple-400 border border-purple-200" },
  NEW: { label: "New", className: "bg-green-50 text-green-500 border border-green-200" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const CollabHubContent: React.FC = () => {
  const router = useRouter();
  const [activeChip, setActiveChip] = useState("ALL");
  const [search, setSearch] = useState("");
  const [collabs, setCollabs] = useState<Collab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBriefs = async () => {
      setLoading(true);
      setError(null);
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        const { token } = await tokenRes.json();
        const res = await fetch("/api/v1/collabs/my-briefs", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        const json = await res.json();
        console.log(json.data)
        if (!res.ok) throw new Error(json.message || "Failed to fetch briefs");
        setCollabs(Array.isArray(json.data) ? json.data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchBriefs();
  }, []);

  const filtered = collabs.filter((c) => {
    const matchesChip = activeChip === "ALL" || c.status === activeChip;
    const matchesSearch =
      c.brief.role.toLowerCase().includes(search.toLowerCase()) ||
      c.brief.project.title.toLowerCase().includes(search.toLowerCase());
    return matchesChip && matchesSearch;
  });

  return (
    <div>
      <Breadcrumb
        crumbs={[
          { label: "Dashboard", path: "/creative/dashboard" },
          { label: "Incoming Collab Briefs" },
        ]}
      />

      <h1 className="text-2xl font-bold font-heading text-gray-900 mb-6">
        Incoming Collabs Briefs
      </h1>

      {/* Search + Filter */}
      <div className="flex items-center gap-3 mb-4">
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
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {filterChips.map((chip) => (
          <button
            key={chip.value}
            onClick={() => setActiveChip(chip.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-heading font-medium transition-colors ${
              activeChip === chip.value
                ? "bg-[#E2554F] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* States */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
          <Loader2 size={20} className="animate-spin text-[#E2554F]" />
          <span className="text-sm">Loading briefs...</span>
        </div>
      )}

      {error && !loading && (
        <p className="text-sm text-red-500 text-center py-10">{error}</p>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-10">No briefs found.</p>
      )}

      {/* List */}
      {!loading && !error && filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map((collab, index) => {
            const isNew = index === 0 && collab.status === "PENDING";
            const badge = isNew ? statusStyles["NEW"] : statusStyles[collab.status];

            return (
              <div
                key={collab.id}
                className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
              >
                {/* Portfolio image placeholder */}
                <div className="w-[100px] h-[80px] rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  <img
                    src="/placeholder.png"
                    alt={collab.brief.project.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/100x80?text=Brief";
                    }}
                  />
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  {/* Category tag + status badge */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                      {collab.brief.project.title}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-[15px] font-bold text-gray-900 font-heading mb-2 truncate">
                    {collab.brief.role}
                  </h3>

                  {/* Meta row */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      {/* Clock icon */}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {collab.brief.timeline}
                    </span>
                    <span className="flex items-center gap-1">
                      {/* Budget icon */}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/>
                      </svg>
                      ${collab.brief.proposedFee}
                    </span>
                    <span className="flex items-center gap-1">
                      {/* Calendar icon */}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      {formatDate(collab.brief.deliveryDate)}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Received {timeAgo(collab.createdAt)}
                  </p>
                </div>

                {/* View Details button */}
                <button
                  onClick={() => router.push(`/creative/collab-hub/briefs/${collab.id}`)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#E2554F] hover:bg-[#d44a44] text-white text-sm font-semibold rounded-lg transition-colors flex-shrink-0"
                >
                  <Eye size={15} />
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CollabHubContent;