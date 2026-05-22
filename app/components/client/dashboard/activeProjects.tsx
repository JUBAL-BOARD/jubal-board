"use client";

import Image from "next/image";
import { MessageSquare, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Project {
  id: string;
  title: string;
  assignee: string;
  assigneeAvatar: string;
  status: string;
  progress: number;
  thumbnail: string;
}

const getProgress = (status: string): number => {
  const map: Record<string, number> = {
    IN_PROGRESS: 60,
    COMPLETED: 100,
    REVISION: 60,
    ON_COLLAB: 50,
    DELIVERABLE_SUBMITTED: 80,
    PARTIALLY_COMPLETED: 75,
    PENDING_PAYMENT: 90,
    ON_HOLD: 30,
    DISPUTED: 30,
  };
  return map[status] ?? 40;
};

const ProjectRow: React.FC<{ project: Project }> = ({ project }) => (
  <div className="flex items-center gap-3 py-3 border-b border-gray-100">
    <div className="relative w-[100px] h-[100px] flex-shrink-0">
      <Image
        src={project.thumbnail}
        alt={project.title}
        fill
        className="object-cover"
      />
    </div>
    <div className="flex-1 min-w-0">
      <p className="m-0 text-xl font-heading font-semibold text-[#1a1a2e]">{project.title}</p>
      <div className="flex items-center gap-1.5 my-1">
        <Image
          src={project.assigneeAvatar}
          alt={project.assignee}
          width={30}
          height={30}
          className="rounded-full object-cover"
        />
        <span className="text-sm text-black">{project.assignee}</span>
      </div>
      <span className="text-[15px] text-[#E2554F] font-medium">{project.status}</span>
      <div className="flex items-center gap-2 mt-1">
        <div className="flex-1 h-[5px] bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#E2554F] rounded-full"
            style={{ width: `${project.progress}%` }}
          />
        </div>
        <span className="text-[14px] text-black whitespace-nowrap">{project.progress}%</span>
      </div>
    </div>
    <div className="w-7 h-7 rounded-full bg-[#1a1a2e] flex items-center justify-center cursor-pointer flex-shrink-0">
      <MessageSquare size={14} stroke="white" />
    </div>
  </div>
);

const ActiveProjects: React.FC = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
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

        // 1. BUILD IMAGE MAP FROM SUGGESTED CREATIVES (Match Hook Logic)
        const imageMap: Record<string, string> = {};
        try {
          const suggestedRes = await fetch("/api/v1/creatives/suggested", {
            headers,
            credentials: "include"
          });
          if (suggestedRes.ok) {
            const suggestedJson = await suggestedRes.json();
            (Array.isArray(suggestedJson.data) ? suggestedJson.data : []).forEach((c: any) => {
              if (c.name && c.imageUrl) imageMap[c.name] = c.imageUrl;
            });
          }
        } catch {
          // Fail silently
        }

        const res = await fetch("/api/v1/projects", {
          headers,
          credentials: "include",
        });

        const json = await res.json();
        const list = (json.data?.data ?? json.data ?? []).filter(
          (p: any) => p.status !== "COMPLETED"
        );

        const mapped: Project[] = (
          await Promise.all(
            list.slice(0, 4).map(async (p: any) => {
              let creative = null;
              let thumbnail = "/placeholder.png";

              try {
                const detailRes = await fetch(`/api/v1/projects/${p.id}`, {
                  headers,
                  credentials: "include",
                });

                if (detailRes.ok) {
                  const detailJson = await detailRes.json();
                  const detail = detailJson.data;

                  try {
                    const urls = JSON.parse(detail.brief?.referenceFileUrl ?? "[]");
                    if (Array.isArray(urls) && urls.length > 0) thumbnail = urls[0];
                  } catch { /* keep default */ }

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
              } catch { /* fall back */ }

              // 2. APPLY AVATAR FALLBACK HIERARCHY (Match Hook Logic)
              const assigneeName = creative?.fullName ?? creative?.name ?? "Creative";

              const assigneeAvatar =
                imageMap[assigneeName] ??         // Check suggested map first
                creative?.avatarUrl ??            // Then creative profile props
                creative?.imageUrl ??
                `https://ui-avatars.com/api/?name=${encodeURIComponent(assigneeName)}&background=1a1a2e&color=fff&size=128`;

              return {
                id: p.id,
                title: p.title ?? p.brief?.jobTitle ?? "Untitled",
                assignee: assigneeName,
                assigneeAvatar: assigneeAvatar,
                thumbnail,
                status: p.status ?? "In Progress",
                progress: getProgress(p.status),
              };
            })
          )
        ).filter((p): p is Project => !!p?.id);

        setProjects(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="flex-1 bg-[#fafafa] p-5">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[26px] font-extrabold font-heading text-black m-0">
          Active Projects
        </h3>
        <button
          onClick={() => router.push(`/client/my-desk`)}
          className="bg-transparent border-none text-[#e2554f] font-semibold text-[13px] cursor-pointer hover:underline"
        >
          View All
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading projects...</span>
        </div>
      )}

      {error && !loading && (
        <p className="text-sm text-red-500 text-center py-6">{error}</p>
      )}

      {!loading && !error && projects.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">No active projects.</p>
      )}

      {!loading && !error && projects.map((p) => (
        <ProjectRow key={p.id} project={p} />
      ))}
    </div>
  );
};

export default ActiveProjects;