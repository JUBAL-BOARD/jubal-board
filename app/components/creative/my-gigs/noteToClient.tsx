"use client";
import { ChevronDown } from "lucide-react";

interface NoteToClientProps {
  value: string;
  onChange: (val: string) => void;
}

const NoteToClient: React.FC<NoteToClientProps> = ({ value, onChange }) => (
  <div className="bg-[#fafafa] border border-gray-200 rounded-xl mb-4 overflow-hidden">
    <div className="flex items-center justify-between px-5 py-4">
      <span className="font-semibold text-black text-sm">Note to Client</span>
      <ChevronDown size={18} className="text-gray-500" />
    </div>
    <div className="px-5 pb-5">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add a short message to explain your delivery"
        className="w-full h-28 px-4 py-3 text-sm bg-white text-black placeholder-black border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#e84545]/20 focus:border-[#e84545]/40 transition-all"
      />
    </div>
  </div>
);

export default NoteToClient;