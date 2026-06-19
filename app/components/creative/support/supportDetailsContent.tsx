"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, X, Download, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchSupportCaseById, SupportCaseDetail, CaseStatus } from "@/app/lib/api/supportApi";
import { formatDistanceToNow } from "date-fns";
import CaseChatModal from "./caseChatModal";

const statusStyles: Record<CaseStatus, string> = {
  OPEN: "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-800 text-white",
};

const STATUS_LABEL: Record<CaseStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const CASE_TYPE_LABELS: Record<string, string> = {
  PAYMENT_ISSUE: "Payment Issue",
  LOGIN_PROBLEM: "Login Problem",
  PROFILE_VERIFICATION: "Profile Verification",
  APP_BUG: "App Bug",
  OTHER: "Other",
};

const getCaseTypeLabel = (value: string) => CASE_TYPE_LABELS[value] ?? value;

const SupportDetailsContent = ({ id }: { id: string }) => {
  const router = useRouter();
  const [supportCase, setSupportCase] = useState<SupportCaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    fetchSupportCaseById(id)
      .then(setSupportCase)
      .catch((err) => setError(err.message || "Failed to load report"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-20 flex flex-col items-center gap-3 text-gray-400">
        <div className="w-8 h-8 border-2 border-[#E05C5C] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-black">Loading report details...</p>
      </div>
    );
  }

  if (error || !supportCase) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-black">
        <p className="text-lg font-heading font-semibold">{error || "Report not found"}</p>
        <button onClick={() => router.back()} className="mt-4 text-[#E05C5C] text-sm underline">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="p-1 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-bold font-heading text-black">Details</h1>
        <button onClick={() => router.back()} className="p-1 text-gray-600 hover:text-gray-900">
          <X size={22} />
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-gray-50 rounded-2xl p-5 flex flex-col gap-5">

        {/* Status + IDs */}
        <div>
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${statusStyles[supportCase.status]}`}>
            {STATUS_LABEL[supportCase.status]}
          </span>
          <div className="mt-4 text-black flex flex-col gap-2">
            <Row label="Case ID:" value={`#${supportCase.caseNumber}`} />
            <Row
              label="Report Date:"
              value={formatDistanceToNow(new Date(supportCase.createdAt), { addSuffix: true })}
            />
          </div>
        </div>

        <Divider />

        {/* Case Details */}
        <div>
          <h2 className="text-base font-bold text-black font-heading mb-3">Case Details</h2>
          <div className="flex flex-col gap-2">
            <Row label="Issue Type:" value={getCaseTypeLabel(supportCase.caseType)} />
          </div>
        </div>

        <Divider />

        {/* Description */}
        <div>
          <h2 className="text-base font-bold font-heading text-black mb-2">Description</h2>
          <p className="text-sm font-body text-black leading-relaxed">{supportCase.description}</p>
        </div>

        {/* Attached Screenshot */}
        {supportCase.screenshotUrl && (
          <>
            <Divider />
            <div>
              <h2 className="text-base font-bold font-heading text-black mb-3">
                Attached Evidence
              </h2>
              <a href={supportCase.screenshotUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={supportCase.screenshotUrl}
                  alt="Evidence"
                  className="rounded-lg w-full object-cover max-h-60"
                />
              </a>
            </div>
          </>
        )}

        <Divider />

        {/* Case Status */}
        <div>
          <h2 className="text-base font-bold font-heading text-black mb-3">Case Status</h2>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center mt-0.5 shrink-0">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-black">{STATUS_LABEL[supportCase.status]}</p>
              {supportCase.updatedAt && (
                <p className="text-xs text-black mt-0.5">
                  {formatDistanceToNow(new Date(supportCase.updatedAt), { addSuffix: true })}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Support — opens case chat */}
      <button
        onClick={() => setChatOpen(true)}
        className="w-[30%] mx-auto mt-5 bg-[#E05C5C] text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 text-base"
      >
        <MessageCircle size={18} />
        Contact Support
      </button>

      <CaseChatModal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        supportCaseId={supportCase.id}
        caseNumber={supportCase.caseNumber}
      />
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="text-gray-900 font-medium">{value}</span>
  </div>
);

const Divider = () => <hr className="border-gray-200" />;

export default SupportDetailsContent;