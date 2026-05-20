"use client";
import { useState, useEffect } from "react";

export interface GigMilestone {
  id: string;
  title: string;
  isCompleted: boolean;
  completedAt: string | null;
}

export interface GigDetail {
  id: string;
  title: string;
  status: string;
  dueDate: string | null;
  progressPercentage: number;
  clientId: string;
  briefId: string;
  collabDeadline: string | null;
  milestones: GigMilestone[];
  // client info fetched from brief
  clientName: string;
  clientAvatar: string;
}

export function useGigDetail(id: string | null) {
  const [detail, setDetail] = useState<GigDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        const { token } = await tokenRes.json();
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const projectRes = await fetch(`/api/v1/projects/${id}`, {
          credentials: "include",
          headers,
        });
        if (!projectRes.ok) throw new Error(`Failed to fetch project (${projectRes.status})`);
        const projectJson = await projectRes.json();
        const project = projectJson.data;

        let clientName = "Unknown Client";
        let clientAvatar = "";
        try {
          const briefRes = await fetch(`/api/v1/briefs/${project.briefId}`, {
            credentials: "include",
            headers,
          });
          if (briefRes.ok) {
            const briefJson = await briefRes.json();
            const brief = briefJson.data ?? briefJson;
            clientName = brief.client?.name ?? "Unknown Client";
            clientAvatar =
              brief.client?.imageUrl ??
              brief.client?.avatarUrl ??
              `https://ui-avatars.com/api/?name=${encodeURIComponent(clientName)}&background=e84545&color=fff&size=128`;
          }
        } catch {
          clientAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(clientName)}&background=e84545&color=fff&size=128`;
        }

        setDetail({
          id: project.id,
          title: project.title,
          status: project.status,
          dueDate: project.dueDate,
          progressPercentage: project.progressPercentage,
          clientId: project.clientId,
          briefId: project.briefId,
          collabDeadline: project.collabDeadline,
          milestones: Array.isArray(project.milestones) ? project.milestones : [],
          clientName,
          clientAvatar,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  return { detail, loading, error };
}