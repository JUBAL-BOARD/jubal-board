import { XCircle } from "lucide-react";

interface Props {
  onCancel: () => void;
  onSave: () => void;
  saveLabel?: string;
}

const SaveCancelBar: React.FC<Props> = ({ onCancel, onSave, saveLabel = "Save Changes" }) => (
  <div className="flex justify-end gap-3 mt-8">
    <button
      onClick={onCancel}
      className="flex items-center gap-2 bg-[#1a1a2e] border-none rounded-lg px-7 py-3 cursor-pointer text-white font-semibold text-[14px] hover:opacity-90 transition-opacity"
    >
      <XCircle size={16} stroke="white" /> Cancel
    </button>
    <button
      onClick={onSave}
      className="bg-[#E2554F] border-none rounded-lg px-7 py-3 cursor-pointer text-white font-bold text-[14px] hover:bg-[#d44a44] transition-colors"
    >
      {saveLabel}
    </button>
  </div>
);

export default SaveCancelBar;