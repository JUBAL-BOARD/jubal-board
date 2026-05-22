import Link from "next/link";
import { Clock, MessageCircle, Eye, Upload, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

interface OngoingGig {
  id: string;
  title: string;
  status: string;
  agreedAmount: number;
  clientId: string;
  clientName: string;
  paymentMode: string;
  requiredCollaborators: number;
  collabDeadline: string | null;
}

interface MappedGig {
  id: string;
  title: string;
  thumbnail: string;
  dueIn: string;
  client: {
    name: string;
    avatar: string;
  };
  progress: number;
  status: string;
}

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
    PARTIALLY_COMPLETED: 75,
    REVISED: 90,
    COLLABORATING: 50,
    COMPLETED: 100,
    PENDING_PAYMENT: 95,
  };
  return map[status] ?? 0;
};

const getAvatarFallback = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1a2e&color=fff&size=128`;

export default function OngoingGigs() {
  const [gigs, setGigs] = useState<MappedGig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        const { token } = await tokenRes.json();

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // Fetch gigs and approved pitches in parallel
        const [gigsRes, pitchRes] = await Promise.all([
          fetch("/api/v1/projects/creative?filter=Active", { credentials: "include", headers }),
          fetch("/api/v1/pitches/me?status=APPROVED", { credentials: "include", headers }),
        ]);

        const gigsJson = await gigsRes.json();
        const list: OngoingGig[] = Array.isArray(gigsJson.data) ? gigsJson.data : [];

        // Build clientName → avatar map from approved pitches
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
                      getAvatarFallback(client.name);
                  }
                }
              } catch {}
            })
          );
        }

        const mapped: MappedGig[] = (
          await Promise.all(
            list.slice(0, 2).map(async (g) => {
              try {
                const detailRes = await fetch(`/api/v1/projects/${g.id}`, {
                  credentials: "include",
                  headers,
                });

                if (!detailRes.ok) throw new Error("Detail fetch failed");
                const detailJson = await detailRes.json();
                const detail = detailJson.data;

                return {
                  id: detail.id,
                  title: detail.title,
                  thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=120&q=80",
                  client: {
                    name: g.clientName,
                    avatar: clientAvatarMap[g.clientName] ?? getAvatarFallback(g.clientName),
                  },
                  dueIn: detail.dueDate
                    ? getDueIn(detail.dueDate)
                    : g.collabDeadline
                      ? getDueIn(g.collabDeadline)
                      : "—",
                  progress: getProgress(detail.status),
                  status: detail.status,
                };
              } catch {
                return {
                  id: g.id,
                  title: g.title,
                  thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=120&q=80",
                  client: {
                    name: g.clientName,
                    avatar: clientAvatarMap[g.clientName] ?? getAvatarFallback(g.clientName),
                  },
                  dueIn: g.collabDeadline ? getDueIn(g.collabDeadline) : "—",
                  progress: getProgress(g.status),
                  status: g.status,
                };
              }
            })
          )
        ).filter((gig): gig is MappedGig => !!gig?.id && !!gig?.title);

        setGigs(mapped);
      } catch {
        setError("Failed to load gigs.");
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, []);

  return (
    <section className="mb-8 bg-[#fafafa] p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl lg:text-3xl font-heading font-bold text-gray-900">Ongoing Gigs</h3>
        <Link href="/creative/my-gigs" className="text-sm text-[#E2554F] font-medium hover:text-red-600">
          View All
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading gigs...</span>
        </div>
      )}

      {error && !loading && (
        <p className="text-sm text-red-500 text-center py-6">{error}</p>
      )}

      {!loading && !error && gigs.length === 0 && (
        <p className="text-sm text-black text-center py-6">No ongoing gigs.</p>
      )}

      {!loading && !error && (
        <div className="flex gap-4 overflow-x-auto lg:overflow-x-visible lg:grid lg:grid-cols-2 pb-2 lg:pb-0 snap-x snap-mandatory scroll-smooth scrollbar-hide">
          {gigs.map((gig) => (
            <div
              key={gig.id}
              className="flex-shrink-0 w-[80vw] sm:w-[60vw] lg:w-auto snap-start bg-white border border-gray-100 rounded-2xl p-4"
            >
              <div className="flex items-center gap-4 mb-3">
                <Image
                  src={gig.thumbnail}
                  alt={gig.title}
                  width={200}
                  height={200}
                  className="w-16 h-16 lg:w-[80px] lg:h-[80px] rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-3">
                    {gig.title}
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <Image
                      src={gig.client.avatar}
                      alt={gig.client.name}
                      width={22}
                      height={22}
                      className="rounded-full object-cover flex-shrink-0"
                    />
                    <span className="text-sm text-black">{gig.client.name}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-3">
                    <Clock size={11} className="text-black" />
                    <span className="text-xs text-black">Due in {gig.dueIn}</span>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-black">Status: {gig.status}</span>
                  <span className="text-xs font-medium text-gray-700">{gig.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#E2554F] rounded-full" style={{ width: `${gig.progress}%` }} />
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button className="flex items-center gap-1.5 bg-[#E2554F] border border-red-200 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-red-300 transition-colors">
                  <MessageCircle size={12} /> Chat Client
                </button>
                <button className="flex items-center gap-1.5 bg-[#E2554F] border border-gray-200 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-red-300 transition-colors">
                  <Eye size={12} /> View Pitch
                </button>
                <button className="flex items-center gap-1.5 bg-[#E2554F] border border-gray-200 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-red-300 transition-colors">
                  <Upload size={12} /> Upload Deliverables
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}