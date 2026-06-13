import { useState, useEffect } from "react";
import { useMyPitches } from "./useMyPitches";

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
        const regularCount = Array.isArray(projects)
          ? projects.length
          : projectsJson.data?.total ?? 0;

        const collabGigs = Array.isArray(collabGigsJson.data) ? collabGigsJson.data : [];
        const collabCount = collabGigs.filter(
          (c: any) => c.projectStatus === "IN_PROGRESS"
        ).length;

        setActiveProjects(regularCount + collabCount);

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