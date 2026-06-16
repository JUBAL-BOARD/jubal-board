"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Eye, Filter, Calendar, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Loader2, AlertOctagon, X,
} from "lucide-react";
import Sidebar from "@/app/components/creative/dashboard/sideBar";
import DashboardTopbar from "@/app/components/creative/dashboard/dashboardTopbar";
import { useCreativeProfile } from "@/app/lib/hooks/useCreativeProfile";
import { formatDistanceToNow } from "date-fns";

interface DisputeSummary {
  id: string;
  projectId: string;
  status: string;
  issueType?: string;
  description?: string;
  createdAt?: string;
}

interface DisputeDetail extends DisputeSummary {
  evidenceUrls?: string[];
  preferredOutcome?: string;
}

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Open",
  UNDER_REVIEW: "Under Review",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  REJECTED: "Rejected",
};

const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-yellow-100 text-yellow-700",
  UNDER_REVIEW: "bg-orange-100 text-orange-500",
  RESOLVED: "text-green-500",
  CLOSED: "bg-gray-800 text-white",
  REJECTED: "bg-gray-200 text-gray-700",
};

const TABS = ["All Disputes", "OPEN", "UNDER_REVIEW", "RESOLVED", "CLOSED"] as const;
type Tab = typeof TABS[number];

const PAGE_SIZE_OPTIONS = [5, 10, 20];

const formatStatus = (status: string) =>
  status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

// ── inner content ──────────────────────────────────────────────────────────────
const DisputesContent: React.FC = () => {
  const router = useRouter();

  const [disputes, setDisputes] = useState<DisputeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [details, setDetails] = useState<Record<string, DisputeDetail>>({});

  const [activeTab, setActiveTab] = useState<Tab>("All Disputes");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const getHeaders = async () => {
    const tokenRes = await fetch("/api/auth/session/token");
    const { token } = await tokenRes.json();
    return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  };

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        const headers = await getHeaders();
        const res = await fetch("/api/v1/disputes/me", { credentials: "include", headers });
        const json = await res.json();
        setDisputes(Array.isArray(json?.data) ? json.data : []);
      } catch (err) {
        console.error("Failed to load disputes:", err);
        setError("We couldn't load your disputes. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchDisputes();
  }, []);

  const fetchDetail = async (id: string) => {
    if (details[id]) return;
    try {
      const headers = await getHeaders();
      const res = await fetch(`/api/v1/disputes/${id}`, { credentials: "include", headers });
      const json = await res.json();
      if (json?.data) setDetails((prev) => ({ ...prev, [id]: json.data }));
    } catch (err) {
      console.error("Failed to load dispute detail:", err);
    }
  };

  const handleView = (id: string) => {
    fetchDetail(id);
    router.push(`/creative/support/disputes/${id}`);
  };

  const filtered = disputes.filter((d) => {
    const matchTab = activeTab === "All Disputes" || d.status === activeTab;
    const matchSearch =
      (d.issueType ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (d.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
      d.id.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleTabChange = (tab: Tab) => { setActiveTab(tab); setPage(1); };
  const handlePageSizeChange = (size: number) => { setPageSize(size); setPage(1); };

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading text-black mb-1">Disputes</h1>
      <p className="text-sm text-black mb-6">Disputes clients have raised about your projects.</p>

      {/* Search + Filter */}
      <div className="flex gap-3 mb-5">
        <div className="flex items-center flex-1 border border-gray-200 rounded-lg px-3 gap-2 bg-white">
          <Search size={16} className="text-gray-400" />
          <input
            className="flex-1 py-2 text-sm outline-none placeholder:text-gray-400"
            placeholder="Search by ID, issue or description"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600">
          <Filter size={15} className="text-[#E05C5C]" />
          Filter By
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-[#E05C5C] text-white"
                : "bg-white border border-gray-200 text-black"
            }`}
          >
            {tab === "All Disputes" ? "All Disputes" : STATUS_LABEL[tab] ?? formatStatus(tab)}
          </button>
        ))}
      </div>

      {/* States */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-[#E05C5C]" size={28} />
        </div>
      )}
      {error && <p className="text-sm text-red-500 text-center py-10">{error}</p>}
      {!loading && !error && paginated.length === 0 && (
        <div className="text-center py-10">
          <AlertOctagon size={28} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No disputes found.</p>
        </div>
      )}

      {/* Cards */}
      {!loading && !error && (
        <div className="flex flex-col gap-4">
          {paginated.map((dispute) => (
            <div
              key={dispute.id}
              className="bg-white border border-gray-100 rounded-xl p-4 flex items-start justify-between shadow-sm"
            >
              <div className="flex-1">
                <span className="text-xs bg-gray-700 text-white rounded px-2 py-0.5 font-mono">
                  #DSP-{dispute.id.slice(0, 4).toUpperCase()}
                </span>
                <h3 className="font-semibold font-heading text-black mt-1">
                  {dispute.issueType ?? `Project ${dispute.projectId}`}
                </h3>
                {dispute.description && (
                  <p className="text-sm text-black mt-0.5">
                    Description: {dispute.description}
                  </p>
                )}
                {dispute.createdAt && (
                  <div className="flex items-center gap-1 mt-2 text-sm text-black">
                    <Calendar size={18} />
                    {formatDistanceToNow(new Date(dispute.createdAt), { addSuffix: true })}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-3 ml-4">
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full ${
                    STATUS_STYLES[dispute.status] ?? "bg-gray-100 text-gray-700"
                  }`}
                >
                  {STATUS_LABEL[dispute.status] ?? formatStatus(dispute.status)}
                </span>
                <button
                  onClick={() => handleView(dispute.id)}
                  className="flex items-center gap-1.5 bg-[#E05C5C] text-white text-sm px-4 py-2 rounded-lg"
                >
                  <Eye size={14} />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && filtered.length > 0 && (
        <div className="flex items-center justify-between mt-8 flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            Showing per page
            <select
              className="border border-gray-200 rounded px-2 py-1 text-sm"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(1)} disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded text-gray-500 disabled:opacity-40">
              <ChevronsLeft size={14} />
            </button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded text-gray-500 disabled:opacity-40">
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
              .reduce<(number | "...")[]>((acc, n, i, arr) => {
                if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push("...");
                acc.push(n);
                return acc;
              }, [])
              .map((item, i) =>
                item === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-gray-400">...</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item as number)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium ${
                      page === item
                        ? "bg-[#1E2A3B] text-white"
                        : "border border-gray-200 text-gray-600"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}

            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded text-gray-500 disabled:opacity-40">
              <ChevronRight size={14} />
            </button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded text-gray-500 disabled:opacity-40">
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── page with layout ───────────────────────────────────────────────────────────
const CreativeDisputesPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, loading: profileLoading, error } = useCreativeProfile();

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 size={48} className="animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Error loading profile: {error}</p>
      </div>
    );
  }

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
      <div className="flex flex-1">
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
          <Sidebar activeItem="Help & Support" />
        </div>
        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <DisputesContent />
        </main>
      </div>
    </div>
  );
};

export default CreativeDisputesPage;