"use client";
import { useState, useEffect, useCallback } from "react";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import GigStatsBar from "@/app/components/creative/my-gigs/gigStatsBar";
import GigListItem from "@/app/components/creative/my-gigs/gigListItem";
import GigsPagination from "@/app/components/creative/my-gigs/gigsPagination";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { MyGig } from "@/app/types";
import { useRouter } from "next/navigation";

interface ApiGig {
  id: string;
  title: string;
  status: string;
  agreedAmount: number;
  clientId: string;
  clientName: string;
  collabDeadline: string | null;
  paymentMode: string;
  requiredCollaborators: number;
}

interface ApiGigDetail {
  id: string;
  title: string;
  status: string;
  agreedAmount: number;
  dueDate: string | null;
  clientId: string;
  progressPercentage: number;
  collabDeadline: string | null;
}

const filterChips = ["All Gigs", "Active", "Recent", "Completed", "Revised", "Partially Completed", "On Collab"];

const chipToFilter: Record<string, string> = {
  "All Gigs": "all",
  Active: "active",
  Recent: "recent",
  Completed: "completed",
  Revised: "revised",
  "Partially Completed": "partially_completed",
  "On Collab": "on_collab",
};

const apiStatusToMyGig = (status: string): MyGig["status"] => {
  const map: Record<string, MyGig["status"]> = {
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    REVISED: "Revised",
    COLLABORATING: "Collaborating",
    PARTIALLY_COMPLETED: "Partially Completed",
    ACTIVE: "Active",
    PENDING_PAYMENT: "Active",
  };
  return map[status] ?? "Active";
};

const getDueIn = (deadline: string): string => {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return "0 days 00hrs 00mins";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${days} day${days !== 1 ? "s" : ""} ${String(hours).padStart(2, "0")}hrs ${String(mins).padStart(2, "0")}mins`;
};

const getProgress = (status: string): number => {
  const map: Record<string, number> = {
    IN_PROGRESS: 60,
    ACTIVE: 30,
    PENDING_PAYMENT: 20,
    PARTIALLY_COMPLETED: 75,
    REVISED: 90,
    COLLABORATING: 50,
    COMPLETED: 100,
  };
  return map[status] ?? 0;
};

const getAvatarFallback = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1a2e&color=fff&size=128`;

const MyGigsContent: React.FC = () => {
  const router = useRouter();
  const [activeChip, setActiveChip] = useState("All Gigs");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(6);
  const [gigs, setGigs] = useState<MyGig[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGigs = useCallback(async (filter: string) => {
    setLoading(true);
    setError(null);
    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();

      if (!token) {
        router.push("/sign-up");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Fetch gigs and approved pitches in parallel
      const [gigsRes, pitchRes] = await Promise.all([
        fetch(`/api/v1/projects/creative?filter=${filter}`, { credentials: "include", headers }),
        fetch(`/api/v1/pitches/me?status=APPROVED`, { credentials: "include", headers }),
      ]);

      if (!gigsRes.ok) throw new Error(`Failed to fetch gigs (${gigsRes.status})`);

      const gigsJson = await gigsRes.json();
      const list: ApiGig[] = Array.isArray(gigsJson.data) ? gigsJson.data : [];
      setTotal(gigsJson.total ?? list.length);

      // Build clientId → avatar map from approved pitches
      const clientAvatarMap: Record<string, string> = {};
      if (pitchRes.ok) {
        const pitchJson = await pitchRes.json();
        const pitchList = Array.isArray(pitchJson.data) ? pitchJson.data : [];

        await Promise.all(
          pitchList.map(async (p: any) => {
            try {
              const r = await fetch(`/api/v1/briefs/${p.briefId}`, {
                credentials: "include",
                headers,
              });
              if (r.ok) {
                const json = await r.json();
                const client = json.data?.client;
                if (client?.name) {
                  clientAvatarMap[client.name] =
                    client.imageUrl ??
                    client.avatarUrl ??
                    getAvatarFallback(client.name ?? "CL");
                }
              }
            } catch { }
          })
        );
      }

      // Fetch gig details and map
      const mapped: MyGig[] = (await Promise.all(
        list.map(async (g) => {
          try {
            const detailRes = await fetch(`/api/v1/projects/${g.id}`, {
              credentials: "include",
              headers,
            });

            if (!detailRes.ok) throw new Error("Detail fetch failed");
            const detailJson = await detailRes.json();
            const detail: ApiGigDetail = detailJson.data;

            return {
              id: detail.id,
              title: detail.title,
              thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=120&q=80",
              client: {
                name: g.clientName ?? "Unknown Client",
                avatar: clientAvatarMap[g.clientName] ?? getAvatarFallback(g.clientName ?? "CL"),
              },
              dueIn: detail.dueDate
                ? getDueIn(detail.dueDate)
                : g.collabDeadline
                  ? getDueIn(g.collabDeadline)
                  : "No deadline",
              progress: getProgress(detail.status),
              status: apiStatusToMyGig(detail.status),
            };
          } catch {
            return {
              id: g.id,
              title: g.title,
              thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=120&q=80",
              client: {
                name: g.clientName ?? "Unknown Client",
                avatar: clientAvatarMap[g.clientId] ?? getAvatarFallback(g.clientName ?? "CL"),
              },
              dueIn: g.collabDeadline ? getDueIn(g.collabDeadline) : "No deadline",
              progress: getProgress(g.status),
              status: apiStatusToMyGig(g.status),
            };
          }
        })
      )).filter((gig): gig is MyGig => !!gig?.id && !!gig?.title);

      setGigs(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchGigs(chipToFilter[activeChip]);
    setPage(1);
  }, [activeChip, fetchGigs]);

  const filtered = gigs.filter((gig) =>
    gig.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <Breadcrumb
        crumbs={[
          { label: "Dashboard", path: "/creative/dashboard" },
          { label: "My Gigs" },
        ]}
      />
      <h1 className="text-2xl font-heading font-bold text-gray-900 mb-5">My Gigs</h1>

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
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeChip === chip
                ? "bg-[#E2554F] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {loading && (
        <p className="text-sm text-gray-400 text-center py-12">Loading gigs…</p>
      )}
      {error && (
        <p className="text-sm text-red-500 text-center py-12">{error}</p>
      )}

      {!loading && !error && (
        <>
          <GigStatsBar gigs={gigs} />

          <div className="mt-6">
            <h2 className="text-2xl font-bold text-black mb-4">All ({filtered.length})</h2>
            <div className="flex flex-col gap-3">
              {paginated.map((gig) => (
                <GigListItem key={gig.id} gig={gig} />
              ))}
            </div>
            {filtered.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-12">No gigs found.</p>
            )}
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

export default MyGigsContent;