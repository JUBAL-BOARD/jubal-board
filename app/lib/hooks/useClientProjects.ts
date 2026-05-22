import { useState, useEffect } from "react";
import type { DeskProject } from "@/app/data/myDeskData";

export function useClientProjects(statusFilter?: string) {
  const [projects, setProjects] = useState<DeskProject[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        const { token } = await tokenRes.json();
        const headers = { Authorization: `Bearer ${token}` };

        // Build image map from suggested creatives
        const imageMap: Record<string, string> = {};
        try {
          const suggestedRes = await fetch("/api/v1/creatives/suggested", { headers, credentials: "include" });
          if (suggestedRes.ok) {
            const suggestedJson = await suggestedRes.json();
            (Array.isArray(suggestedJson.data) ? suggestedJson.data : []).forEach((c: any) => {
              if (c.name && c.imageUrl) imageMap[c.name] = c.imageUrl;
            });
          }
        } catch {
          // fail silently, avatars will fall back to ui-avatars
        }

        const params = new URLSearchParams();
        if (statusFilter) params.set("status", statusFilter);

        const res = await fetch(`/api/v1/projects?${params.toString()}`, {
          headers,
          credentials: "include",
        });

        const json = await res.json();
        const list = json.data?.data ?? json.data ?? [];
        setTotal(json.data?.total ?? list.length);

        const mapped: DeskProject[] = (
          await Promise.all(
            list.map(async (p: any) => {
              let creative = null;
              let deadline = p.deadline ? new Date(p.deadline) : null;
              let thumbnail = "/placeholder.png";

              try {
                const detailRes = await fetch(`/api/v1/projects/${p.id}`, {
                  headers,
                  credentials: "include",
                });

                if (detailRes.ok) {
                  const detailJson = await detailRes.json();
                  const detail = detailJson.data;
                  deadline = detail.dueDate ? new Date(detail.dueDate) : deadline;

                  // Parse thumbnail from brief's referenceFileUrl
                  try {
                    const urls = JSON.parse(detail.brief?.referenceFileUrl ?? "[]");
                    if (Array.isArray(urls) && urls.length > 0) thumbnail = urls[0];
                  } catch {
                    // keep default
                  }

                  if (detail.pitchId && detail.briefId) {
                    const pitchesRes = await fetch(`/api/v1/briefs/${detail.briefId}/pitches`, {
                      headers,
                      credentials: "include",
                    });

                    if (pitchesRes.ok) {
                      const pitchesJson = await pitchesRes.json();
                      const pitchesList = pitchesJson.data?.pitches ?? pitchesJson.data ?? [];
                      const matchedPitch = pitchesList.find((pitch: any) => pitch.id === detail.pitchId);
                      if (matchedPitch) {
                        creative = matchedPitch.creativeProfile ?? null;
                      }
                    }
                  }
                }
              } catch {
                // fall back to defaults
              }

              const dueLabel = deadline
                ? `Due ${deadline.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}`
                : "No deadline";

              const statusMap: Record<string, DeskProject["status"]> = {
                IN_PROGRESS: "In Progress",
                COMPLETED: "Completed",
                REVISION: "Revision",
                ON_COLLAB: "On Collabs",
                DELIVERABLE_SUBMITTED: "In Progress",
                PARTIALLY_COMPLETED: "In Progress",
                PENDING_PAYMENT: "In Progress",
                ON_HOLD: "In Progress",
                DISPUTED: "In Progress",
              };

              const creativeName =
                creative?.fullName ??
                creative?.name ??
                "Creative";

              const creativeAvatar =
                imageMap[creativeName] ??
                creative?.avatarUrl ??
                creative?.imageUrl ??
                `https://ui-avatars.com/api/?name=${encodeURIComponent(creativeName)}&background=1a1a2e&color=fff&size=128`;

              return {
                id: p.id,
                title: p.title ?? p.brief?.jobTitle ?? "Untitled",
                thumbnail,
                status: statusMap[p.status] ?? "In Progress",
                progress:
                  p.status === "COMPLETED" ? 100 : p.status === "REVISION" ? 60 : 40,
                dueLabel,
                chatLabel: "Chat Creative",
                isCollab: false,
                assignee: {
                  id: creative?.id ?? "",
                  name: creativeName,
                  avatar: creativeAvatar,
                  isOnline: false,
                },
                client: {
                  id: "",
                  name: "",
                  avatar: "",
                  isOnline: false,
                },
              } as DeskProject;
            })
          )
        ).filter((p): p is DeskProject => !!p?.id);

        setProjects(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [statusFilter]);

  return { projects, total, loading, error };
}