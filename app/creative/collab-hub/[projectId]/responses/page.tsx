"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Sidebar from "@/app/components/creative/dashboard/sideBar";
import DashboardTopbar from "@/app/components/creative/dashboard/dashboardTopbar";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import { Loader2, X, BadgeCheck } from "lucide-react";
import Link from "next/link";
import { useCreativeProfile } from "@/app/lib/hooks/useCreativeProfile";
import { useParams } from "next/navigation";

interface Responder {
  inviteId: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  completedProjects: number;
  verified: boolean;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  rejectReason?: string;
}

const StarIcon = () => (
  <svg viewBox="0 0 20 20" fill="#F5A623" className="w-3.5 h-3.5">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default function ResponsesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [responders, setResponders] = useState<Responder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState("");

  const { projectId } = useParams();
  const { profile, loading: profileLoading } = useCreativeProfile();

  const userName = profile?.fullName || "Creative";
  const userAvatar =
    profile?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

  useEffect(() => {
    const fetchResponses = async () => {
      setLoading(true);
      setError(null);
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        const { token } = await tokenRes.json();
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch project title
        const projectRes = await fetch(`/api/v1/projects/${projectId}`, {
          headers,
          credentials: "include",
        });
        if (projectRes.ok) {
          const projectJson = await projectRes.json();
          setProjectTitle(projectJson.data?.title || "");
        }

        // Fetch collab briefs for this project
        const briefsRes = await fetch(`/api/v1/collabs/project/${projectId}/briefs`, {
          headers,
          credentials: "include",
        });
        const briefsJson = await briefsRes.json();
        if (!briefsRes.ok) throw new Error(briefsJson.message || "Failed to fetch briefs");

        const briefs = Array.isArray(briefsJson.data) ? briefsJson.data : [];
        if (briefs.length === 0) {
          setResponders([]);
          return;
        }

        // Map directly from collaborations array inside each brief
        const mapped: Responder[] = briefs.flatMap((brief: any) =>
          (brief.collaborations ?? []).map((collab: any) => ({
            inviteId: collab.id,
            name: collab.invitedCreative?.fullName || "Creative",
            avatar:
              collab.invitedCreative?.imageUrl ||
              `https://ui-avatars.com/api/?name=Creative&background=1a1a2e&color=fff&size=128`,
            role: collab.invitedCreative?.professionalRole || "Creative",
            rating: 0,
            completedProjects: 0,
            verified: false,
            status: collab.status,
            rejectReason: collab.rejectionReason,
          }))
        );

        setResponders(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchResponses();
  }, [projectId]);

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 size={48} className="animate-spin text-gray-500" />
      </div>
    );
  }

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
          className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-10`}
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
              { label: "Responses" },
            ]}
          />

          <h1 className="text-2xl font-bold text-gray-900 mb-5">Responses</h1>

          {/* Project title + actions */}
          <div className="bg-[#fafafa] p-6 flex items-center justify-between mb-5 rounded-xl">
            <h2 className="text-base font-bold text-gray-800">
              Project Title: {projectTitle || "Loading..."}
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
              <Link href={`/creative/collab-hub/${projectId}/collab-progress`}>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#e84545] hover:bg-[#d03535] text-white text-sm font-semibold rounded-lg transition-colors">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  View Progress
                </button>
              </Link>
            </div>
          </div>

          {/* States */}
          {loading && (
            <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
              <Loader2 size={20} className="animate-spin text-[#E2554F]" />
              <span className="text-sm">Loading responses...</span>
            </div>
          )}
          {error && (
            <p className="text-sm text-red-500 text-center py-12">{error}</p>
          )}
          {!loading && !error && responders.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-12">
              No responses yet.
            </p>
          )}

          {/* Responder list */}
          {!loading && !error && responders.length > 0 && (
            <div className="flex flex-col gap-3">
              {responders.map((r) => (
                <div
                  key={r.inviteId}
                  className="border border-gray-100 rounded-xl overflow-hidden"
                >
                  <div className="flex items-center justify-between px-5 py-4">
                    {/* Avatar + info */}
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        <Image
                          src={r.avatar}
                          alt={r.name}
                          width={52}
                          height={52}
                          className="rounded-full object-cover"
                        />
                        <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className="font-semibold text-gray-900 text-sm">
                            {r.name}
                          </p>
                          {r.verified && (
                            <BadgeCheck fill="blue" stroke="white" size={14} />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-1.5">{r.role}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <StarIcon />
                            <span className="font-semibold">
                              {r.rating.toFixed(1)}
                            </span>
                          </div>
                          <span>{r.completedProjects} Completed Projects</span>
                        </div>
                      </div>
                    </div>

                    {/* Status badge only */}
                    {r.status === "ACCEPTED" ? (
                      <span className="px-5 py-2 bg-green-100 text-green-600 text-sm font-semibold rounded-lg">
                        Accepted
                      </span>
                    ) : r.status === "REJECTED" ? (
                      <span className="px-5 py-2 bg-red-50 text-red-400 text-sm font-semibold rounded-lg border border-red-200">
                        Rejected
                      </span>
                    ) : (
                      <span className="px-5 py-2 bg-orange-50 text-orange-400 text-sm font-semibold rounded-lg border border-orange-200">
                        Pending
                      </span>
                    )}
                  </div>

                  {/* Reject reason if available */}
                  {r.status === "REJECTED" && r.rejectReason && (
                    <div className="mx-5 mb-4">
                      <div className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-400">
                        Reason: {r.rejectReason}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}