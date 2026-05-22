"use client";
import { useEffect, useState } from "react";
import Sidebar from "../../components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/client/dashboard/dashboardTopbar";
import Breadcrumb from "../../components/client/my-desk/breadcrumb";
import Pagination from "../../components/client/my-desk/pagination";
import { Search, Filter, ChevronDown, X, Eye, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

type BriefStatus = "ACTIVE" | "ASSIGNED" | "EXPIRED" | "CLOSED";
type FilterTab = "All Briefs" | "ACTIVE" | "ASSIGNED" | "EXPIRED" | "CLOSED";

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

interface Brief {
  id: string;
  jobTitle: string;
  jobDescription: string;
  budgetMin: number;
  budgetMax: number;
  deliveryDate: string;
  status: BriefStatus;
  location: string | null;
  projectCategoryId: string;
  category?: { id: string; name: string };
  pitchCount: number;
  referenceFileUrls: string[];
  createdAt: string;
  currency: string;
  timeline: string;
}

const statusStyles: Record<BriefStatus, string> = {
  ACTIVE: "bg-yellow-100 text-yellow-700",
  ASSIGNED: "text-green-500",
  EXPIRED: "bg-red-100 text-red-400",
  CLOSED: "bg-gray-800 text-white",
};

const statusLabel: Record<BriefStatus, string> = {
  ACTIVE: "Active",
  ASSIGNED: "Assigned",
  EXPIRED: "Expired",
  CLOSED: "Closed",
};

const ALL_STATUSES: BriefStatus[] = ["ACTIVE", "ASSIGNED", "EXPIRED", "CLOSED"];
const tabs: FilterTab[] = ["All Briefs", "ACTIVE", "ASSIGNED", "EXPIRED", "CLOSED"];
const tabLabels: Record<FilterTab, string> = {
  "All Briefs": "All Briefs",
  ACTIVE: "Active",
  ASSIGNED: "Assigned",
  EXPIRED: "Expired",
  CLOSED: "Closed",
};

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatBudget(min: number, max: number, currency: string) {
  const symbol = currency === "NGN" ? "₦" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
  if (!min && !max) return "—";
  if (min && max) return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()}`;
  return `${symbol}${(min || max).toLocaleString()}`;
}

const MyBriefs: React.FC = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("All Briefs");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [briefsLoading, setBriefsLoading] = useState(true);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  // Fetch profile
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

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        const { token } = await tokenRes.json();
        const res = await fetch("/api/v1/briefs/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        setCategories(Array.isArray(json) ? json : json.data ?? []);
      } catch {
        // fail silently
      }
    };
    fetchCategories();
  }, []);

  // Fetch all briefs (one request per status, merged)
  useEffect(() => {
    const fetchBriefs = async () => {
      setBriefsLoading(true);
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        if (!tokenRes.ok) return;
        const { token } = await tokenRes.json();
        if (!token) return;

        const results = await Promise.all(
          ALL_STATUSES.map((status) =>
            fetch(`/api/v1/briefs/me?status=${status}`, {
              headers: { Authorization: `Bearer ${token}` },
              credentials: "include",
            }).then((r) => r.json())
          )
        );

        const all: Brief[] = results.flatMap((json) =>
          Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : []
        );

        setBriefs(all);
      } catch {
        // fail silently
      } finally {
        setBriefsLoading(false);
      }
    };
    fetchBriefs();
  }, []);

  if (profileLoading || briefsLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#2563EB] mb-4" size={48} />
        <p className="text-gray-500 font-medium">Loading Briefs...</p>
      </div>
    );
  }

  const getCategoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? "—";

  const userName = profile?.clientProfile?.fullName || profile?.name || "Client";
  const userAvatar =
    profile?.clientProfile?.imageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

  const filtered = briefs.filter((b) => {
    const title = b.jobTitle ?? "";
    const matchSearch = title.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === "All Briefs" || b.status === activeTab;
    return matchSearch && matchTab;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

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
          <Sidebar activeItem="My Briefs" />
        </div>

        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <Breadcrumb
            crumbs={[
              { label: "Dashboard", path: "/client/dashboard" },
              { label: "My Briefs" },
            ]}
          />

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-2xl font-heading font-extrabold text-black">Briefs</h1>
            <button
              onClick={() => router.push("/client/my-briefs/post")}
              className="bg-[#E05C5C] text-white font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-[#d04f4f] transition-colors"
            >
              Post a Brief
            </button>
          </div>

          {/* Search + Filter */}
          <div className="flex gap-3 mb-5">
            <div className="flex-1 flex items-center gap-2.5 border-[1.5px] border-gray-200 rounded-lg px-3.5 py-2.5 bg-white">
              <Search size={18} className="text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="border-none outline-none flex-1 text-[13px] bg-transparent text-black placeholder:text-gray-400"
              />
            </div>
            <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] font-semibold text-[#E05C5C]">
              <Filter size={15} className="text-[#E05C5C]" />
              Filter By
              <ChevronDown size={12} className="text-[#E05C5C]" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 flex-wrap mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-[#E05C5C] text-white"
                    : "bg-white border border-gray-200 text-black"
                }`}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>

          {/* Brief Cards */}
          <div className="flex flex-col gap-4">
            {paginated.length === 0 ? (
              <p className="text-black text-sm text-center mt-10">No briefs found.</p>
            ) : (
              paginated.map((brief) => (
                <div
                  key={brief.id}
                  className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 shadow-sm"
                >
                  <img
                    src={
                      brief.referenceFileUrls?.[0] ??
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(getCategoryName(brief.projectCategoryId))}&background=f3f4f6&color=555&size=96`
                    }
                    alt={brief.jobTitle}
                    className="w-24 h-20 object-cover rounded-lg shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs bg-gray-100 text-black px-2 py-0.5 rounded-full">
                      {getCategoryName(brief.projectCategoryId)}
                    </span>
                    <h3 className="font-bold text-black mt-1 text-[15px]">
                      {brief.jobTitle ?? "Untitled"}
                    </h3>
                    <p className="text-sm text-black mt-0.5 truncate">
                      {brief.jobDescription ?? ""}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-black">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                          <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                          <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                          <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
                        </svg>
                        {formatDate(brief.deliveryDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeWidth="2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                        </svg>
                        {formatBudget(brief.budgetMin, brief.budgetMax, brief.currency)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusStyles[brief.status]}`}>
                      {statusLabel[brief.status]}
                    </span>
                    <button
                      onClick={() => router.push(`/client/my-briefs/${brief.id}`)}
                      className="flex items-center gap-1.5 bg-[#E05C5C] text-white text-sm px-4 py-2 rounded-lg"
                    >
                      <Eye size={14} />
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages || 1}
            perPage={perPage}
            onPageChange={setCurrentPage}
            onPerPageChange={setPerPage}
          />
        </main>
      </div>
    </div>
  );
};

export default MyBriefs;