import Image from "next/image";
import { Star, BadgeCheck, MessageSquare } from "lucide-react";
import type { Pitch } from "../../../types";

interface Props {
  pitches: Pitch[];
}

const PitchCard: React.FC<{ pitch: Pitch }> = ({ pitch }) => (
  <div className="flex items-center gap-3 p-3.5 border border-gray-100 rounded-[10px] bg-white mb-2.5">

    {/* Avatar */}
    <div className="relative flex-shrink-0">
      <Image
        src={pitch.avatar}
        alt={pitch.name}
        width={80}
        height={80}
        className="rounded-full object-cover"
      />
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">

      {/* Name + Verified */}
      <div className="flex items-center gap-1">
        <span className="text-2xl font-bold text-[#1a1a2e]">{pitch.name}</span>
        {pitch.verified && <BadgeCheck size={14} fill="#3B82F6" stroke="white" />}
      </div>

      <span className="text-[14px] text-gray-500">{pitch.role}</span>

      {/* Rating + Rate + Projects */}
      <div className="flex items-center gap-2.5 mt-1">
        <div className="flex items-center gap-0.5">
          <Star size={13} fill="#F59E0B" stroke="#F59E0B" />
          <span className="text-[14px] text-black font-semibold">{pitch.rating.toFixed(1)}</span>
        </div>
        <span className="text-[14px] text-black font-semibold">{pitch.rate}</span>
        <span className="text-[14px] text-black">{pitch.completedProjects} Completed Projects</span>
      </div>

      {/* Actions */}
      <div className="flex gap-3.5 mt-1.5">
        <button className="bg-transparent border-none cursor-pointer text-xs text-[#E2554F] font-semibold p-0 hover:underline">
          View Profile
        </button>
        <button className="bg-transparent border-none cursor-pointer text-xs text-[#E2554F] font-semibold p-0 hover:underline">
          See Pitch
        </button>
      </div>
    </div>

    {/* Message Button */}
    <div className="w-7 h-7 rounded-full bg-[#1a1a2e] flex items-center justify-center cursor-pointer flex-shrink-0">
      <MessageSquare size={14} stroke="white" />
    </div>

  </div>
);

const IncomingPitches: React.FC<Props> = ({ pitches }) => {
  return (
    <div className="flex-1 bg-[#fafafa] p-5">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[26px] font-extrabold text-[#1a1a2e] m-0">
          Incoming Pitches
        </h3>
        <button className="bg-transparent border-none text-[#e2554f] font-semibold text-[13px] cursor-pointer hover:underline">
          View All
        </button>
      </div>
      {pitches.map((p, i) => <PitchCard key={i} pitch={p} />)}
    </div>
  );
};

export default IncomingPitches;