"use client";

import Image from "next/image";
import { Star, BadgeCheck, MessageSquare, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Pitch {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  rate: string;
  completedProjects: number;
  verified?: boolean;
}

interface Brief {
  id: string;
  jobTitle: string;
}

const PitchCard: React.FC<{ pitch: Pitch }> = ({ pitch }) => {
  const router = useRouter();
  return (
    <div className="flex items-center gap-3 p-3.5 border border-gray-100 rounded-[10px] bg-white mb-2.5">
      <div className="relative flex-shrink-0">
        <Image
          src={pitch.avatar}
          alt={pitch.name}
          width={80}
          height={80}
          className="rounded-full object-cover"
        />
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-2xl font-bold font-heading text-black">{pitch.name}</span>
          {pitch.verified && <BadgeCheck size={14} fill="#3B82F6" stroke="white" />}
        </div>
        <span className="text-sm text-black">{pitch.role}</span>
        <div className="flex items-center gap-2.5 mt-1">
          <div className="flex items-center gap-0.5">
            <Star size={13} fill="#F59E0B" stroke="#F59E0B" />
            <span className="text-[14px] text-black font-semibold">{pitch.rating.toFixed(1)}</span>
          </div>
          <span className="text-[14px] text-black font-semibold">{pitch.rate}</span>
          <span className="text-[14px] text-black">{pitch.completedProjects} Completed Projects</span>
        </div>
        <div className="flex gap-3.5 mt-1.5">
          <button className="bg-transparent border-none cursor-pointer text-xs text-[#E2554F] font-semibold p-0 hover:underline">
            View Profile
          </button>
          <button
            onClick={() => router.push(`/client/pitches/${pitch.id}`)}
            className="bg-transparent border-none cursor-pointer text-xs text-[#E2554F] font-semibold p-0 hover:underline"
          >
            See Pitch
          </button>
        </div>
      </div>
      <div className="w-7 h-7 rounded-full bg-[#1a1a2e] flex items-center justify-center cursor-pointer flex-shrink-0">
        <MessageSquare size={14} stroke="white" />
      </div>
    </div>
  );
};

const IncomingPitches: React.FC = () => {
  const router = useRouter();
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPitches = async () => {
      setLoading(true);
      setError(null);
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        const { token } = await tokenRes.json();
        const headers = { Authorization: `Bearer ${token}` };

        // 1. BUILD IMAGE MAP FROM SUGGESTED CREATIVES (Match Hook Logic)
        const imageMap: Record<string, string> = {};
        try {
          const suggestedRes = await fetch("/api/v1/creatives/suggested", { 
            headers, 
            credentials: "include" 
          });
          if (suggestedRes.ok) {
            const suggestedJson = await suggestedRes.json();
            (Array.isArray(suggestedJson.data) ? suggestedJson.data : []).forEach((c: any) => {
              if (c.name && c.imageUrl) imageMap[c.name] = c.imageUrl;
            });
          }
        } catch {
          // fail silently
        }

        // Step 1: get all briefs
        const briefsRes = await fetch("/api/v1/briefs/me", {
          headers,
          credentials: "include",
        });
        const briefsJson = await briefsRes.json();
        const briefList: Brief[] = Array.isArray(briefsJson.data)
          ? briefsJson.data
          : briefsJson.data?.briefs ?? [];

        if (briefList.length === 0) {
          setPitches([]);
          setLoading(false);
          return;
        }

        // Step 2: fetch pitches for all briefs in parallel
        const pitchResults = await Promise.all(
          briefList.map(async (brief) => {
            try {
              const res = await fetch(`/api/v1/briefs/${brief.id}/pitches`, {
                headers,
                credentials: "include",
              });
              if (!res.ok) return [];
              const json = await res.json();
              const list = json.data?.pitches ?? json.data ?? [];
              return Array.isArray(list) ? list : [];
            } catch {
              return [];
            }
          })
        );

        const allPitches = pitchResults.flat();

        // Step 3: filter to PENDING only and take first 4
        const pending = allPitches
          .filter((p: any) => p.status === "PENDING")
          .slice(0, 4);

        const mapped: Pitch[] = pending.map((p: any) => {
          const cp = p.creativeProfile;
          const name = cp?.fullName ?? cp?.name ?? "Creative";

          // 2. APPLY AVATAR FALLBACK HIERARCHY (Match Hook Logic)
          const avatar =
            imageMap[name] ??           // 1. Check suggested map
            cp?.avatarUrl ??            // 2. Check profile avatarUrl
            cp?.imageUrl ??             // 3. Check profile imageUrl
            `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1a2e&color=fff&size=128`;

          return {
            id: p.id,
            name,
            role: cp?.professionalRole ?? "Creative",
            avatar,
            rating: cp?.overallRating ?? 0,
            rate: p.proposedAmount ? `$${p.proposedAmount.toLocaleString()}` : "—",
            completedProjects: cp?.completedProjects ?? 0,
            verified: cp?.isPremium ?? false,
          };
        });

        setPitches(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchPitches();
  }, []);

  return (
    <div className="flex-1 bg-[#fafafa] p-5">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[26px] font-heading font-extrabold text-black m-0">
          Incoming Pitches
        </h3>
        <button
          onClick={() => router.push(`/client/pitches`)}
          className="bg-transparent border-none text-[#e2554f] font-semibold text-[13px] cursor-pointer hover:underline"
        >
          View All
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading pitches...</span>
        </div>
      )}

      {error && !loading && (
        <p className="text-sm text-red-500 text-center py-6">{error}</p>
      )}

      {!loading && !error && pitches.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">No incoming pitches.</p>
      )}

      {!loading && !error && pitches.map((p) => (
        <PitchCard key={p.id} pitch={p} />
      ))}
    </div>
  );
};

export default IncomingPitches;