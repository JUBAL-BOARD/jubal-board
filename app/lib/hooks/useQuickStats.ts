import { useState, useEffect } from "react";
import { useMyPitches } from "./useMyPitches";

const ACTIVE_PROJECT_STATUSES = ["IN_PROGRESS", "REVISION"];

export function useQuickStats() {
  const [activeProjects, setActiveProjects] = useState(0);
  const [weeklyEarnings, setWeeklyEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const { pitches } = useMyPitches();
  const pendingPitches = pitches.filter((p) => p.status === "pending").length;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        const { token } = await tokenRes.json();
        const headers = { Authorization: `Bearer ${token}` };

        const [projectsRes, earningsRes, collabGigsRes] = await Promise.all([
          fetch("/api/v1/projects/creative?filter=Active", { headers, credentials: "include" }),
          fetch("/api/v1/earnings", { headers, credentials: "include" }),
          fetch("/api/v1/collabs/my-gigs", { headers, credentials: "include" }),
        ]);

        const projectsJson = await projectsRes.json();
        const earningsJson = await earningsRes.json();
        const collabGigsJson = collabGigsRes.ok ? await collabGigsRes.json() : { data: [] };

        const projects = projectsJson.data?.data ?? projectsJson.data ?? [];
        const collabGigs = Array.isArray(collabGigsJson.data) ? collabGigsJson.data : [];

        const activeIds = new Set<string>();

        if (Array.isArray(projects)) {
          projects.forEach((p: any) => {
            if (ACTIVE_PROJECT_STATUSES.includes(p.status) && p.id) {
              activeIds.add(p.id);
            }
          });
        }

        collabGigs.forEach((c: any) => {
          const id = c.projectId ?? c.id;
          if (ACTIVE_PROJECT_STATUSES.includes(c.projectStatus) && id) {
            activeIds.add(id);
          }
        });

        setActiveProjects(activeIds.size);

        const earnings = earningsJson.data ?? earningsJson;
        setWeeklyEarnings(earnings.availableBalance ?? 0);
      } catch {
        // fail silently, defaults stay 0
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { activeProjects, pendingPitches, weeklyEarnings, loading };
}