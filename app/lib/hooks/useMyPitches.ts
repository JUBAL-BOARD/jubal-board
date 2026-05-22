import { useState, useEffect, useCallback } from "react";
import { CreativePitch } from "@/app/types";

const ALL_STATUSES = ["PENDING", "APPROVED", "REJECTED"];

export function useMyPitches() {
  const [pitches, setPitches] = useState<CreativePitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPitches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Step 1: fetch all pitches across statuses
      const results = await Promise.all(
        ALL_STATUSES.map((status) =>
          fetch(`/api/v1/pitches/me?status=${status}`, {
            credentials: "include",
            headers,
          }).then((r) => r.json())
        )
      );

      const list = results.flatMap((data) =>
        Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : []
      );

      // Step 2: fetch full brief detail for each pitch to get client + category
      const detailedBriefs = await Promise.all(
        list.map(async (p) => {
          try {
            const r = await fetch(`/api/v1/briefs/${p.briefId}`, {
              headers,
              credentials: "include",
            });
            if (r.ok) {
              const json = await r.json();
              return json.data ?? json; // unwrap { success, data, message }
            }
          } catch {}
          return p.brief; // fallback to the partial brief from pitch response
        })
      );

      const mapped: CreativePitch[] = list.map((p, i) => {
        const brief = detailedBriefs[i];
        const client = brief?.client;
        const category = brief?.category?.name ?? "—";

        return {
          id: p.id,
          gigTitle: brief?.jobTitle ?? p.brief?.jobTitle ?? "Untitled",
          category,
          budget:
            brief?.budgetMin != null
              ? `$${brief.budgetMin.toLocaleString()} - $${brief.budgetMax.toLocaleString()}`
              : `$${p.proposedAmount.toLocaleString()}`,
          timeline: p.deliveryDate
            ? new Date(p.deliveryDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "—",
          description: p.coverNote ?? "",
          image: brief?.referenceFileUrls?.[0] ?? "",
          sentAt: new Date(p.createdAt).toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: p.status.toLowerCase() as CreativePitch["status"],
          client: {
            id: client?.id ?? "",
            name: client?.name ?? "Client",
            avatar:
              client?.imageUrl ??
              client?.avatarUrl ??
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                client?.name ?? "CL"
              )}&background=1a1a2e&color=fff&size=128`,
            verified: client?.isHighValue ?? false,
            isOnline: false,
          },
        };
      });

      setPitches(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPitches();
  }, [fetchPitches]);

  return { pitches, loading, error };
}