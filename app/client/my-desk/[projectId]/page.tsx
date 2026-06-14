"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Sidebar from "@/app/components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/client/dashboard/dashboardTopbar";
import Breadcrumb from "@/app/components/client/my-desk/breadcrumb";
import { useParams, useRouter } from "next/navigation";
import { X, ChevronDown, ThumbsUp, DollarSign, Loader2, Upload, AlertCircle, Check } from "lucide-react";
import { showReviewCreativeToast } from "@/app/components/ui/toasts";
import { showAddtoFavoriteToast } from "@/app/components/ui/toasts";
import { showPartiallyToast } from "@/app/components/ui/toasts";
import { showRevisionToast } from "@/app/components/ui/toasts";
import { raiseDispute } from "@/app/lib/api/disputeApi";
import toast from "react-hot-toast";

const ISSUE_TYPES = [
  "POOR_QUALITY",
  "MISSED_DEADLINE",
  "INCOMPLETE_DELIVERY",
  "NON_COMMUNICATION",
  "FRAUD",
  "OTHER",
];
const ISSUE_TYPE_LABELS: Record<string, string> = {
  POOR_QUALITY: "Poor Quality",
  MISSED_DEADLINE: "Missed Deadline",
  INCOMPLETE_DELIVERY: "Incomplete Delivery",
  NON_COMMUNICATION: "Non Communication",
  FRAUD: "Fraud",
  OTHER: "Other",
};
const PREFERRED_OUTCOMES = ["REFUND", "REVISION", "REASSIGNMENT"];

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

// ─── Report Dispute Modal ─────────────────────────────────────────────────────

const ReportDisputeModal: React.FC<{
  onClose: () => void;
  projectId: string;
}> = ({ onClose, projectId }) => {
  const [issueType, setIssueType] = useState(ISSUE_TYPES[0]);
  const [description, setDescription] = useState("");
  const [preferredOutcome, setPreferredOutcome] = useState<string | null>(null);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setEvidenceFiles((prev) => [...prev, ...files].slice(0, 5));
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError("Please provide a description.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await raiseDispute({
        projectId,
        issueType,
        description,
        preferredOutcome: preferredOutcome ?? undefined,
        evidenceFiles,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit dispute. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl px-10 py-10 w-full max-w-sm flex flex-col items-center text-center shadow-2xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertCircle size={32} className="text-[#E05C5C]" />
          </div>
          <h2 className="text-xl font-bold text-black mb-2">Dispute Submitted</h2>
          <p className="text-sm text-gray-500 mb-6">
            Your dispute has been raised successfully. Our team will review it shortly.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#E05C5C] hover:bg-red-600 text-white font-semibold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center mt-20 z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl my-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="w-6" />
          <h2 className="text-xl font-bold text-black">Report a Dispute</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-4 mt-2">
          <div className="bg-[#fafafa] rounded-xl p-4">
            <label className="block text-sm font-semibold text-black mb-2">Issue Type</label>
            <div className="relative">
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-black outline-none pr-10"
              >
                {ISSUE_TYPES.map((t) => (
                  <option key={t} value={t}>{ISSUE_TYPE_LABELS[t]}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="bg-[#fafafa] rounded-xl p-4">
            <label className="block text-sm font-semibold text-black mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe in detail"
              rows={4}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-black placeholder-gray-400 outline-none resize-none"
            />
          </div>

          <div className="bg-[#fafafa] rounded-xl p-4">
            <label className="block text-sm font-semibold text-black mb-2">Add Evidence</label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#E05C5C] hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <Upload size={15} />
              Upload
            </button>
            {evidenceFiles.length > 0 && (
              <div className="mt-2 flex flex-col gap-1">
                {evidenceFiles.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-gray-600 bg-white border border-gray-100 rounded px-3 py-1.5">
                    <span className="truncate max-w-[80%]">{f.name}</span>
                    <button
                      onClick={() => setEvidenceFiles((prev) => prev.filter((_, j) => j !== i))}
                      className="text-gray-400 hover:text-red-500 ml-2"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1">Up to 5 files (images/PDFs, max 10MB each)</p>
          </div>

          <div className="bg-[#fafafa] rounded-xl p-4">
            <label className="block text-sm font-semibold text-black mb-3">Preferred Outcome</label>
            <div className="flex items-center gap-4 flex-wrap">
              {PREFERRED_OUTCOMES.map((o) => (
                <label key={o} className="flex items-center gap-2 cursor-pointer text-sm text-black">
                  <input
                    type="radio"
                    name="preferredOutcome"
                    value={o}
                    checked={preferredOutcome === o}
                    onChange={() => setPreferredOutcome(o)}
                    className="accent-[#E05C5C]"
                  />
                  {o}
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting || !description.trim()}
            className="w-full py-3 bg-[#E05C5C] hover:bg-red-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 size={15} className="animate-spin" />}
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Revisions Modal ──────────────────────────────────────────────────────────

const RevisionsModal: React.FC<{
  onClose: () => void;
  onSubmit: (notes: string) => Promise<void>;
  projectTitle: string;
  submitting: boolean;
  revisionsUsed: number;
  revisionsAllowed: number;
}> = ({ onClose, onSubmit, projectTitle, submitting, revisionsUsed, revisionsAllowed }) => {
  const inputClass = "w-full border border-gray-200 rounded-lg px-3.5 py-[11px] text-[13px] text-black outline-none bg-white box-border";
  const [description, setDescription] = useState("");
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center mt-10 justify-center z-50">
      <div className="bg-white rounded-2xl px-12 py-10 w-[80%] lg:w-[420px] flex flex-col items-center text-center shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
        <h1 className="text-black text-2xl font-bold mb-2">Request Revision</h1>
        <p className="text-xs text-gray-400 mb-4">
          {revisionsUsed} of {revisionsAllowed} revisions used
        </p>
        <div className="bg-[#fafafa] p-6 mb-4 text-center w-full">
          <h2 className="text-xl font-bold text-black mb-2">{projectTitle}</h2>
          <span className="inline-block px-4 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full mb-4">
            In Progress
          </span>
          <div className="flex items-center gap-3 mb-3 max-w-md mx-auto">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full w-[60%] bg-[#e84545] rounded-full" />
            </div>
            <span className="text-xs font-semibold text-black">60%</span>
          </div>
        </div>
        <div className="bg-[#fafafa] p-6 mb-4 text-center w-full">
          <h2 className="text-xl font-bold text-black mb-2">Describe what needs to be revised</h2>
          <textarea
            value={description}
            placeholder="Type here"
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={`${inputClass} resize-y leading-relaxed`}
          />
        </div>
        <button
          onClick={() => onSubmit(description)}
          disabled={submitting || !description.trim()}
          className="bg-[#E2554F] border-none rounded-lg px-8 py-2.5 cursor-pointer text-white font-semibold text-xs lg:text-[14px] hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          Submit
        </button>
      </div>
    </div>
  );
};

// ─── Congratulations Modal ────────────────────────────────────────────────────

const CongratulationsModal: React.FC<{
  onClose: () => void;
  onGoToDashboard: () => void;
  submitting: boolean;
  paymentMode?: string;
}> = ({ onClose, onGoToDashboard, submitting, paymentMode }) => {
  const isMilestone = paymentMode === "MILESTONE";
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl px-12 py-10 w-[80%] lg:w-[420px] flex flex-col items-center text-center shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
        <div className="w-[90px] h-[90px] rounded-full bg-[#fb923c] flex items-center justify-center mb-5">
          <ThumbsUp size={52} fill="white" stroke="#fb923c" />
        </div>
        <h2 className="text-[22px] font-bold text-orange-400 m-0 mb-1">All Done</h2>
        <p className="text-[14px] text-gray-600 m-0 mb-7 leading-relaxed max-w-[260px]">
          {isMilestone
            ? "All milestones are complete. The final milestone payment will be automatically released to your creative within 48 hours."
            : "You have marked this project as completed. Tap below to release payment to your creative."}
        </p>
        {!isMilestone ? (
          <button
            onClick={onGoToDashboard}
            disabled={submitting}
            className="bg-orange-400 border-none rounded-lg px-8 py-2.5 cursor-pointer text-white font-semibold text-xs lg:text-[14px] hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            Authorize Pay Out
          </button>
        ) : (
          <button
            onClick={onGoToDashboard}
            className="bg-orange-400 border-none rounded-lg px-8 py-2.5 cursor-pointer text-white font-semibold text-xs lg:text-[14px] hover:bg-orange-600 transition-colors"
          >
            Go to Dashboard
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Released Modal ───────────────────────────────────────────────────────────

const ReleasedModal: React.FC<{
  onClose: () => void;
  onGoToDashboard: () => void;
}> = ({ onClose, onGoToDashboard }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl px-12 py-10 w-[80%] lg:w-[420px] flex flex-col items-center text-center shadow-2xl relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
        <X size={20} />
      </button>
      <div className="w-[90px] h-[90px] rounded-full bg-green-400 flex items-center justify-center mb-5">
        <DollarSign size={52} fill="white" stroke="green" />
      </div>
      <h2 className="text-[22px] font-bold text-green-400 m-0 mb-1">Payment Released</h2>
      <p className="text-[14px] text-gray-600 m-0 mb-7 leading-relaxed max-w-[260px]">
        The creative has received their funds. You can now rate your experience.
      </p>
      <button
        onClick={onGoToDashboard}
        className="bg-green-400 border-none rounded-lg px-8 py-2.5 cursor-pointer text-white font-semibold text-xs lg:text-[14px] hover:bg-green-600 transition-colors"
      >
        Rate Creative
      </button>
    </div>
  </div>
);

// ─── Rate and Review Modal ────────────────────────────────────────────────────

const RateAndReviewModal: React.FC<{
  onClose: () => void;
  onSubmit: (rating: number, review: string, favourite: boolean) => void;
  creativeAvatar: string;
  creativeName: string;
  creativeRole: string;
}> = ({ onClose, onSubmit, creativeAvatar, creativeName, creativeRole }) => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState("");
  const [favourite, setFavourite] = useState<"yes" | "no" | null>(null);

  return (
    <div className="fixed inset-0 bg-black/40 mt-20 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 pt-6 pb-4">
          <div className="w-6" />
          <h2 className="text-xl font-bold text-black">Rate and Review</h2>
          <button onClick={onClose} className="text-black hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="flex items-center justify-center gap-3 pb-4">
          <Image src={creativeAvatar} alt={creativeName} width={44} height={44} className="rounded-full object-cover" />
          <div>
            <p className="font-semibold text-gray-900 text-sm">{creativeName}</p>
            <p className="text-xs text-black">{creativeRole}</p>
          </div>
        </div>
        <div className="bg-[#fafafa] w-[80%] mx-auto p-6 text-center mb-1">
          <p className="font-bold text-black mb-1">How was it?</p>
          <p className="text-xs text-black mb-4">Give 5 star for your experience</p>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)} onClick={() => setRating(s)}>
                <svg viewBox="0 0 20 20" fill={s <= (hovered || rating) ? "#F5A623" : "#E5E7EB"} className="w-9 h-9 transition-colors">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-[#fafafa] w-[80%] mx-auto p-6 text-center mb-1">
          <p className="font-bold text-black mb-1">Leave a Review</p>
          <p className="text-xs text-black mb-3">Be honest. Great work deserves great feedback</p>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={4}
            className="w-full bg-white border border-gray-100 rounded-lg px-4 py-3 text-sm text-black placeholder-gray-300 resize-none focus:outline-none"
          />
        </div>
        <div className="bg-[#fafafa] w-[80%] mx-auto p-6 text-center mb-1">
          <p className="font-bold text-black mb-4">Add this Creative to Favourite?</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => { setFavourite("yes"); showAddtoFavoriteToast(creativeName); }}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${favourite === "yes" ? "bg-[#E2554F] text-white" : "bg-[#E2554F]/80 hover:bg-[#E2554F] text-white"}`}
            >Yes</button>
            <button
              onClick={() => setFavourite("no")}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${favourite === "no" ? "bg-[#E2554F] text-white" : "bg-[#E2554F]/80 hover:bg-[#E2554F] text-white"}`}
            >No</button>
          </div>
        </div>
        <div className="text-center px-6 pb-6">
          <button
            onClick={() => onSubmit(rating, review, favourite === "yes")}
            disabled={rating === 0}
            className="w-[40%] py-3 bg-[#e84545] hover:bg-[#d03535] text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProjectDetail {
  id: string;
  title: string;
  status: string;
  dueDate: string | null;
  progressPercentage: number;
  milestones: { id: string; title: string; isCompleted: boolean; completedAt: string | null }[];
  brief: {
    jobTitle: string;
    jobDescription: string;
    timeline: string;
    deliveryDate: string;
    referenceFileUrl: string;
  } | null;
  pitchId: string | null;
  briefId: string | null;
  paymentMode: "END_OF_PROJECT" | "MILESTONE" | "INSTALLMENTS" | "BOOKING_BALANCE";
  revisionsAllowed: number;
  revisionsUsed: number;
}

interface Deliverable {
  id: string;
  projectId: string;
  type: string;
  fileName: string;
  fileUrl: string;
  signedUrl?: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  deliverableType?: string;
  creativeNote?: string;
  reviewStatus?: string;
  reviewFeedback?: string;
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

type ClientProfile = {
  name: string;
  clientProfile: { fullName: string; imageUrl: string | null };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ViewProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"view" | "review">("view");
  const [showModal, setShowModal] = useState(false);
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [showReleasedModal, setShowReleasedModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [deliverablesLoading, setDeliverablesLoading] = useState(false);
  const [creative, setCreative] = useState<CreativeProfile | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [milestoneSubmittingId, setMilestoneSubmittingId] = useState<string | null>(null);
  const [bookingFeeSubmitting, setBookingFeeSubmitting] = useState(false);
  const [bookingFeeReleased, setBookingFeeReleased] = useState(false);

  const getAuthToken = async () => {
    const tokenRes = await fetch("/api/auth/session/token");
    const { token } = await tokenRes.json();
    return token;
  };

  const fetchDeliverables = async (token: string) => {
    setDeliverablesLoading(true);
    try {
      const types = ["INITIAL", "REVISION", "FINAL"];
      const results = await Promise.all(
        types.map((type) =>
          fetch(`/api/v1/projects/${projectId}/deliverables?type=${type}`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          }).then((r) => (r.ok ? r.json() : { data: [] }))
        )
      );
      const all: Deliverable[] = results.flatMap((r) =>
        (r.data ?? []).map((d: any) => ({
          ...d,
          type: d.deliverableType ?? d.type,
          fileUrl: d.signedUrl ?? d.fileUrl,
        }))
      );
      setDeliverables(all);
    } catch {
      // fail silently
    } finally {
      setDeliverablesLoading(false);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const token = await getAuthToken();
        const headers = { Authorization: `Bearer ${token}` };

        const imageMap: Record<string, string> = {};
        try {
          const suggestedRes = await fetch("/api/v1/creatives/suggested", { headers, credentials: "include" });
          if (suggestedRes.ok) {
            const suggestedJson = await suggestedRes.json();
            (Array.isArray(suggestedJson.data) ? suggestedJson.data : []).forEach((c: any) => {
              if (c.name && c.imageUrl) imageMap[c.name] = c.imageUrl;
            });
          }
        } catch {
          // fail silently
        }

        const [projectRes, profileRes] = await Promise.all([
          fetch(`/api/v1/projects/${projectId}`, { headers, credentials: "include" }),
          fetch("/api/v1/clients/me", { headers, credentials: "include" }),
        ]);

        if (profileRes.ok) {
          const profileJson = await profileRes.json();
          setClientProfile(profileJson.data);
        }

        if (projectRes.ok) {
          const projectJson = await projectRes.json();
          const detail: ProjectDetail = projectJson.data;
          setProject(detail);

          await fetchDeliverables(token);

          if (detail.pitchId && detail.briefId) {
            const pitchesRes = await fetch(`/api/v1/briefs/${detail.briefId}/pitches`, {
              headers,
              credentials: "include",
            });
            if (pitchesRes.ok) {
              const pitchesJson = await pitchesRes.json();
              const pitchesList = pitchesJson.data?.pitches ?? pitchesJson.data ?? [];
              const matchedPitch = pitchesList.find((p: any) => p.id === detail.pitchId);
              if (matchedPitch?.creativeProfile) {
                const profile = matchedPitch.creativeProfile;
                const name = profile.fullName ?? profile.name ?? "";
                setCreative({
                  ...profile,
                  imageUrl: imageMap[name] ?? profile.avatarUrl ?? profile.imageUrl ?? null,
                });
              }
            }
          }
        }
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [projectId]);

  const updateStatus = async (status: string) => {
    const token = await getAuthToken();
    const res = await fetch(`/api/v1/projects/${projectId}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update status");
    setProject((prev) => prev ? { ...prev, status } : prev);
  };

  const handlePartially = async () => {
    setActionSubmitting(true);
    try {
      await updateStatus("PARTIALLY_COMPLETED");
      showPartiallyToast();
    } catch {
      // fail silently
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleRateSubmit = async (rating: number, review: string, addToFavorites: boolean) => {
  setActionSubmitting(true);
  try {
    const token = await getAuthToken();
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    const payload = {
      projectId,
      rating,
      reviewMessage: review,
      props: [],
      addToFavorites,
    };
    console.log("⭐ Submitting review:", payload);

    const reviewRes = await fetch(`/api/v1/reviews`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(payload),
    });

    console.log("📡 Review response status:", reviewRes.status);
    const reviewJson = await reviewRes.json();
    console.log("📦 Review response body:", reviewJson);

    if (!reviewRes.ok) {
      throw new Error(reviewJson?.message ?? "Failed to submit review");
    }

      if (addToFavorites && creative?.creativeId) {
        await fetch(`/api/v1/favorites`, {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({ creativeId: creative.creativeId }),
        }).catch(() => { });
      }

      showReviewCreativeToast();
      setShowRateModal(false);
      router.push("/client/my-desk");
    } catch (err: any) {
      console.error("Review submit error:", err);
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleRevisionSubmit = async (notes: string) => {
    setActionSubmitting(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`/api/v1/projects/${projectId}/request-revision`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ requestNotes: notes }),
      });
      if (!res.ok) throw new Error("Failed to request revision");
      setProject((prev) => prev
        ? { ...prev, status: "REVISION", revisionsUsed: (prev.revisionsUsed ?? 0) + 1 }
        : prev
      );
      setShowModal(false);
      showRevisionToast();
    } catch {
      // fail silently
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleCompleted = async () => {
    setActionSubmitting(true);
    try {
      await updateStatus("COMPLETED");
      setShowCongratsModal(true);
    } catch {
      // fail silently
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleAuthorizePayout = async () => {
    setActionSubmitting(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`/api/v1/projects/${projectId}/authorize-payout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to authorize payout");
      setShowCongratsModal(false);
      setShowReleasedModal(true);
    } catch (err) {
      console.error("payout error", err);
    } finally {
      setActionSubmitting(false);
    }
  };

  // For MILESTONE projects: the congrats modal closes to dashboard,
  // since milestone payouts auto-release within 48h (no manual authorize step).
  const handleMilestoneGoToDashboard = () => {
    setShowCongratsModal(false);
    router.push("/client/my-desk");
  };

  const handleMarkMilestoneComplete = async (milestoneId: string) => {
    if (!project) return;
    setMilestoneSubmittingId(milestoneId);
    try {
      const token = await getAuthToken();
      const res = await fetch(`/api/v1/projects/${projectId}/milestones/${milestoneId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to mark milestone completed");

      const updatedMilestones = project.milestones.map((m) =>
        m.id === milestoneId ? { ...m, isCompleted: true, completedAt: new Date().toISOString() } : m
      );
      const allCompleted = updatedMilestones.every((m) => m.isCompleted);

      setProject((prev) => prev ? { ...prev, milestones: updatedMilestones } : prev);

      if (allCompleted) {
        try {
          await updateStatus("COMPLETED");
        } catch {
          // fail silently
        }
        setShowCongratsModal(true);
      } else {
        toast.success("Milestone marked as completed.");
      }
    } catch {
      toast.error("Failed to mark milestone as completed. Please try again.");
    } finally {
      setMilestoneSubmittingId(null);
    }
  };

  const handleReleaseBookingFee = async () => {
    setBookingFeeSubmitting(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`/api/v1/projects/${projectId}/release-booking-fee`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to release booking fee");
      const json = await res.json();
      setBookingFeeReleased(true);
      setProject((prev) => prev ? { ...prev, progressPercentage: 50 } : prev);
      toast.success(json?.message ?? "Booking fee released to creative wallet.");
    } catch {
      toast.error("Failed to release booking fee. Please try again.");
    } finally {
      setBookingFeeSubmitting(false);
    }
  };

  const handleAskForRevision = () => {
    const used = project?.revisionsUsed ?? 0;
    const allowed = project?.revisionsAllowed ?? 2;
    if (used >= allowed) {
      toast.error(
        `You've used all ${allowed} revision${allowed !== 1 ? "s" : ""}. Contact support to request more.`,
        { duration: 4000 }
      );
      return;
    }
    setShowModal(true);
  };

  const handleDownload = (fileUrl: string) => {
    window.open(fileUrl, "_blank");
  };

  const userName = clientProfile?.clientProfile?.fullName || clientProfile?.name || "Client";
  const userAvatar =
    clientProfile?.clientProfile?.imageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

  const creativeName = creative?.fullName ?? creative?.name ?? "Creative";
  const creativeAvatar =
    creative?.imageUrl ??
    creative?.avatarUrl ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(creativeName)}&background=1a1a2e&color=fff&size=128`;
  const creativeRole = creative?.professionalRole ?? "Creative";

  const briefRows = project?.brief ? [
    { label: "Job Title", value: project.brief.jobTitle ?? "—" },
    { label: "Job Description", value: project.brief.jobDescription ?? "—" },
    { label: "Timeline", value: project.brief.timeline ?? "—" },
    { label: "Delivery Date", value: project.brief.deliveryDate ? new Date(project.brief.deliveryDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—" },
  ] : [];

  const revisionsUsed = project?.revisionsUsed ?? 0;
  const revisionsAllowed = project?.revisionsAllowed ?? 2;
  const revisionLimitReached = revisionsUsed >= revisionsAllowed;
  const isMilestoneProject = project?.paymentMode === "MILESTONE";
  const isBookingBalanceProject = project?.paymentMode === "BOOKING_BALANCE";

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#E2554F]" size={40} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {showModal && (
        <RevisionsModal
          onClose={() => setShowModal(false)}
          onSubmit={handleRevisionSubmit}
          projectTitle={project?.title ?? "—"}
          submitting={actionSubmitting}
          revisionsUsed={revisionsUsed}
          revisionsAllowed={revisionsAllowed}
        />
      )}
      {showCongratsModal && (
        <CongratulationsModal
          onClose={() => setShowCongratsModal(false)}
          onGoToDashboard={isMilestoneProject ? handleMilestoneGoToDashboard : handleAuthorizePayout}
          submitting={actionSubmitting}
          paymentMode={project?.paymentMode}
        />
      )}
      {showReleasedModal && (
        <ReleasedModal
          onClose={() => setShowReleasedModal(false)}
          onGoToDashboard={() => { setShowReleasedModal(false); setShowRateModal(true); }}
        />
      )}
      {showRateModal && (
        <RateAndReviewModal
          onClose={() => setShowRateModal(false)}
          onSubmit={handleRateSubmit}
          creativeAvatar={creativeAvatar}
          creativeName={creativeName}
          creativeRole={creativeRole}
        />
      )}
      {showDisputeModal && (
        <ReportDisputeModal
          onClose={() => setShowDisputeModal(false)}
          projectId={projectId}
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
          <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <div className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-10`}>
          <button className="absolute top-4 right-4 z-50 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={22} />
          </button>
          <Sidebar activeItem="My Desk" />
        </div>

        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <Breadcrumb crumbs={[
            { label: "Dashboard", path: "/client/dashboard" },
            { label: "My Desk", path: "/client/my-desk" },
            { label: "View Project" },
          ]} />

          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("view")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${activeTab === "view" ? "bg-white border-red-200 text-black" : "bg-white border-red-200 text-black hover:bg-gray-200"}`}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                View Project
              </button>
              <button
                onClick={() => setActiveTab("review")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${activeTab === "review" ? "bg-[#E2554F] border-[#E2554F] text-white" : "bg-[#E2554F] border-[#E2554F] text-white hover:bg-red-300"}`}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                Review Deliverables
              </button>
            </div>
            <button
              onClick={() => setShowDisputeModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              <AlertCircle size={15} className="text-[#E05C5C]" />
              Report a Dispute
            </button>
          </div>

          {activeTab === "view" ? (
            <>
              <div className="bg-[#fafafa] p-6 mb-4 text-center">
                <h2 className="text-xl font-bold text-black mb-2">{project?.title ?? "—"}</h2>
                <span className={`inline-block px-4 py-1 text-xs font-semibold rounded-full mb-4 ${statusColorMap[project?.status ?? ""] ?? "bg-gray-100 text-gray-600"}`}>
                  {statusLabelMap[project?.status ?? ""] ?? project?.status ?? "—"}
                </span>
                <div className="flex items-center gap-3 mb-3 max-w-md mx-auto">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#e84545] rounded-full" style={{ width: `${project?.progressPercentage ?? 0}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-black">{project?.progressPercentage ?? 0}%</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-black">
                  <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.5}>
                    <circle cx="10" cy="10" r="8" />
                    <path strokeLinecap="round" d="M10 6v4l2.5 2.5" />
                  </svg>
                  <span>Due in {project?.dueDate ? getDueIn(project.dueDate) : "—"}</span>
                </div>
                {isBookingBalanceProject && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col items-center gap-2">
                    <p className="text-xs text-gray-500">
                      {bookingFeeReleased
                        ? "Booking fee has been released to your creative."
                        : "Release the upfront booking fee to your creative to move this project to 50% progress."}
                    </p>
                    <button
                      onClick={handleReleaseBookingFee}
                      disabled={bookingFeeSubmitting || bookingFeeReleased}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#E2554F] hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bookingFeeSubmitting && <Loader2 size={14} className="animate-spin" />}
                      {bookingFeeReleased ? (
                        <>
                          <Check size={15} /> Booking Fee Released
                        </>
                      ) : (
                        "Release Booking Fee"
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-[#fafafa] p-6 mb-4">
                <div className="flex items-start justify-between">
                  <h2 className="text-base font-bold text-black">Creative</h2>
                  {creative?.isPremium && (
                    <span className="px-4 py-1.5 bg-orange-400 text-white text-xs font-semibold rounded-md">Premium</span>
                  )}
                </div>
                <div className="flex items-start gap-4 mt-4">
                  <div className="relative shrink-0">
                    <Image src={creativeAvatar} alt={creativeName} width={64} height={64} className="rounded-full object-cover" />
                    <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-black text-xl">{creativeName}</p>
                    <p className="text-xs text-green-500 font-medium mt-0.5">● Online</p>
                    <p className="text-sm text-black mt-2">Verification Status:</p>
                    <span className={`inline-block mt-1 px-3 py-0.5 text-xs font-semibold rounded-full ${creative?.isVerified ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                      {creative?.isVerified ? "Verified" : "Unverified"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-8 mt-4 pt-4 text-sm text-black">
                  <div className="flex items-center gap-1">
                    <StarIcon />
                    <span className="font-medium text-black">{creative?.overallRating?.toFixed(1) ?? "—"}</span>
                  </div>
                  <p className="text-xs text-gray-500">{creativeRole}</p>
                </div>
              </div>

              <CollapsibleSection title="Brief Summary">
                <table className="w-full text-sm">
                  <tbody>
                    {briefRows.map((row) => (
                      <tr key={row.label} className="border-b border-gray-50 last:border-0">
                        <td className="py-2.5 pr-6 text-black font-medium w-36 align-top">{row.label}</td>
                        <td className="py-2.5 text-black">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CollapsibleSection>

              <CollapsibleSection title="Milestones">
                {project?.milestones && project.milestones.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {project.milestones.map((m, i) => (
                      <div key={m.id} className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-lg bg-white">
                        <div>
                          <p className="text-sm font-semibold text-black">{m.title ?? `Milestone ${i + 1}`}</p>
                          {m.completedAt && (
                            <p className="text-xs text-black mt-0.5">
                              Completed {new Date(m.completedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          )}
                        </div>
                        {isMilestoneProject && !m.isCompleted ? (
                          <button
                            onClick={() => handleMarkMilestoneComplete(m.id)}
                            disabled={milestoneSubmittingId === m.id}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[#E2554F] hover:bg-red-600 text-white transition-colors disabled:opacity-50"
                          >
                            {milestoneSubmittingId === m.id && <Loader2 size={12} className="animate-spin" />}
                            Mark Complete
                          </button>
                        ) : (
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${m.isCompleted ? "bg-green-100 text-green-600" : "bg-red-100 text-red-400"}`}>
                            {m.isCompleted ? "Completed" : "Pending"}
                          </span>
                        )}
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
                  <h2 className="text-xl font-bold text-black mb-1">{project?.title ?? "—"}</h2>
                  <span className={`inline-block px-3 py-0.5 text-xs font-semibold rounded-full mb-3 ${statusColorMap[project?.status ?? ""] ?? "bg-gray-100 text-gray-600"}`}>
                    {statusLabelMap[project?.status ?? ""] ?? project?.status ?? "—"}
                  </span>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#e84545] rounded-full" style={{ width: `${project?.progressPercentage ?? 0}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-black">{project?.progressPercentage ?? 0}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-black">
                    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.5}>
                      <circle cx="10" cy="10" r="8" />
                      <path strokeLinecap="round" d="M10 6v4l2.5 2.5" />
                    </svg>
                    <span>Due in {project?.dueDate ? getDueIn(project.dueDate) : "—"}</span>
                  </div>
                  {isBookingBalanceProject && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={handleReleaseBookingFee}
                        disabled={bookingFeeSubmitting || bookingFeeReleased}
                        className="flex items-center gap-2 px-5 py-2 bg-[#E2554F] hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {bookingFeeSubmitting && <Loader2 size={12} className="animate-spin" />}
                        {bookingFeeReleased ? (
                          <>
                            <Check size={13} /> Booking Fee Released
                          </>
                        ) : (
                          "Release Booking Fee"
                        )}
                      </button>
                    </div>
                  )}
                </div>
                <div className="bg-[#fafafa] p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <Image src={creativeAvatar} alt={creativeName} width={48} height={48} className="rounded-full object-cover" />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-black text-xl">{creativeName}</p>
                      <p className="text-xs text-black">{creativeRole}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-black">
                        <div className="flex items-center gap-0.5">
                          <StarIcon />
                          <span className="font-semibold">{creative?.overallRating?.toFixed(1) ?? "—"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-[#1c1c3a] flex items-center justify-center">
                    <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" clipRule="evenodd" />
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
                          <td className="py-2 pr-4 text-black font-medium w-32 align-top text-sm">{row.label}</td>
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
                    <>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {deliverables.map((d, i) => {
                          const ext = d.fileName?.split(".").pop()?.toLowerCase() ?? "";
                          const isImage = d.mimeType?.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
                          return (
                            <div key={d.id ?? i} className="h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 flex items-center justify-center">
                              {isImage ? (
                                <img
                                  src={d.fileUrl}
                                  alt={d.fileName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                />
                              ) : (
                                <span className="text-xs font-semibold text-gray-500 uppercase">{ext || "FILE"}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {deliverables.map((d) => (
                          <button
                            key={d.id}
                            onClick={() => handleDownload(d.fileUrl)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#e84545] hover:bg-[#d03535] text-white text-sm font-semibold rounded-lg transition-colors"
                          >
                            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            {d.fileName ?? "Download"}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">No deliverables uploaded yet.</p>
                  )}
                </CollapsibleSection>
              </div>

              <CollapsibleSection title="Milestones">
                {project?.milestones && project.milestones.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {project.milestones.map((m, i) => (
                      <div key={m.id} className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-lg bg-white">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{m.title ?? `Milestone ${i + 1}`}</p>
                          {m.completedAt && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Completed {new Date(m.completedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          )}
                        </div>
                        {isMilestoneProject && !m.isCompleted ? (
                          <button
                            onClick={() => handleMarkMilestoneComplete(m.id)}
                            disabled={milestoneSubmittingId === m.id}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[#E2554F] hover:bg-red-600 text-white transition-colors disabled:opacity-50"
                          >
                            {milestoneSubmittingId === m.id && <Loader2 size={12} className="animate-spin" />}
                            Mark Complete
                          </button>
                        ) : (
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${m.isCompleted ? "bg-green-100 text-green-600" : "bg-red-100 text-red-400"}`}>
                            {m.isCompleted ? "Completed" : "Pending"}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No milestones set.</p>
                )}
              </CollapsibleSection>

              <CollapsibleSection title="Message">
                <div className="flex flex-col gap-3">
                  {deliverables.length > 0 ? (
                    deliverables.map((d) => (
                      <div key={d.id} className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-sm text-black">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-500">
                            Delivery Type: {d.deliverableType ?? d.type ?? "—"}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            d.reviewStatus === "APPROVED"
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
                        </div>
                        <p className="text-sm text-black">
                          {d.creativeNote ?? "No message from creative."}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">No message from creative yet.</p>
                  )}
                </div>
              </CollapsibleSection>

              <div className="bg-white border border-gray-100 rounded-xl p-6 mb-10">
                <p className="text-sm text-black mb-6 font-medium text-center">
                  Done reviewing? Pick an option below to update the project status.
                </p>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-xs text-gray-400">Need changes made?</p>
                    <button
                      onClick={handleAskForRevision}
                      disabled={actionSubmitting}
                      className={`px-6 py-2.5 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
                        revisionLimitReached
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-yellow-400 hover:bg-yellow-500"
                      }`}
                    >
                      Ask for Revision
                      <span className="text-xs opacity-75">
                        ({revisionsUsed}/{revisionsAllowed})
                      </span>
                    </button>
                  </div>

                  {!isMilestoneProject && (
                    <button
                      onClick={handleCompleted}
                      disabled={actionSubmitting}
                      className="px-8 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {actionSubmitting && <Loader2 size={13} className="animate-spin" />}
                      Completed
                    </button>
                  )}

                  <div className="flex flex-col items-center gap-1">
                    <p className="text-xs text-gray-400">Issues with your project?</p>
                    <button
                      onClick={() => setShowDisputeModal(true)}
                      className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                    >
                      <AlertCircle size={15} className="text-[#E05C5C]" />
                      Report a Dispute
                    </button>
                  </div>
                </div>
                {isMilestoneProject && (
                  <p className="text-xs text-gray-400 text-center mt-4">
                    For milestone-based projects, mark each milestone complete in the Milestones section above. The project will be marked completed once all milestones are done.
                  </p>
                )}
              </div>
            </>
          )}
          <div className="pb-10" />
        </main>
      </div>
    </div>
  );
}