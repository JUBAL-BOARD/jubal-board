import { Loader2 } from "lucide-react";
import DeliverableCard from "./deliverableCard";
import type { Deliverable } from "./types";

interface DeliverablesListProps {
  deliverables: Deliverable[];
  loading: boolean;
  onDownload: (fileUrl: string) => void;
  onReview: (collabId: string, deliverableId: string, status: "APPROVED" | "REVISION_REQUESTED") => void;
}

export default function DeliverablesList({
  deliverables,
  loading,
  onDownload,
  onReview,
}: DeliverablesListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="animate-spin text-[#E2554F]" size={24} />
      </div>
    );
  }

  if (deliverables.length === 0) {
    return <p className="text-sm text-gray-400">No deliverables uploaded yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {deliverables.map((d, i) => (
        <DeliverableCard key={d.id ?? i} deliverable={d} onDownload={onDownload} onReview={onReview} />
      ))}
    </div>
  );
}