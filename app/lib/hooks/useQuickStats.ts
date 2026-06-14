import { useState, useEffect } from "react";
import { useMyPitches } from "./useMyPitches";

const ACTIVE_PROJECT_STATUSES = ["IN_PROGRESS", "REVISION"];
const ACTIVE_COLLAB_STATUSES = ["ACCEPTED", "ACTIVE", "IN_PROGRESS", "ONGOING"];

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
        console.log("Sample collab gig:", collabGigs[0]);
        console.log("collabGigsJson raw:", collabGigsJson);
        console.log("collabGigs status:", collabGigsRes.status, collabGigsRes.ok);

        // Count active regular projects
        let activeProjectCount = 0;
        if (Array.isArray(projects)) {
          activeProjectCount = projects.filter((p: any) =>
            ACTIVE_PROJECT_STATUSES.includes(p.status)
          ).length;
        }

        // Count active collab gigs separately (different entity type)
        let activeCollabCount = 0;
        collabGigs.forEach((c: any) => {
          const status = c.status ?? c.gigStatus ?? c.projectStatus;
          if (ACTIVE_COLLAB_STATUSES.includes(status)) {
            activeCollabCount++;
          }
        });

        setActiveProjects(activeProjectCount + activeCollabCount);

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