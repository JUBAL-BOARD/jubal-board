import { useState, useEffect, useCallback } from "react";

export interface Collab {
  id: string;
  projectId: string;
  projectTitle: string;
  role: string;
  status: "PENDING" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "REJECTED";
  invitedAt: string;
  collaborators: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  }[];
}

export function useMyCollabs() {
  const [collabs, setCollabs] = useState<Collab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollabs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const res = await fetch("/api/v1/collabs", {
        credentials: "include",
        headers,
      });

      const json = await res.json();
      const list = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : [];

      const mapped: Collab[] = list.map((c: any) => ({
        id: c.id,
        projectId: c.projectId ?? c.project?.id ?? "",
        projectTitle: c.project?.title ?? c.projectTitle ?? "Untitled Project",
        role: c.role ?? "Collaborator",
        status: c.status,
        invitedAt: new Date(c.createdAt).toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        collaborators: (c.collaborators ?? []).map((col: any) => ({
          id: col.id,
          name: col.name ?? col.fullName ?? "Creative",
          avatar:
            col.avatar ??
            col.imageUrl ??
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              col.name ?? "CR"
            )}&background=1a1a2e&color=fff&size=128`,
          role: col.role ?? "Collaborator",
        })),
      }));

      setCollabs(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollabs();
  }, [fetchCollabs]);

  return { collabs, loading, error, refetch: fetchCollabs };
}