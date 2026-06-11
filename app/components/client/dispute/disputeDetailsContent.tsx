"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, X, Download, FileText, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchDisputeById, DisputeDetail, DisputeStatus } from "@/app/lib/api/disputeApi";
import { formatDistanceToNow } from "date-fns";

const statusStyles: Record<DisputeStatus, string> = {
  OPEN: "bg-yellow-100 text-yellow-700",
  UNDER_REVIEW: "bg-orange-100 text-orange-500",
  RESOLVED: "bg-green-100 text-green-600",
  CLOSED: "bg-gray-800 text-white",
};

const STATUS_LABEL: Record<DisputeStatus, string> = {
  OPEN: "Open",
  UNDER_REVIEW: "Under Review",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const DisputeDetailsContent = ({ id }: { id: string }) => {
  const router = useRouter();
  const [dispute, setDispute] = useState<DisputeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDisputeById(id)
      .then(setDispute)
      .catch((err) => setError(err.message || "Failed to load dispute"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-20 flex flex-col items-center gap-3 text-gray-400">
        <div className="w-8 h-8 border-2 border-[#E05C5C] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-black">Loading dispute details...</p>
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-black">
        <p className="text-lg font-heading font-semibold">{error || "Dispute not found"}</p>
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
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${statusStyles[dispute.status]}`}>
            {STATUS_LABEL[dispute.status]}
          </span>
          <div className="mt-4 text-black flex flex-col gap-2">
            <Row label="Dispute ID:" value={`#DSP-${dispute.id.slice(0,4).toUpperCase()}`} />
            <Row
              label="Dispute Date:"
              value={formatDistanceToNow(new Date(dispute.createdAt), { addSuffix: true })}
            />
          </div>
        </div>

        <Divider />

        {/* Transaction Details */}
        <div>
          <h2 className="text-base font-bold text-black font-heading mb-3">Transaction Details</h2>
          <div className="flex flex-col gap-2">
            <Row label="Project ID:" value={`#PRJ-${dispute.projectId.slice(0,4).toUpperCase()}`} />
            <Row label="Issue Type:" value={dispute.issueType} />
            {dispute.preferredOutcome && (
              <Row label="Preferred Outcome:" value={dispute.preferredOutcome} />
            )}
          </div>
        </div>

        <Divider />

        {/* Description */}
        <div>
          <h2 className="text-base font-bold font-heading text-black mb-2">Description</h2>
          <p className="text-sm font-body text-black leading-relaxed">{dispute.description}</p>
        </div>

        {/* Attached Evidence */}
        {dispute.evidenceUrls && dispute.evidenceUrls.length > 0 && (
          <>
            <Divider />
            <div>
              <h2 className="text-base font-bold font-heading text-black mb-3">
                Attached Documents
              </h2>
              <div className="flex flex-col gap-3">
                {dispute.evidenceUrls.map((url, i) => {
                  const isPdf = url.toLowerCase().endsWith(".pdf");
                  const fileName = url.split("/").pop() || `Evidence ${i + 1}`;
                  return (
                    <FileRow
                      key={i}
                      icon={
                        isPdf
                          ? <FileText size={18} className="text-red-500" />
                          : <ImageIcon size={18} className="text-gray-500" />
                      }
                      name={fileName}
                      url={url}
                    />
                  );
                })}
              </div>
            </div>
          </>
        )}

        <Divider />

        {/* Dispute Status */}
        <div>
          <h2 className="text-base font-bold font-heading text-black mb-3">Dispute Status</h2>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center mt-0.5 shrink-0">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-black">{STATUS_LABEL[dispute.status]}</p>
              {dispute.updatedAt && (
                <p className="text-xs text-black mt-0.5">
                  {formatDistanceToNow(new Date(dispute.updatedAt), { addSuffix: true })}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <button className="w-[30%] mx-auto mt-5 bg-[#E05C5C] text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 text-base">
        Contact Support
      </button>
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

const FileRow = ({ icon, name, url }: { icon: React.ReactNode; name: string; url: string }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-sm text-gray-700">{name}</span>
    </div>
    <a href={url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600">
      <Download size={16} />
    </a>
  </div>
);

export default DisputeDetailsContent;