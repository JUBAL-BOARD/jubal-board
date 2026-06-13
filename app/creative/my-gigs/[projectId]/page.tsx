"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Sidebar from "@/app/components/creative/dashboard/sideBar";
import DashboardTopbar from "@/app/components/creative/dashboard/dashboardTopbar";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import { useParams, useRouter } from "next/navigation";
import { X, ChevronDown, Loader2, Users } from "lucide-react";
import { useCreativeProfile } from "@/app/lib/hooks/useCreativeProfile";
import { useGigDetail } from "@/app/lib/hooks/useGigDetail";
import Link from "next/link";

const StarIcon = () => (
  <svg viewBox="0 0 20 20" fill="#F5A623" className="w-4 h-4">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-[#fafafa] p-6 mb-4 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4"
      >
        <h2 className="text-base font-bold text-black">{title}</h2>
        <ChevronDown
          size={18}
          className={`text-black transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

const InviteToCollaborateModal: React.FC<{
  onClose: () => void;
  onSubmit: (email: string, message: string) => Promise<void>;
  projectTitle: string;
  submitting: boolean;
}> = ({ onClose, onSubmit, projectTitle, submitting }) => {
  const inputClass =
    "w-full border border-gray-200 rounded-lg px-3.5 py-[11px] text-[13px] text-black outline-none bg-white box-border";
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl px-10 py-10 w-[80%] lg:w-[460px] flex flex-col items-center text-center shadow-2xl">
        <div className="flex items-center justify-between w-full mb-6">
          <div className="w-6" />
          <h1 className="text-black text-xl font-bold">Invite to Collaborate</h1>
          <button onClick={onClose} className="text-black hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="w-16 h-16 rounded-full bg-[#e84545]/10 flex items-center justify-center mb-4">
          <Users size={30} className="text-[#e84545]" />
        </div>
        <div className="bg-[#fafafa] p-5 mb-4 text-center w-full rounded-lg">
          <h2 className="text-base font-bold text-black mb-1">{projectTitle}</h2>
          <p className="text-xs text-gray-500">Invite a collaborator to join this project</p>
        </div>
        <div className="w-full mb-3 text-left">
          <label className="text-xs font-semibold text-black mb-1 block">Collaborator Email</label>
          <input
            type="email"
            value={email}
            placeholder="Enter email address"
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="w-full mb-5 text-left">
          <label className="text-xs font-semibold text-black mb-1 block">Message (optional)</label>
          <textarea
            value={message}
            placeholder="Add a personal message..."
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className={`${inputClass} resize-y leading-relaxed`}
          />
        </div>
        <button
          onClick={() => onSubmit(email, message)}
          disabled={submitting || !email.trim()}
          className="bg-[#E2554F] border-none rounded-lg px-8 py-2.5 cursor-pointer text-white font-semibold text-sm hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          Send Invite
        </button>
      </div>
    </div>
  );
};

interface Deliverable {
  id: string;
  projectId: string;
  type: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  creativeNote?: string;
  reviewStatus?: string;
  collabId?: string;
  isCollabDeliverable?: boolean;
}

interface CreativeProfile {
  creativeId?: string;
  fullName?: string;
  name?: string;
  professionalRole?: string;
  avatarUrl?: string;
  imageUrl?: string;
  overallRating?: number;
  isPremium?: boolean;
  isVerified?: boolean;
}

const getDueIn = (dueDate: string): string => {
  const diff = new Date(dueDate).getTime() - Date.now();
  if (diff <= 0) return "Overdue";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${days} days ${String(hours).padStart(2, "0")} hrs ${String(mins).padStart(2, "0")} mins`;
};

const statusColorMap: Record<string, string> = {
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-600",
  REVISION: "bg-orange-100 text-orange-600",
  PENDING_PAYMENT: "bg-blue-100 text-blue-600",
  PARTIALLY_COMPLETED: "bg-purple-100 text-purple-600",
};

const statusLabelMap: Record<string, string> = {
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  REVISION: "Revision",
  PENDING_PAYMENT: "Pending Payment",
  PARTIALLY_COMPLETED: "Partially Completed",
};

export default function CreativeViewProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"view" | "review">("view");
  const [showCollaborateModal, setShowCollaborateModal] = useState(false);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [deliverablesLoading, setDeliverablesLoading] = useState(false);
  const [clientProfile, setClientProfile] = useState<CreativeProfile | null>(null);
  const [clientProfileLoading, setClientProfileLoading] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [briefDetail, setBriefDetail] = useState<{
    jobTitle?: string;
    jobDescription?: string;
    specificSkills?: string;
    timeline?: string;
    deliveryDate?: string;
  } | null>(null);

  // ✅ Replaces useEffect fetching /api/v1/creatives/me
  const { profile, loading: profileLoading } = useCreativeProfile();

  // ✅ Replaces useEffect fetching /api/v1/projects/:id + /api/v1/briefs/:briefId
  const { detail, loading: gigLoading, error: gigError } = useGigDetail(projectId);

  const getAuthToken = async () => {
    const tokenRes = await fetch("/api/auth/session/token");
    const { token } = await tokenRes.json();
    return token;
  };

  const fetchDeliverables = async (token: string) => {
    setDeliverablesLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Step 1: fetch regular project deliverables
      const types = ["INITIAL", "REVISION", "FINAL"];
      const regularResults = await Promise.all(
        types.map((type) =>
          fetch(`/api/v1/projects/${projectId}/deliverables?type=${type}`, {
            headers,
            credentials: "include",
          }).then((r) => (r.ok ? r.json() : { data: [] }))
        )
      );
      const regularDeliverables: Deliverable[] = regularResults.flatMap((r) => r.data ?? []);

      // Step 2: fetch collab briefs to get collab IDs
      const briefsRes = await fetch(`/api/v1/collabs/project/${projectId}/briefs`, {
        headers,
        credentials: "include",
      });

      let collabDeliverables: Deliverable[] = [];
      if (briefsRes.ok) {
        const briefsJson = await briefsRes.json();
        const briefs = Array.isArray(briefsJson.data) ? briefsJson.data : [];

        // Step 3: get accepted collab IDs
        const collabIds: string[] = briefs
          .flatMap((b: any) => b.collaborations ?? [])
          .filter((c: any) => c.status === "ACCEPTED")
          .map((c: any) => c.id);

        // Step 4: fetch deliverables for each collab
        const collabResults = await Promise.all(
          collabIds.map((collabId) =>
            fetch(`/api/v1/collabs/${collabId}/deliverables`, {
              headers,
              credentials: "include",
            }).then((r) => (r.ok ? r.json() : { data: [] }))
          )
        );

        collabDeliverables = collabResults.flatMap((r) =>
          (r.data ?? []).map((d: any) => ({
            id: d.id,
            projectId: d.projectId,
            type: d.deliverableType ?? d.type,
            fileName: d.fileName,
            fileUrl: d.signedUrl ?? d.fileUrl,
            fileSize: d.fileSize ?? 0,
            mimeType: d.mimeType ?? "",
            uploadedAt: d.createdAt,
            creativeNote: d.creativeNote,
            reviewStatus: d.reviewStatus,
            collabId: d.collaborationId,
            isCollabDeliverable: true,
          }))
        );
      }

      // Step 5: merge both
      setDeliverables([...regularDeliverables, ...collabDeliverables]);
    } catch {
      // fail silently
    } finally {
      setDeliverablesLoading(false);
    }
  };

  // Fetch deliverables + client profile once the gig detail is ready
  useEffect(() => {
    if (!detail) return;

    const fetchExtras = async () => {
      const token = await getAuthToken();

      // Deliverables
      await fetchDeliverables(token);

      // Client profile from brief
      if (!detail.briefId) return;

      setClientProfileLoading(true);
      try {
        const briefRes = await fetch(`/api/v1/briefs/${detail.briefId}`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (!briefRes.ok) return;
        const briefJson = await briefRes.json();
        const brief = briefJson.data ?? briefJson;

        // Extract client profile from brief
        if (brief.client) {
          setClientProfile({
            fullName: brief.client.name,
            name: brief.client.name,
            avatarUrl: brief.client.imageUrl ?? brief.client.avatarUrl,
            imageUrl: brief.client.imageUrl ?? brief.client.avatarUrl,
            overallRating: brief.client.rating,
            isVerified: brief.client.isVerified,
            isPremium: false,
          });
        }

        // store brief fields for Brief Summary
        const skillsRaw =
          brief.specificSkills ?? brief.skills ?? brief.requiredSkills ?? [];
        const specificSkills = Array.isArray(skillsRaw)
          ? skillsRaw.map((s: any) => s.name ?? s).join(", ")
          : skillsRaw ?? "—";

        setBriefDetail({
          jobTitle: brief.jobTitle ?? "—",
          jobDescription: brief.jobDescription ?? "—",
          specificSkills: specificSkills || "—",
          timeline: brief.timeline ?? "—",
          deliveryDate: brief.deliveryDate ?? null,
        });
      } catch {
        // fail silently
      } finally {
        setClientProfileLoading(false);
      }
    };

    fetchExtras();
  }, [detail]);

  const handleInviteSubmit = async (email: string, message: string) => {
    setActionSubmitting(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`/api/v1/projects/${projectId}/invite`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, message }),
      });
      if (!res.ok) throw new Error("Failed to send invite");
      setShowCollaborateModal(false);
    } catch {
      // fail silently
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleDownload = (fileUrl: string) => {
    window.open(fileUrl, "_blank");
  };

  const handleReviewDeliverable = async (collabId: string, deliverableId: string, status: "APPROVED" | "REVISION_REQUESTED") => {
  try {
    const token = await getAuthToken();
    const res = await fetch(`/api/v1/collabs/${collabId}/deliverables/${deliverableId}/status`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update deliverable status");

    // Refresh deliverables
    const token2 = await getAuthToken();
    await fetchDeliverables(token2);
  } catch {
    // fail silently
  }
};

  const loading = profileLoading || gigLoading;

  console.log({ detail, profile, loading });

  // ── Derived display values ────────────────────────────────────────────────

  // Logged-in creative (topbar)
  const userName = profile?.fullName ?? "Creative";
  const userAvatar =
    profile?.avatar ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

  // Creative assigned to the project (from pitch)
  const clientName =
    clientProfile?.fullName ?? clientProfile?.name ?? "Client";
  const clientAvatar =
    clientProfile?.imageUrl ??
    clientProfile?.avatarUrl ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(clientName)}&background=e84545&color=fff&size=128`;
  const clientRole = "Client";

  // Brief rows — useGigDetail doesn't return brief fields, so these come from
  // the raw project brief if available; fall back to what detail exposes
  const briefRows = [
    { label: "Job Title", value: briefDetail?.jobTitle ?? "—" },
    { label: "Specific Skills", value: briefDetail?.specificSkills ?? "—" },
    { label: "Job Description", value: briefDetail?.jobDescription ?? "—" },
    { label: "Timeline", value: briefDetail?.timeline ?? "—" },
    {
      label: "Delivery Date",
      value: briefDetail?.deliveryDate
        ? new Date(briefDetail.deliveryDate).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
        : "—",
    },
  ];

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#E2554F]" size={40} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {showCollaborateModal && (
        <InviteToCollaborateModal
          onClose={() => setShowCollaborateModal(false)}
          onSubmit={handleInviteSubmit}
          projectTitle={detail?.title ?? "—"}
          submitting={actionSubmitting}
        />
      )}

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
          className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-10`}
        >
          <button
            className="absolute top-4 right-4 z-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={22} />
          </button>
          <Sidebar activeItem="My Desk" />
        </div>

        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <Breadcrumb
            crumbs={[
              { label: "Dashboard", path: "/creative/dashboard" },
              { label: "My Gigs", path: "/creative/my-gigs" },
              { label: "View Project" },
            ]}
          />

          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("view")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${activeTab === "view"
                  ? "bg-white border-red-200 text-black"
                  : "bg-white border-red-200 text-black hover:bg-gray-200"
                  }`}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
                View Project
              </button>
              <button
                onClick={() => setActiveTab("review")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${activeTab === "review"
                  ? "bg-[#E2554F] border-[#E2554F] text-white"
                  : "bg-[#E2554F] border-[#E2554F] text-white hover:bg-red-300"
                  }`}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
                Review Deliverables
              </button>
              {(detail?.status === "COLLABORATING" || (detail?.requiredCollaborators ?? 0) > 1) && (
                <Link
                  href={`/creative/collab-hub/${projectId}/collab-progress`}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1c1c3a] text-white text-sm font-semibold rounded-lg hover:bg-[#2e2e5a] transition-colors border border-[#1c1c3a]"
                >
                  <Users size={15} />
                  View Collab Progress
                </Link>
              )}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-red-400">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Report a Dispute
            </button>
          </div>

          {activeTab === "view" ? (
            <>
              <div className="bg-[#fafafa] p-6 mb-4 text-center">
                <h2 className="text-xl font-bold text-black mb-2">
                  {detail?.title ?? "—"}
                </h2>
                <span
                  className={`inline-block px-4 py-1 text-xs font-semibold rounded-full mb-4 ${statusColorMap[detail?.status ?? ""] ?? "bg-gray-100 text-gray-600"
                    }`}
                >
                  {statusLabelMap[detail?.status ?? ""] ?? detail?.status ?? "—"}
                </span>
                <div className="flex items-center gap-3 mb-3 max-w-md mx-auto">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#e84545] rounded-full"
                      style={{ width: `${detail?.progressPercentage ?? 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-black">
                    {detail?.progressPercentage ?? 0}%
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-black">
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="w-4 h-4"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <circle cx="10" cy="10" r="8" />
                    <path strokeLinecap="round" d="M10 6v4l2.5 2.5" />
                  </svg>
                  <span>Due in {detail?.dueDate ? getDueIn(detail.dueDate) : "—"}</span>
                </div>
              </div>

              <div className="bg-[#fafafa] p-6 mb-4">
                <div className="flex items-start justify-between">
                  <h2 className="text-base font-bold text-black">Client</h2>
                  {clientProfile?.isPremium && (
                    <span className="px-4 py-1.5 bg-orange-400 text-white text-xs font-semibold rounded-md">
                      Premium
                    </span>
                  )}
                </div>
                {clientProfileLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="animate-spin text-[#E2554F]" size={24} />
                  </div>
                ) : (
                  <div className="flex items-start gap-4 mt-4">
                    <div className="relative shrink-0">
                      <Image
                        src={clientAvatar}
                        alt={clientName}
                        width={64}
                        height={64}
                        className="rounded-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-black text-xl">{clientName}</p>
                      <p className="text-xs text-green-500 font-medium mt-0.5">● Online</p>
                      <p className="text-sm text-black mt-2">Verification Status:</p>
                      <span
                        className={`inline-block mt-1 px-3 py-0.5 text-xs font-semibold rounded-full ${clientProfile?.isVerified
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-500"
                          }`}
                      >
                        {clientProfile?.isVerified ? "Verified" : "Unverified"}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-8 mt-4 pt-4 text-sm text-black">
                  <div className="flex items-center gap-1">
                    <StarIcon />
                    <span className="font-medium text-black">
                      {clientProfile?.overallRating?.toFixed(1) ?? "—"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{clientRole}</p>
                </div>
              </div>

              <CollapsibleSection title="Brief Summary">
                <table className="w-full text-sm">
                  <tbody>
                    {briefRows.map((row) => (
                      <tr key={row.label} className="border-b border-gray-50 last:border-0">
                        <td className="py-2.5 pr-6 text-black font-medium w-36 align-top">
                          {row.label}
                        </td>
                        <td className="py-2.5 text-black">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CollapsibleSection>

              <CollapsibleSection title="Milestones">
                {detail?.milestones && detail.milestones.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {detail.milestones.map((m, i) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-lg bg-white"
                      >
                        <div>
                          <p className="text-sm font-semibold text-black">
                            {m.title ?? `Milestone ${i + 1}`}
                          </p>
                          {m.completedAt && (
                            <p className="text-xs text-black mt-0.5">
                              Completed{" "}
                              {new Date(m.completedAt).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-semibold ${m.isCompleted
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-400"
                            }`}
                        >
                          {m.isCompleted ? "Completed" : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No milestones set.</p>
                )}
              </CollapsibleSection>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div className="bg-[#fafafa] p-6">
                  <h2 className="text-xl font-bold text-black mb-1">{detail?.title ?? "—"}</h2>
                  <span
                    className={`inline-block px-3 py-0.5 text-xs font-semibold rounded-full mb-3 ${statusColorMap[detail?.status ?? ""] ?? "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {statusLabelMap[detail?.status ?? ""] ?? detail?.status ?? "—"}
                  </span>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#e84545] rounded-full"
                        style={{ width: `${detail?.progressPercentage ?? 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-black">
                      {detail?.progressPercentage ?? 0}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-black">
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      className="w-4 h-4"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <circle cx="10" cy="10" r="8" />
                      <path strokeLinecap="round" d="M10 6v4l2.5 2.5" />
                    </svg>
                    <span>Due in {detail?.dueDate ? getDueIn(detail.dueDate) : "—"}</span>
                  </div>
                </div>
                <div className="bg-[#fafafa] p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <Image
                        src={clientAvatar}
                        alt={clientName}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-black text-xl">{clientName}</p>
                      <p className="text-xs text-black">{clientRole}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-black">
                        <div className="flex items-center gap-0.5">
                          <StarIcon />
                          <span className="font-semibold">
                            {clientProfile?.overallRating?.toFixed(1) ?? "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-[#1c1c3a] flex items-center justify-center">
                    <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4">
                      <path
                        fillRule="evenodd"
                        d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <CollapsibleSection title="Brief Summary">
                  <table className="w-full text-sm">
                    <tbody>
                      {briefRows.map((row) => (
                        <tr key={row.label} className="border-b border-gray-50 last:border-0">
                          <td className="py-2 pr-4 text-black font-medium w-32 align-top text-sm">
                            {row.label}
                          </td>
                          <td className="py-2 text-black text-sm">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CollapsibleSection>

                <CollapsibleSection title={`Uploaded Files (${deliverables.length})`}>
                  {deliverablesLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="animate-spin text-[#E2554F]" size={24} />
                    </div>
                  ) : deliverables.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {deliverables.map((d, i) => {
                        const ext = d.fileName?.split(".").pop()?.toLowerCase() ?? "";
                        const isImage =
                          d.mimeType?.startsWith("image/") ||
                          ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
                        return (
                          <div key={d.id ?? i} className="border border-gray-100 rounded-lg p-3 bg-white">
                            <div className="flex items-center gap-3">
                              {/* Preview */}
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 flex items-center justify-center flex-shrink-0">
                                {isImage ? (
                                  <img
                                    src={d.fileUrl}
                                    alt={d.fileName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <span className="text-xs font-semibold text-gray-500 uppercase">
                                    {ext || "FILE"}
                                  </span>
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-black truncate">{d.fileName}</p>
                                <p className="text-xs text-gray-400">{d.type}</p>
                                {d.creativeNote && (
                                  <p className="text-xs text-gray-500 mt-0.5 italic">"{d.creativeNote}"</p>
                                )}
                                {d.isCollabDeliverable && d.reviewStatus && (
                                  <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full ${d.reviewStatus === "APPROVED"
                                      ? "bg-green-100 text-green-600"
                                      : d.reviewStatus === "REVISION_REQUESTED"
                                        ? "bg-orange-100 text-orange-600"
                                        : "bg-yellow-100 text-yellow-600"
                                    }`}>
                                    {d.reviewStatus === "APPROVED"
                                      ? "Approved"
                                      : d.reviewStatus === "REVISION_REQUESTED"
                                        ? "Revision Requested"
                                        : "Pending Review"}
                                  </span>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex flex-col gap-1.5 flex-shrink-0">
                                <button
                                  onClick={() => handleDownload(d.fileUrl)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e84545] hover:bg-[#d03535] text-white text-xs font-semibold rounded-lg transition-colors"
                                >
                                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                  Download
                                </button>

                                {/* Approve / Request Revision — only for collab deliverables pending review */}
                                {d.isCollabDeliverable && d.reviewStatus === "PENDING_REVIEW" && (
                                  <>
                                    <button
                                      onClick={() => handleReviewDeliverable(d.collabId!, d.id, "APPROVED")}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleReviewDeliverable(d.collabId!, d.id, "REVISION_REQUESTED")}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-400 hover:bg-orange-500 text-white text-xs font-semibold rounded-lg transition-colors"
                                    >
                                      Request Revision
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No deliverables uploaded yet.</p>
                  )}
                </CollapsibleSection>
              </div>

              <CollapsibleSection title="Milestones">
                {detail?.milestones && detail.milestones.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {detail.milestones.map((m, i) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-lg bg-white"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {m.title ?? `Milestone ${i + 1}`}
                          </p>
                          {m.completedAt && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Completed{" "}
                              {new Date(m.completedAt).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-semibold ${m.isCompleted
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-400"
                            }`}
                        >
                          {m.isCompleted ? "Completed" : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No milestones set.</p>
                )}
              </CollapsibleSection>

              <CollapsibleSection title="Message">
                <div className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-sm text-black min-h-[80px]">
                  {deliverables[0]
                    ? `Delivery type: ${deliverables[0].type}`
                    : "No message from creative yet."}
                </div>
              </CollapsibleSection>
            </>
          )}
          <div className="pb-10" />
        </main>
      </div>
    </div>
  );
}