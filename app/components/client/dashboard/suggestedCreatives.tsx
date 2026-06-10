"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import logo from "../../../assets/icononly.png";
import { Star, BadgeCheck, MessageCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchConversations, createConversation, fetchChatTopics } from "@/app/lib/api/messageApi";

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

const CreativeCard: React.FC<{ creative: Creative }> = ({ creative }) => {
  const router = useRouter();
  const [chatLoading, setChatLoading] = useState(false);

  const handleChatCreative = async () => {
  try {
    setChatLoading(true);

    const convRes = await fetchConversations({ limit: 50 });
    const list = Array.isArray(convRes) ? convRes : convRes.data ?? [];
    const existing = list.find(
      (c) => c.otherParticipant.id === creative.id  // 👈 match by id, not name (more reliable)
    );

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
      recipientId: creative.id,
      topicId: topics[0].id,
      type: "DIRECT",
    });

    router.push(`/client/messages/${newConv.conversation.id}`); // 👈 fixed
  } catch (err) {
    console.error("Chat creative failed:", err);
  } finally {
    setChatLoading(false);
  }
};

  return (
    <div className="bg-white border border-gray-200 rounded-[10px] overflow-hidden min-w-[300px] h-[400px] flex-shrink-0">
      <div className="relative h-[250px]">
        <Image src={logo} alt="portfolio" fill className="object-cover" />
        {creative.premium && (
          <span className="absolute bottom-2 right-2 bg-[#F59E0B] text-white text-[10px] font-bold px-2 py-0.5 rounded">
            Premium
          </span>
        )}
      </div>

      <div className="px-3.5 pt-[30px] pb-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-[50px] h-[50px] flex-shrink-0" style={{ width: "36px", height: "36px", minWidth: "36px" }}>
              <Image src={creative.avatar} alt={creative.name} fill className="rounded-full object-cover" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-[13px] font-bold text-[#1a1a2e]">{creative.name}</span>
                {creative.verified && <BadgeCheck size={14} fill="#3B82F6" stroke="white" />}
              </div>
              <span className="text-[11px] text-gray-500">{creative.role}</span>
            </div>
          </div>

          {/* Chat button */}
          <button
            onClick={handleChatCreative}
            disabled={chatLoading}
            className="w-7 h-7 rounded-full bg-[#1a1a2e] flex items-center justify-center cursor-pointer disabled:opacity-60 transition-opacity"
          >
            {chatLoading ? (
              <Loader2 size={14} stroke="#6B7280" className="animate-spin" />
            ) : (
              <MessageCircle size={14} stroke="#6B7280" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between mt-2.5">
          <div className="flex items-center gap-1">
            <Star size={13} fill="#F59E0B" stroke="#F59E0B" />
            <span className="text-xs font-semibold text-gray-700">{creative.rating.toFixed(1)}</span>
          </div>
          <button className="bg-transparent border-none cursor-pointer text-xs text-[#E2554F] font-semibold hover:underline">
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};

const SuggestedCreatives: React.FC = () => {
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const isHovered = useRef(false);
  const CARD_WIDTH = 300;
  const GAP = 16;

  useEffect(() => {
    const fetchCreatives = async () => {
      setLoading(true);
      setError(null);
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        const { token } = await tokenRes.json();
        const res = await fetch("/api/v1/creatives/suggested", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch suggested creatives");
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : [];
        const mapped: Creative[] = list.map((c: any) => ({
          id: c.id,
          name: c.name ?? "Creative",
          role: c.professionalRole ?? "Creative",
          rating: c.overallRating ?? 0,
          avatar: c.imageUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name ?? "C")}&background=1a1a2e&color=fff&size=128`,
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

  // Auto-slide
  useEffect(() => {
    if (creatives.length === 0) return;
    const interval = setInterval(() => {
      if (isHovered.current) return;
      setCurrent((prev) => (prev + 1) % creatives.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [creatives]);

  return (
    <div className="mb-8 bg-[#fafafa] p-5">
      <h3 className="text-[26px] font-extrabold font-heading text-black m-0 mb-4">
        Suggested Creatives
      </h3>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading creatives...</span>
        </div>
      )}

      {error && !loading && (
        <p className="text-sm text-red-500 text-center py-6">{error}</p>
      )}

      {!loading && !error && creatives.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">No suggested creatives.</p>
      )}

      {!loading && !error && creatives.length > 0 && (
        <>
          {/* Outer clip */}
          <div
            className="overflow-hidden"
            onMouseEnter={() => (isHovered.current = true)}
            onMouseLeave={() => (isHovered.current = false)}
          >
            {/* Inner sliding track */}
            <div
              className="flex pb-2"
              style={{
                gap: GAP,
                transform: `translateX(-${current * (CARD_WIDTH + GAP)}px)`,
                transition: "transform 0.8s ease-in-out",
              }}
            >
              {creatives.map((c) => (
                <CreativeCard key={c.id} creative={c} />
              ))}
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-3.5">
            {creatives.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrent(i)}
                className="h-2 rounded-full cursor-pointer transition-all duration-200"
                style={{ width: 8, background: i === current ? "#E2554F" : "#d1d5db" }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SuggestedCreatives;