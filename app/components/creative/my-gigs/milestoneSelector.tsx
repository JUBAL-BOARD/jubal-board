"use client";
import { Check, ChevronDown } from "lucide-react";

interface MilestoneSelectorProps {
  milestones: { id: string; title: string }[];
  selected: string | null;
  onSelect: (id: string) => void;
}

const MilestoneSelector: React.FC<MilestoneSelectorProps> = ({
  milestones,
  selected,
  onSelect,
}) => {
  if (milestones.length === 0) return null;

  return (
    <div className="bg-[#fafafa] border border-gray-200 rounded-xl mb-4 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <span className="font-semibold text-black text-sm">Select Milestone (If applicable)</span>
        <ChevronDown size={18} className="text-gray-500" />
      </div>
      <div className="px-5 pb-5">
        <div className="grid grid-cols-2 gap-3">
          {milestones.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm transition-colors ${
                selected === m.id
                  ? "border-gray-300 bg-white"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <span className="font-medium text-gray-700">{m.title}</span>
              {selected === m.id && <Check size={16} className="text-gray-600" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MilestoneSelector;