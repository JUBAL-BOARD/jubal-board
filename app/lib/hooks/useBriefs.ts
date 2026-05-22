import { useEffect, useState } from "react";
import { FreshGig } from "@/app/types";

type UseBriefOptions = {
  categoryId?: string;
  limit?: number;
};

function mapBriefToGig(brief: any): FreshGig {
  return {
    id: brief.id,
    title: brief.jobTitle ?? brief.title ?? "Untitled",
    category: brief.category?.name ?? "General",
    budget:
      brief.budgetMin != null && brief.budgetMax != null
        ? `${brief.currency ?? ""}${brief.budgetMin.toLocaleString()} - ${brief.currency ?? ""}${brief.budgetMax.toLocaleString()}`
        : brief.budget ?? "—",
    timeline: brief.timeline ?? "—",
    description: brief.jobDescription ?? brief.description ?? "",
    image: brief.referenceFileUrls?.[0] ?? undefined,
    isPremium: brief.client?.isHighValue ?? false,
    deliveryDate: brief.deliveryDate ?? brief.deadline ?? "",
    currency: brief.currency ?? "USD",
    skills: brief.skills?.map((s: any) => s.name).join(", ") ?? "",
    postedBy: {
      name: brief.client?.name ?? "Client",
      avatar:
        brief.client?.imageUrl ??
        brief.client?.avatarUrl ??
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          brief.client?.name ?? "Client"
        )}&background=1a1a2e&color=fff&size=128`,
      verified: brief.client?.isHighValue ?? false,
    },
  };
}

export function useBriefs({ categoryId, limit = 20 }: UseBriefOptions = {}) {
  const [gigs, setGigs] = useState<FreshGig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (categoryId === undefined) return;

    const fetchBriefs = async () => {
      setLoading(true);
      setError(null);
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        const { token } = await tokenRes.json();
        const headers = { Authorization: `Bearer ${token}` };

        const params = new URLSearchParams();
        if (categoryId) params.set("categoryId", categoryId);
        params.set("limit", String(limit));

        // Step 1: fetch the list
        const res = await fetch(`/api/v1/briefs?${params.toString()}`, {
          headers,
          credentials: "include",
        });
        const json = await res.json();
        const list: any[] = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json)
            ? json
            : [];

        // Step 2: fetch full details for each brief in parallel to get client info
        const detailed = await Promise.all(
          list.map(async (brief) => {
            try {
              const r = await fetch(`/api/v1/briefs/${brief.id}`, {
                headers,
                credentials: "include",
              });
              if (r.ok) {
                const json = await r.json();
                return json.data ?? json; // 👈 unwrap the `data` field
              }
            } catch { }
            return brief;
          })
        );

        setGigs(detailed.map(mapBriefToGig));
      } catch {
        setError("Failed to load briefs.");
      } finally {
        setLoading(false);
      }
    };

    fetchBriefs();
  }, [categoryId, limit]);

  return { gigs, loading, error };
}