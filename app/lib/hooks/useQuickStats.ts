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

        const [projectsRes, earningsRes] = await Promise.all([
          fetch("/api/v1/projects/creative?filter=Active", { headers, credentials: "include" }),
          fetch("/api/v1/earnings", { headers, credentials: "include" }),
        ]);

        const projectsJson = await projectsRes.json();
        const earningsJson = await earningsRes.json();

        const projects = projectsJson.data?.data ?? projectsJson.data ?? [];
        setActiveProjects(Array.isArray(projects) ? projects.length : projectsJson.data?.total ?? 0);

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