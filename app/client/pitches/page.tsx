"use client";
import { useState, useEffect, useCallback } from "react";
import Sidebar from "../../components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/client/dashboard/dashboardTopbar";
import Breadcrumb from "../../components/client/my-desk/breadcrumb";
import { Search, Filter, ChevronDown, X, Star, MessageCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchConversations, createConversation, fetchChatTopics } from "@/app/lib/api/messageApi";

type PitchFilter = "All" | "PENDING" | "ACCEPTED" | "REJECTED";

interface CreativeProfile {
  fullName: string;
  overallRating: number;
  professionalRole: string;
  isPremium: boolean;
  avatarUrl?: string;
}

interface Milestone {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  notes: string;
}

interface Pitch {
  id: string;
  briefId: string;
  briefTitle: string;
  creativeId: string;
  coverNote: string;
  proposedAmount: number;
  currency: string;
  deliveryDate: string;
  status: string;
  createdAt: string;
  isCollaborative: boolean;
  paymentMode: string;
  milestones: Milestone[];
  creativeProfile: CreativeProfile;
}

interface Brief {
  id: string;
  jobTitle: string;
}

type ClientProfile = {
  name: string;
  clientProfile: { fullName: string; imageUrl: string | null };
};

const filterTabs: PitchFilter[] = ["All", "PENDING", "ACCEPTED", "REJECTED"];
const filterLabels: Record<PitchFilter, string> = {
  All: "All",
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

const IncomingPitches: React.FC = () => {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<PitchFilter>("All");
  const [visibleCount, setVisibleCount] = useState(12);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [chatLoadingId, setChatLoadingId] = useState<string | null>(null); // 👈 tracks which pitch is loading

  const router = useRouter();

  // 👇 shared chat handler — takes the creativeId from the pitch
  const handleChat = async (creativeId: string, pitchId: string) => {
    if (!creativeId) {
      console.error("No creativeId for chat");
      return;
    }
    try {
      setChatLoadingId(pitchId);

      const convRes = await fetchConversations({ limit: 50 });
      const list = Array.isArray(convRes) ? convRes : convRes.data ?? [];
      const existing = list.find((c) => c.otherParticipant.id === creativeId);

      if (existing) {
        router.push(`/client/messages/${existing.id}`);
        return;
      }

      const topics = await fetchChatTopics();
      if (!topics || topics.length === 0) {
        console.error("No chat topics available");
        return;
      }

      const newConv = await createConversation({
        recipientId: creativeId,
        topicId: topics[0].id,
        type: "DIRECT",
      });

      router.push(`/client/messages/${newConv.conversation.id}`);
    } catch (err) {
      console.error("Chat failed:", err);
    } finally {
      setChatLoadingId(null);
    }
  };

  const fetchAllPitches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const imageMap: Record<string, string> = {};
      try {
        const suggestedRes = await fetch("/api/v1/creatives/suggested", { headers, credentials: "include" });
        if (suggestedRes.ok) {
          const suggestedJson = await suggestedRes.json();
          (Array.isArray(suggestedJson.data) ? suggestedJson.data : []).forEach((c: any) => {
            if (c.name && c.imageUrl) imageMap[c.name] = c.imageUrl;
          });
        }
      } catch { /* fail silently */ }

      const [profileRes, briefsRes, projectsRes] = await Promise.all([
        fetch("/api/v1/clients/me", { headers, credentials: "include" }),
        fetch("/api/v1/briefs/me", { headers, credentials: "include" }),
        fetch("/api/v1/projects", { headers, credentials: "include" }),
      ]);

      const profileJson = await profileRes.json();
      setProfile(profileJson.data ?? profileJson);

      const projectsJson = await projectsRes.json();
      const projectList = Array.isArray(projectsJson.data)
        ? projectsJson.data
        : Array.isArray(projectsJson)
        ? projectsJson
        : [];
      setProjects(projectList);

      const briefsJson = await briefsRes.json();
      const briefList: Brief[] = Array.isArray(briefsJson)
        ? briefsJson
        : Array.isArray(briefsJson.data)
        ? briefsJson.data
        : briefsJson.data?.briefs ?? [];

      if (briefList.length === 0) {
        setPitches([]);
        return;
      }

      const pitchResults = await Promise.all(
        briefList.map(async (brief) => {
          try {
            const res = await fetch(`/api/v1/briefs/${brief.id}/pitches`, {
              headers,
              credentials: "include",
            });
            if (!res.ok) return [];
            const json = await res.json();
            const list = json.data?.pitches ?? json.data ?? json ?? [];
            return (Array.isArray(list) ? list : []).map((p: any) => {
              const cp = p.creativeProfile;
              const name =
                cp?.fullName ??
                cp?.name ??
                p.creativeName ??
                p.creative?.fullName ??
                p.creative?.name ??
                "Creative";
              const finalAvatar =
                imageMap[name] ??
                cp?.avatarUrl ??
                cp?.imageUrl ??
                `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1a2e&color=fff&size=128`;
              return {
                ...p,
                briefTitle: brief.jobTitle,
                creativeProfile: {
                  ...cp,
                  fullName: name,
                  avatarUrl: finalAvatar,
                },
              };
            });
          } catch {
            return [];
          }
        })
      );

      const allPitches: Pitch[] = pitchResults.flat();
      allPitches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPitches(allPitches);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllPitches();
  }, [fetchAllPitches]);

  const filtered = pitches.filter((p) => {
    const matchSearch =
      (p.creativeProfile?.fullName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.creativeProfile?.professionalRole ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.briefTitle ?? "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === "All" || p.status === activeFilter;
    return matchSearch && matchFilter;
  });

  const visible = filtered.slice(0, visibleCount);

  const userName = profile?.clientProfile?.fullName || profile?.name || "Client";
  const userAvatar =
    profile?.clientProfile?.imageUrl ||
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
          <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <div
          className={`
            fixed top-0 left-0 h-full z-40
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-10
          `}
        >
          <button className="absolute top-4 right-4 z-50 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={22} />
          </button>
          <Sidebar activeItem="Pitches" />
        </div>

        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <Breadcrumb crumbs={[
            { label: "Dashboard", path: "/client/dashboard" },
            { label: "Incoming Pitches" },
          ]} />
          <h1 className="text-2xl font-heading font-extrabold text-black mb-5">Incoming Pitches</h1>

          {/* Search + Filter */}
          <div className="flex gap-3 mb-5">
            <div className="flex-1 flex items-center gap-2.5 border-[1.5px] border-gray-200 rounded-lg px-3.5 py-2.5 bg-white">
              <Search size={18} className="text-black" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setVisibleCount(12); }}
                placeholder="Search creative, role or brief"
                className="border-none outline-none flex-1 text-[13px] bg-transparent text-black placeholder:text-black"
              />
            </div>
            <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] font-semibold text-[#E05C5C]">
              <Filter size={15} className="text-[#E05C5C]" />
              Filter By
              <ChevronDown size={12} className="text-[#E05C5C]" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap mb-6">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveFilter(tab); setVisibleCount(12); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === tab
                    ? "bg-[#E05C5C] text-white"
                    : "bg-white border border-gray-200 text-black"
                }`}
              >
                {filterLabels[tab]}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#E05C5C]" size={36} />
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
              {error}
              <button onClick={() => setError(null)}><X size={14} /></button>
            </div>
          )}

          {!loading && !error && (
            <>
              <p className="text-sm text-gray-500 mb-4">
                Showing <span className="font-semibold text-black">{filtered.length}</span> pitch{filtered.length !== 1 ? "es" : ""}
              </p>

              {filtered.length === 0 ? (
                <div className="text-center py-20 text-gray-400 text-sm">No pitches found.</div>
              ) : (
                <div className="bg-[#fafafa] border border-gray-100 rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0">
                    {visible.map((pitch) => {
                      const matchedProject = projects.find((proj: any) => proj.pitchId === pitch.id);
                      const needsPayment = matchedProject?.status === "PENDING_PAYMENT";
                      const isChatLoading = chatLoadingId === pitch.id;

                      return (
                        <div
                          key={pitch.id}
                          className="bg-white m-4 p-4 flex items-start gap-3 border border-gray-100 rounded-xl"
                        >
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            <img
                              src={
                                pitch.creativeProfile?.avatarUrl ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(pitch.creativeProfile?.fullName ?? "C")}&background=1a1a2e&color=fff&size=128`
                              }
                              alt={pitch.creativeProfile?.fullName ?? "Creative"}
                              className="w-14 h-14 rounded-full object-cover"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-gray-900 text-sm">
                                  {pitch.creativeProfile?.fullName ?? "Creative"}
                                </span>
                                {pitch.creativeProfile?.isPremium && (
                                  <span className="bg-[#E05C5C] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                    Premium
                                  </span>
                                )}
                              </div>

                              {/* 👇 Chat button with loading state */}
                              <button
                                onClick={() => handleChat(pitch.creativeId, pitch.id)}
                                disabled={isChatLoading}
                                className="w-8 h-8 rounded-full bg-[#1E2A3B] flex items-center justify-center shrink-0 disabled:opacity-60 transition-opacity"
                              >
                                {isChatLoading
                                  ? <Loader2 size={14} className="text-white animate-spin" />
                                  : <MessageCircle size={14} className="text-white" />
                                }
                              </button>
                            </div>

                            <p className="text-xs text-gray-400 mt-0.5">
                              {pitch.creativeProfile?.professionalRole ?? "Creative"}
                            </p>
                            <p className="text-xs text-[#E05C5C] mt-0.5 truncate">
                              Brief: {pitch.briefTitle ?? "—"}
                            </p>

                            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Star size={11} className="text-yellow-400 fill-yellow-400" />
                                {pitch.creativeProfile?.overallRating?.toFixed(1) ?? "—"}
                              </span>
                              <span className="font-medium text-gray-700">
                                {pitch.currency ?? "$"}{pitch.proposedAmount?.toLocaleString() ?? "—"}
                              </span>
                              <span>{formatDate(pitch.deliveryDate)}</span>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-4">
                                <button className="text-xs text-[#E05C5C] font-medium hover:underline">
                                  View Profile
                                </button>
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/client/pitches/${pitch.id}?name=${encodeURIComponent(pitch.creativeProfile?.fullName ?? "")}&avatar=${encodeURIComponent(pitch.creativeProfile?.avatarUrl ?? "")}`
                                    )
                                  }
                                  className="text-xs text-[#E05C5C] font-medium hover:underline"
                                >
                                  See Pitch
                                </button>
                              </div>

                              <div className="flex items-center gap-2">
                                {needsPayment && (
                                  <button
                                    onClick={() =>
                                      router.push(
                                        `/client/pitches/${pitch.id}/payment?pitchId=${pitch.id}&projectId=${matchedProject.id}&name=${encodeURIComponent(pitch.creativeProfile?.fullName ?? "")}&avatar=${encodeURIComponent(pitch.creativeProfile?.avatarUrl ?? "")}`
                                      )
                                    }
                                    className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#E05C5C] text-white hover:bg-[#c94c4c] transition-colors"
                                  >
                                    Complete Payment
                                  </button>
                                )}
                                <span
                                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                                    pitch.status === "ACCEPTED"
                                      ? "bg-green-100 text-green-600"
                                      : pitch.status === "REJECTED"
                                      ? "bg-red-100 text-red-500"
                                      : "bg-yellow-100 text-yellow-600"
                                  }`}
                                >
                                  {pitch.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {visibleCount < filtered.length && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setVisibleCount((v) => v + 12)}
                    className="bg-[#E05C5C] text-white font-semibold px-12 py-3.5 rounded-xl hover:bg-[#d04f4f] transition-colors"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default IncomingPitches;