"use client";
import { X, Loader2 } from "lucide-react";

interface UploadActionsProps {
  submitting: boolean;
  hasFiles: boolean;
  submitError: string | null;
  onCancel: () => void;
  onSubmit: () => void;
}

const UploadActions: React.FC<UploadActionsProps> = ({
  submitting,
  hasFiles,
  submitError,
  onCancel,
  onSubmit,
}) => (
  <div className="pb-10">
    {submitError && (
      <p className="text-sm text-red-500 mb-4 text-right">{submitError}</p>
    )}
    <div className="flex justify-end gap-3 mt-6">
      <button
        onClick={onCancel}
        className="flex items-center gap-2 px-6 py-2.5 bg-[#1c1c3a] text-white text-sm font-medium rounded-lg hover:bg-[#2a2a50] transition-colors"
      >
        <X size={15} />
        Cancel
      </button>
      <button
        onClick={onSubmit}
        disabled={submitting || !hasFiles}
        className="flex items-center gap-2 px-6 py-2.5 bg-[#e84545] text-white text-sm font-medium rounded-lg hover:bg-[#d03535] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting && <Loader2 size={14} className="animate-spin" />}
        {submitting ? "Uploading..." : "Submit Now"}
      </button>
    </div>
  </div>
);

export default UploadActions;