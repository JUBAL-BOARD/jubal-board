"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, Star, ArrowLeft, CheckCircle, X, Clock, Wallet, Calendar, Milestone, FileText } from "lucide-react";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import Sidebar from "@/app/components/creative/dashboard/sideBar";
import DashboardTopbar from "@/app/components/creative/dashboard/dashboardTopbar";
import { useCreativeProfile } from "@/app/lib/hooks/useCreativeProfile";

interface LeadCreative {
  id: string;
  fullName: string;
  imageUrl: string;
  averageRating: number;
  reviewCount: number;
  completedProjects: number;
  jobSuccessRate?: number;
  isVerified?: boolean;
}

interface Collab {
  id: string;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  progress: any[];
  brief: {
    id: string;
    role: string;
    description: string;
    proposedFee: number;
    workMode: string;
    deliveryDate: string;
    timeline: string;
    expectedDeliverables: string[];
    specificSkills?: string;
    budgetMin?: number;
    budgetMax?: number;
    attachedFiles?: { name: string; url: string; type: string }[];
    notes?: string;
    project: {
      id: string;
      title: string;
      status: string;
      leadCreativeId: string;
    };
  };
}

const REJECT_REASONS = [
  "Timeline Too Short",
  "Budget Too Low",
  "Skill Mismatch",
  "Currently Unavailable",
  "Project Scope Unclear",
  "Other",
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-orange-50 text-orange-400 border border-orange-200",
  ACCEPTED: "bg-green-50 text-green-500 border border-green-200",
  REJECTED: "bg-red-50 text-red-400 border border-red-200",
  REVISED: "bg-purple-50 text-purple-400 border border-purple-200",
};

// ── Accept Modal ──────────────────────────────────────────────
function AcceptModal({
  collab,
  onCancel,
  onConfirm,
  loading,
}: {
  collab: Collab;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  const { brief } = collab;
  const budget = brief.budgetMin && brief.budgetMax
    ? `$${brief.budgetMin}–$${brief.budgetMax}`
    : `$${brief.proposedFee}`;

  const rows = [
    { icon: <Clock size={16} className="text-gray-500" />, label: "Timeline", value: brief.timeline },
    { icon: <Wallet size={16} className="text-gray-500" />, label: "Budget", value: budget },
    { icon: <Calendar size={16} className="text-gray-500" />, label: "Delivery Date", value: formatDate(brief.deliveryDate) },
    { icon: <Milestone size={16} className="text-gray-500" />, label: "Milestones", value: `${brief.expectedDeliverables?.length ?? 0} Milestones` },
    { icon: <FileText size={16} className="text-gray-500" />, label: "Deliverables", value: brief.expectedDeliverables?.join(", ") || "—" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-[#f0f0f0] rounded-2xl w-full max-w-md p-6 relative">
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-green-400 flex items-center justify-center">
            <CheckCircle size={32} className="text-white" strokeWidth={2.5} />
          </div>
        </div>

        <h2 className="text-xl font-bold text-[#1a1a2e] text-center mb-1">Accept Collaboration Brief?</h2>
        <p className="text-sm text-gray-500 text-center mb-6">You are committing to:</p>

        {/* Details */}
        <div className="flex flex-col gap-3 mb-6">
          {rows.map(({ icon, label, value }) => (
            <div key={label} className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                {icon}
                <span>{label}</span>
              </div>
              <div className="border-l border-gray-300 pl-4 text-gray-800 font-medium">{value}</div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1a2e] text-white text-sm font-semibold rounded-lg"
          >
            <X size={14} className="text-[#E2554F]" /> Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-5 py-2.5 bg-green-400 hover:bg-green-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Confirm Acceptance
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Reject Modal ──────────────────────────────────────────────
function RejectModal({
  onCancel,
  onConfirm,
  loading,
}: {
  onCancel: () => void;
  onConfirm: (reason: string) => void;
  loading: boolean;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [otherText, setOtherText] = useState("");

  const toggleReason = (reason: string) => {
    setSelected((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  };

  const handleConfirm = () => {
    const parts = selected.filter((r) => r !== "Other");
    if (selected.includes("Other") && otherText.trim()) {
      parts.push(otherText.trim());
    }
    const reason = parts.join(", ") || selected.join(", ") || "No reason provided";
    onConfirm(reason);
  };

  const canSubmit = selected.length > 0 && (
    !selected.includes("Other") || otherText.trim().length > 0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-[#f0f0f0] rounded-2xl w-full max-w-md p-6 relative">
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-[#E2554F] flex items-center justify-center">
            <X size={32} className="text-white" strokeWidth={2.5} />
          </div>
        </div>

        <h2 className="text-xl font-bold text-[#1a1a2e] text-center mb-1">Reject Collaboration Brief?</h2>
        <p className="text-sm text-gray-500 text-center mb-5">Reason (Required)</p>

        {/* Checkboxes */}
        <div className="flex flex-col gap-3 mb-4">
          {REJECT_REASONS.map((reason) => (
            <label key={reason} className="flex items-center gap-3 cursor-pointer text-sm text-gray-700">
              <input
                type="checkbox"
                checked={selected.includes(reason)}
                onChange={() => toggleReason(reason)}
                className="w-4 h-4 accent-[#E2554F] cursor-pointer"
              />
              {reason}
            </label>
          ))}
        </div>

        {/* Other text area */}
        {selected.includes("Other") && (
          <textarea
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            placeholder="Tell the Lead Creative why you are declining the brief"
            className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 resize-none min-h-[90px] mb-4 bg-white"
          />
        )}

        {/* Buttons */}
        <div className="flex items-center justify-between gap-3 mt-2">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1a2e] text-white text-sm font-semibold rounded-lg"
          >
            <X size={14} className="text-[#E2554F]" /> Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canSubmit || loading}
            className="flex-1 px-5 py-2.5 bg-[#E2554F] hover:bg-[#d44a44] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Decline Brief
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function CollabBriefDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [collab, setCollab] = useState<Collab | null>(null);
  const [leadCreative, setLeadCreative] = useState<LeadCreative | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<"accept" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { profile: creativeProfile, loading: profileLoading } = useCreativeProfile();

  const userName = creativeProfile?.fullName || "Creative";
  const userAvatar =
    creativeProfile?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        const { token } = await tokenRes.json();

        const briefsRes = await fetch("/api/v1/collabs/my-briefs", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        const briefsJson = await briefsRes.json();
        if (!briefsRes.ok) throw new Error(briefsJson.message || "Failed to fetch briefs");

        const found = (briefsJson.data as Collab[]).find((c) => c.id === id) ?? null;
        if (!found) throw new Error("Brief not found");
        setCollab(found);

        const leadId = found.brief.project.leadCreativeId;
        const creativeRes = await fetch(`/api/v1/creatives/${leadId}/public-profile`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        const creativeJson = await creativeRes.json();
        if (creativeRes.ok) setLeadCreative(creativeJson.data ?? creativeJson);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAccept = async () => {
    if (!collab) return;
    setActionLoading("accept");
    setActionError(null);
    setActionSuccess(null);
    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();
      const res = await fetch(`/api/v1/collabs/${collab.id}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to accept brief");
      setCollab((prev) => (prev ? { ...prev, status: "ACCEPTED" } : prev));
      setActionSuccess("Brief accepted successfully!");
      setShowAcceptModal(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Something went wrong");
      setShowAcceptModal(false);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reason: string) => {
    if (!collab) return;
    setActionLoading("reject");
    setActionError(null);
    setActionSuccess(null);
    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();
      const res = await fetch(`/api/v1/collabs/${collab.id}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ rejectionReason: reason }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to reject brief");
      setCollab((prev) => (prev ? { ...prev, status: "REJECTED" } : prev));
      setActionSuccess("Brief rejected.");
      setShowRejectModal(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Something went wrong");
      setShowRejectModal(false);
    } finally {
      setActionLoading(null);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 size={48} className="animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Modals */}
      {showAcceptModal && collab && (
        <AcceptModal
          collab={collab}
          onCancel={() => setShowAcceptModal(false)}
          onConfirm={handleAccept}
          loading={actionLoading === "accept"}
        />
      )}
      {showRejectModal && (
        <RejectModal
          onCancel={() => setShowRejectModal(false)}
          onConfirm={handleReject}
          loading={actionLoading === "reject"}
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
          className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-10`}
        >
          <button className="absolute top-4 right-4 z-50 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={22} />
          </button>
          <Sidebar activeItem="Collab Hub" />
        </div>

        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <Breadcrumb
            crumbs={[
              { label: "Dashboard", path: "/creative/dashboard" },
              { label: "Collab Hub", path: "/creative/collab-hub" },
              { label: "Collab Brief Details" },
            ]}
          />

          <h1 className="text-2xl font-bold font-heading text-gray-900 mb-6">
            Incoming Collab Brief Details
          </h1>

          {loading ? (
            <div className="flex items-center justify-center py-24 gap-2 text-gray-400">
              <Loader2 size={20} className="animate-spin text-[#E2554F]" />
              <span className="text-sm">Loading brief...</span>
            </div>
          ) : error || !collab ? (
            <div className="text-center py-24">
              <p className="text-sm text-red-500 mb-4">{error ?? "Brief not found."}</p>
              <button
                onClick={() => router.back()}
                className="text-sm text-gray-500 flex items-center gap-1 mx-auto hover:text-gray-700"
              >
                <ArrowLeft size={14} /> Go back
              </button>
            </div>
          ) : (
            <>
              {/* Lead Creative */}
              <div className="bg-white border border-gray-100 rounded-xl p-6 mb-4 shadow-sm">
                <h2 className="text-lg font-bold font-heading text-gray-900 mb-4">Lead Creative</h2>
                {leadCreative ? (
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {leadCreative.imageUrl ? (
                          <img src={leadCreative.imageUrl} alt={leadCreative.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#1a1a2e] text-white font-bold text-xl">
                            {leadCreative.fullName?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{leadCreative.fullName}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                          <span className="text-xs text-gray-400">Online</span>
                        </div>
                        <div className="mt-1">
                          <span className="text-xs text-gray-500">Verification Status:</span>
                          <span className="inline-block ml-2 px-2.5 py-0.5 bg-green-500 text-white text-xs font-semibold rounded">
                            Verified
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        {leadCreative.averageRating?.toFixed(1)} ({leadCreative.reviewCount} Reviews)
                      </span>
                      <span>{leadCreative.completedProjects} Completed Projects</span>
                      {leadCreative.jobSuccessRate !== undefined && (
                        <span>{leadCreative.jobSuccessRate}% Job Success</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Lead creative info unavailable.</p>
                )}
              </div>

              {/* Brief Summary */}
              <div className="bg-white border border-gray-100 rounded-xl p-6 mb-4 shadow-sm">
                <h2 className="text-lg font-bold font-heading text-gray-900 mb-4">Brief Summary</h2>
                <div className="flex flex-col gap-3">
                  {[
                    { label: "Job Title", value: collab.brief.role },
                    { label: "Project Category", value: collab.brief.project.title },
                    ...(collab.brief.specificSkills
                      ? [{ label: "Specific Skill(s)", value: collab.brief.specificSkills }]
                      : []),
                    { label: "Job Description", value: collab.brief.description },
                    {
                      label: "Set your Budget",
                      value:
                        collab.brief.budgetMin && collab.brief.budgetMax
                          ? `$${collab.brief.budgetMin}–$${collab.brief.budgetMax}`
                          : `$${collab.brief.proposedFee}`,
                    },
                    { label: "Work Mode", value: collab.brief.workMode },
                    { label: "Timeline", value: collab.brief.timeline },
                    { label: "Delivery Date", value: formatDate(collab.brief.deliveryDate) },
                  ].map(({ label, value }) => (
                    <div key={label} className="grid grid-cols-[180px_1fr] gap-4 text-sm border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                      <span className="text-gray-500">{label}</span>
                      <span className="text-gray-900 font-medium">{value}</span>
                    </div>
                  ))}

                  {collab.brief.attachedFiles && collab.brief.attachedFiles.length > 0 && (
                    <div className="grid grid-cols-[180px_1fr] gap-4 text-sm border-b border-gray-50 pb-3">
                      <span className="text-gray-500">Attach Reference File</span>
                      <div className="flex flex-wrap gap-2">
                        {collab.brief.attachedFiles.map((f, i) => (
                          <span key={i} className="px-2.5 py-0.5 border border-[#E2554F] text-[#E2554F] text-xs rounded">
                            {f.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-[180px_1fr] gap-4 text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className={`inline-flex w-fit px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyles[collab.status]}`}>
                      {collab.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Attached Reference Files */}
              {collab.brief.attachedFiles && collab.brief.attachedFiles.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-xl p-6 mb-4 shadow-sm">
                  <h2 className="text-lg font-bold font-heading text-gray-900 mb-4">Attached Reference File</h2>
                  <div className="flex flex-col gap-3">
                    {collab.brief.attachedFiles.map((file, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                            {file.type?.includes("pdf") ? (
                              <span className="text-red-500 text-xs font-bold">PDF</span>
                            ) : (
                              <span className="text-blue-500 text-xs font-bold">IMG</span>
                            )}
                          </div>
                          <span className="text-sm text-gray-700">{file.name}</span>
                        </div>
                        <a href={file.url} download className="text-gray-400 hover:text-gray-600 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deliverables */}
              {collab.brief.expectedDeliverables?.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-xl p-6 mb-4 shadow-sm">
                  <h2 className="text-lg font-bold font-heading text-gray-900 mb-4">Deliverables</h2>
                  <div className="flex flex-col divide-y divide-gray-100">
                    {collab.brief.expectedDeliverables.map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-3">
                        <span className="text-sm text-gray-500">Milestone {i + 1}</span>
                        <span className="text-sm font-medium text-gray-800 bg-gray-100 px-3 py-1 rounded-lg">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {collab.brief.notes && (
                <div className="bg-white border border-gray-100 rounded-xl p-6 mb-4 shadow-sm">
                  <h2 className="text-lg font-bold font-heading text-gray-900 mb-4">Notes</h2>
                  <div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
                    <p className="text-sm text-gray-500">{collab.brief.notes}</p>
                  </div>
                </div>
              )}

              {/* Your Response */}
              <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold font-heading text-gray-900 mb-4">Your Response</h2>

                {actionError && <p className="text-sm text-red-500 mb-3">{actionError}</p>}
                {actionSuccess && (
                  <div className="flex items-center gap-2 text-green-600 text-sm mb-3">
                    <CheckCircle size={16} />
                    {actionSuccess}
                  </div>
                )}

                {collab.status === "ACCEPTED" || collab.status === "REJECTED" ? (
                  <p className="text-sm text-gray-500">
                    You have already <span className="font-semibold">{collab.status.toLowerCase()}</span> this brief.
                  </p>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setShowAcceptModal(true)}
                        disabled={!!actionLoading}
                        className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2"
                      >
                        Accept Brief
                      </button>
                      <button
                        onClick={() => setShowRejectModal(true)}
                        disabled={!!actionLoading}
                        className="px-6 py-2.5 bg-[#E2554F] hover:bg-[#d44a44] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2"
                      >
                        Reject Brief
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">
                      Your response will be shared with the Lead Creative
                    </p>
                  </>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}