import type { Deliverable } from "./types";

interface DeliverableCardProps {
  deliverable: Deliverable;
  onDownload: (fileUrl: string) => void;
  onReview: (collabId: string, deliverableId: string, status: "APPROVED" | "REVISION_REQUESTED") => void;
}

export default function DeliverableCard({ deliverable: d, onDownload, onReview }: DeliverableCardProps) {
  const ext = d.fileName?.split(".").pop()?.toLowerCase() ?? "";
  const isImage =
    d.mimeType?.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);

  return (
    <div className="border border-gray-100 rounded-lg p-3 bg-white">
      <div className="flex items-center gap-3">
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
            <span className="text-xs font-semibold text-gray-500 uppercase">{ext || "FILE"}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-black truncate">{d.fileName}</p>
          <p className="text-xs text-gray-400">{d.type}</p>
          {d.creativeNote && (
            <p className="text-xs text-gray-500 mt-0.5 italic">&quot;{d.creativeNote}&quot;</p>
          )}
          {d.isCollabDeliverable && d.reviewStatus && (
            <span
              className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
                d.reviewStatus === "APPROVED"
                  ? "bg-green-100 text-green-600"
                  : d.reviewStatus === "REVISION_REQUESTED"
                  ? "bg-orange-100 text-orange-600"
                  : "bg-yellow-100 text-yellow-600"
              }`}
            >
              {d.reviewStatus === "APPROVED"
                ? "Approved"
                : d.reviewStatus === "REVISION_REQUESTED"
                ? "Revision Requested"
                : "Pending Review"}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <button
            onClick={() => onDownload(d.fileUrl)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e84545] hover:bg-[#d03535] text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Download
          </button>
          {d.isCollabDeliverable && d.reviewStatus === "PENDING_REVIEW" && (
            <>
              <button
                onClick={() => onReview(d.collabId!, d.id, "APPROVED")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => onReview(d.collabId!, d.id, "REVISION_REQUESTED")}
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
}