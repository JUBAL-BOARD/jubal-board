"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, X, Download, FileText, Image as ImageIcon, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

type DisputeStatus = "Open" | "Under Review" | "Resolved" | "Closed";

interface DisputeDetail {
  id: string;
  status: DisputeStatus;
  disputeDate: string;
  creative: string;
  issueType: string;
  projectCost: string;
  projectDate: string;
  description: string;
  documents: { name: string; type: "pdf" | "image" }[];
  statusHistory: { label: string; date: string }[];
}

// Replace this with your actual API/fetch logic
const fetchDisputeById = async (id: string): Promise<DisputeDetail> => {
  // Simulate API call
  return {
    id: `#${id.toUpperCase()}`,
    status: "Open",
    disputeDate: "28th Dec. 2026",
    creative: "Natasha Eden",
    issueType: "Poor Quality",
    projectCost: "$100",
    projectDate: "28th Dec. 2026, 11:00am",
    description:
      "Final delivery did not meet agreed specs. Final delivery did not meet agreed specs.",
    documents: [
      { name: "Wireframes_v1.pdf", type: "pdf" },
      { name: "Homepage_Mockup.png", type: "image" },
    ],
    statusHistory: [{ label: "Under Review", date: "29th Dec. 2026" }],
  };
};

const statusStyles: Record<DisputeStatus, string> = {
  Open: "bg-yellow-100 text-yellow-700",
  "Under Review": "bg-orange-100 text-orange-500",
  Resolved: "bg-green-100 text-green-600",
  Closed: "bg-gray-800 text-white",
};

const DisputeDetailsContent = ({ id }: { id: string }) => {
  const router = useRouter();
  const [dispute, setDispute] = useState<DisputeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisputeById(id)
      .then(setDispute)
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

  if (!dispute) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-black">
        <p className="text-lg font-heading font-semibold">Dispute not found</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-[#E05C5C] text-sm underline"
        >
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
            {dispute.status}
          </span>
          <div className="mt-4 text-black flex flex-col gap-2">
            <Row label="Dispute ID:" value={dispute.id} />
            <Row label="Dispute Date:" value={dispute.disputeDate} />
          </div>
        </div>

        <Divider />

        {/* Transaction Details */}
        <div>
          <h2 className="text-base font-bold text-black font-heading mb-3">Transaction Details</h2>
          <div className="flex flex-col gap-2">
            <Row label="Creative:" value={dispute.creative} />
            <Row label="Issue Type:" value={dispute.issueType} />
            <Row label="Project Cost:" value={dispute.projectCost} />
            <Row label="Project Date:" value={dispute.projectDate} />
          </div>
        </div>

        <Divider />

        {/* Description */}
        <div>
          <h2 className="text-base font-bold font-heading text-black mb-2">Description</h2>
          <p className="text-sm font-body text-black leading-relaxed">{dispute.description}</p>
        </div>

        <Divider />

        {/* Attached Documents */}
        <div>
          <h2 className="text-base font-bold font-heading text-black mb-3">Attached Documents</h2>
          <div className="flex flex-col gap-3">
            {dispute.documents.map((doc, i) => (
              <FileRow
                key={i}
                icon={
                  doc.type === "pdf"
                    ? <FileText size={18} className="text-red-500" />
                    : <ImageIcon size={18} className="text-gray-500" />
                }
                name={doc.name}
              />
            ))}
          </div>
        </div>

        <Divider />

        {/* Dispute Status Timeline */}
        <div>
          <h2 className="text-base font-bold font-heading text-black mb-3">Dispute Status</h2>
          <div className="flex flex-col gap-3">
            {dispute.statusHistory.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center mt-0.5 shrink-0">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-black">{s.label}</p>
                  <p className="text-xs text-black mt-0.5">{s.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Support Button */}
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

const FileRow = ({ icon, name }: { icon: React.ReactNode; name: string }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-sm text-gray-700">{name}</span>
    </div>
    <button className="text-gray-400 hover:text-gray-600">
      <Download size={16} />
    </button>
  </div>
);

export default DisputeDetailsContent;