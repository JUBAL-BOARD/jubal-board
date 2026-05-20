"use client";

import { useState } from "react";
import Image from "next/image";
import Sidebar from "@/app/components/creative/dashboard/sideBar";
import DashboardTopbar from "@/app/components/creative/dashboard/dashboardTopbar";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import { Loader2, X, BadgeCheck } from "lucide-react";
import Link from "next/link";
import { useCreativeProfile } from "@/app/lib/hooks/useCreativeProfile";

interface Responder {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  completedProjects: number;
  verified: boolean;
  status: "pending" | "accepted" | "rejected";
  rejectReason?: string;
}

const initialResponders: Responder[] = [
  { id: "1", name: "Dennis Mark", role: "Graphic Designer", avatar: "https://i.pravatar.cc/150?img=12", rating: 5.0, completedProjects: 12, verified: true, status: "pending" },
  { id: "2", name: "Roy John", role: "Graphic Designer", avatar: "https://i.pravatar.cc/150?img=15", rating: 5.0, completedProjects: 12, verified: true, status: "pending" },
  { id: "3", name: "Grace Joe", role: "Graphic Designer", avatar: "https://i.pravatar.cc/150?img=32", rating: 5.0, completedProjects: 12, verified: true, status: "pending" },
  { id: "4", name: "David John", role: "Graphic Designer", avatar: "https://i.pravatar.cc/150?img=17", rating: 5.0, completedProjects: 12, verified: true, status: "pending" },
  { id: "5", name: "Mary Grace", role: "Graphic Designer", avatar: "https://i.pravatar.cc/150?img=25", rating: 5.0, completedProjects: 12, verified: true, status: "rejected", rejectReason: "Reason: Unavailable" },
];

const StarIcon = () => (
  <svg viewBox="0 0 20 20" fill="#F5A623" className="w-3.5 h-3.5">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default function ResponsesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [responders, setResponders] = useState<Responder[]>(initialResponders);
  const { profile, loading: profileLoading, error } = useCreativeProfile();

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 size={48} className="animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Error loading profile: {error}</p>
      </div>
    );
  }

  const userName = profile?.fullName || "Creative";
  const userAvatar =
    profile?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

  const handleAccept = (id: string) => {
    setResponders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "accepted" } : r))
    );
  };

  const handleReject = (id: string) => {
    setResponders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r))
    );
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
          <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <div className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-10`}>
          <button className="absolute top-4 right-4 z-50 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={22} />
          </button>
          <Sidebar activeItem="Collab Hub" />
        </div>

        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <Breadcrumb crumbs={[
            { label: "Dashboard", path: "/creative/dashboard" },
            { label: "Collab Hub", path: "/creative/collab-hub" },
          ]} />

          <h1 className="text-2xl font-bold text-gray-900 mb-5">Responses</h1>

          {/* Project title + actions */}
          <div className="bg-[#fafafa] p-6 flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-800">Project Title: Creative Campaign</h2>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#e84545] hover:bg-[#d03535] text-white text-sm font-semibold rounded-lg transition-colors">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" clipRule="evenodd" />
                </svg>
                Group Chat
              </button>
              <Link href={"/creative/collab-hub/collab-progress"}>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#e84545] hover:bg-[#d03535] text-white text-sm font-semibold rounded-lg transition-colors">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  View Progress
                </button>
              </Link>
            </div>
          </div>

          {/* Responder list */}
          <div className="flex flex-col gap-3">
            {responders.map((r) => (
              <div key={r.id} className="border border-gray-100 rounded-xl overflow-hidden">
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
                        <p className="font-semibold text-gray-900 text-sm">{r.name}</p>
                        {r.verified && <BadgeCheck fill="blue" stroke="white" size={14} />}
                      </div>
                      <p className="text-xs text-gray-500 mb-1.5">{r.role}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <StarIcon />
                          <span className="font-semibold">{r.rating.toFixed(1)}</span>
                        </div>
                        <span>{r.completedProjects} Completed Projects</span>
                      </div>
                    </div>
                  </div>

                  {/* Action button */}
                  {r.status === "accepted" ? (
                    <span className="px-5 py-2 bg-green-100 text-green-600 text-sm font-semibold rounded-lg">
                      Accepted
                    </span>
                  ) : r.status === "rejected" ? (
                    <button
                      onClick={() => handleAccept(r.id)}
                      className="px-5 py-2 bg-[#e84545] hover:bg-[#d03535] text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      Reject
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReject(r.id)}
                        className="px-5 py-2 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleAccept(r.id)}
                        className="px-5 py-2 bg-orange-400 hover:bg-orange-500 text-white text-sm font-semibold rounded-lg transition-colors"
                      >
                        Accept
                      </button>
                    </div>
                  )}
                </div>

                {/* Reject reason */}
                {r.status === "rejected" && r.rejectReason && (
                  <div className="mx-5 mb-4">
                    <div className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-400">
                      {r.rejectReason}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}