"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Sidebar from "@/app/components/creative/dashboard/sideBar";
import DashboardTopbar from "@/app/components/creative/dashboard/dashboardTopbar";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import { Loader2, X, Upload } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCreativeProfile } from "@/app/lib/hooks/useCreativeProfile";

interface CollabTask {
  id: string;
  title: string;
  image: string;
  assignee: {
    name: string;
    avatar: string;
    role: string;
  };
  dueInDays: number;
  dueInHours: number;
  dueInMins: number;
  status: "In Progress" | "Completed" | "Pending";
  progress: number;
}

const statusColors: Record<CollabTask["status"], string> = {
  "In Progress": "text-orange-500",
  Completed: "text-green-500",
  Pending: "text-gray-400",
};

const progressColors: Record<CollabTask["status"], string> = {
  "In Progress": "bg-[#e84545]",
  Completed: "bg-green-500",
  Pending: "bg-gray-300",
};

export default function CollabProgressPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState<CollabTask[]>([]);
  const [fetchingProgress, setFetchingProgress] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState("—");

  const { profile, loading: profileLoading } = useCreativeProfile();

  useEffect(() => {
    if (!projectId) return;

    const loadProgress = async () => {
      setFetchingProgress(true);
      setFetchError(null);
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        const { token } = await tokenRes.json();
        const headers = { Authorization: `Bearer ${token}` };

        // Step 1: fetch project detail to get title
        const projectRes = await fetch(`/api/v1/projects/${projectId}`, {
          headers,
          credentials: "include",
        });
        if (projectRes.ok) {
          const projectJson = await projectRes.json();
          setProjectTitle(projectJson.data?.title ?? "—");
        }

        // Step 2: get collab briefs for the project to extract collab IDs
        const briefsRes = await fetch(`/api/v1/collabs/project/${projectId}/briefs`, {
          headers,
          credentials: "include",
        });
        if (!briefsRes.ok) throw new Error("Failed to fetch collab briefs");
        const briefsJson = await briefsRes.json();
        const briefs = Array.isArray(briefsJson.data) ? briefsJson.data : [];

        // Step 3: extract all ACCEPTED collaborations
        const collabs = briefs.flatMap((b: any) =>
          (b.collaborations ?? []).filter((c: any) => c.status === "ACCEPTED")
        );

        if (collabs.length === 0) {
          setTasks([]);
          return;
        }

        // Step 4: fetch progress for each collab
        const progressResults = await Promise.all(
          collabs.map(async (c: any) => {
            const res = await fetch(`/api/v1/collabs/${c.id}/progress`, {
              headers,
              credentials: "include",
            });
            const progressJson = res.ok ? await res.json() : null;
            return {
              collab: c,
              progress: progressJson?.data ?? null,
            };
          })
        );

        // Step 5: map to CollabTask shape
        const mapped: CollabTask[] = progressResults
          .filter(Boolean)
          .map((r: any) => {
            const percentage = r.progress?.percentage ?? 0;
            const status: CollabTask["status"] =
              percentage >= 100 ? "Completed" : percentage > 0 ? "In Progress" : "Pending";

            const assigneeName =
              r.collab.invitedCreative?.fullName ?? "Collaborator";

            const assigneeAvatar =
              r.collab.invitedCreative?.imageUrl ??
              `https://ui-avatars.com/api/?name=${encodeURIComponent(assigneeName)}&background=1a1a2e&color=fff&size=128`;

            const assigneeRole =
              r.collab.invitedCreative?.professionalRole ?? "Collaborator";

            return {
              id: r.collab.id,
              title: r.progress?.currentMilestone ?? "Collab Task",
              image:
                "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80",
              assignee: {
                name: assigneeName,
                avatar: assigneeAvatar,
                role: assigneeRole,
              },
              dueInDays: 0,
              dueInHours: 0,
              dueInMins: 0,
              status,
              progress: percentage,
            };
          });

        setTasks(mapped);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setFetchingProgress(false);
      }
    };

    loadProgress();
  }, [projectId]);

  const loading = profileLoading || fetchingProgress;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 size={48} className="animate-spin text-[#e84545]" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{fetchError}</p>
      </div>
    );
  }

  const userName = profile?.fullName ?? "Creative";
  const userAvatar =
    profile?.avatar ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

  const handleUploadDeliverables = () => {
    router.push(`/creative/my-gigs/${projectId}/upload-deliverables`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <DashboardTopbar
        userName={userName}
        userAvatar={userAvatar}
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex flex-1">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div
          className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-10`}
        >
          <button
            className="absolute top-4 right-4 z-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={22} />
          </button>
          <Sidebar activeItem="Collab Hub" />
        </div>

        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <Breadcrumb
            crumbs={[
              { label: "Dashboard", path: "/creative/dashboard" },
              { label: "Collab Hub", path: "/creative/collab-hub" },
              { label: "Collab Progress" },
            ]}
          />

          <h1 className="text-2xl font-bold text-gray-900 mb-5">Collab Progress</h1>

          {/* Project title + actions */}
          <div className="p-4 lg:p-6 flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-800">
              Project Title: {projectTitle}
            </h2>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#e84545] hover:bg-[#d03535] text-white text-sm font-semibold rounded-lg transition-colors">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path
                    fillRule="evenodd"
                    d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z"
                    clipRule="evenodd"
                  />
                </svg>
                Group Chat
              </button>
              <button
                onClick={handleUploadDeliverables}
                className="flex items-center gap-2 px-4 py-2 bg-[#e84545] hover:bg-[#d03535] text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <Upload size={15} />
                Upload Deliverables
              </button>
            </div>
          </div>

          {/* Task list */}
          {tasks.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">
              No active collaborators found for this project.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-gray-100 overflow-hidden bg-white"
                >
                  <div className="bg-[#fafafa] flex items-center gap-4 px-5 py-4">
                    {/* Task image */}
                    <div className="relative w-20 h-20 lg:w-24 lg:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={task.image}
                        alt={task.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Task info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-black text-lg mb-2">{task.title}</h4>

                      {/* Assignee */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="relative">
                          <Image
                            src={task.assignee.avatar}
                            alt={task.assignee.name}
                            width={28}
                            height={28}
                            className="rounded-full object-cover"
                          />
                          <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full border border-white" />
                        </div>
                        <div>
                          <p className="text-sm text-black font-medium">{task.assignee.name}</p>
                          <p className="text-xs text-gray-400">{task.assignee.role}</p>
                        </div>
                      </div>

                      {/* Due date */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm text-black">
                          Due in {task.dueInDays} days {task.dueInHours}hrs {task.dueInMins}mins
                        </span>
                      </div>

                      {/* Status + progress */}
                      <p className={`text-sm font-semibold mb-1.5 ${statusColors[task.status]}`}>
                        Status: {task.status}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${progressColors[task.status]}`}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {task.progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}