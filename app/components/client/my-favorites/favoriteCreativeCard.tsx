import Image from "next/image";
import { Star, BadgeCheck, MessageSquare } from "lucide-react";
import type { FavoriteCreative } from "../../../data/favoritesData";

interface Props {
  creative: FavoriteCreative;
  isSelected: boolean;
  onSelect: (id: number) => void;
}

const FavoriteCreativeCard: React.FC<Props> = ({ creative, isSelected, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(creative.id)}
      className="flex flex-col lg:flex-row lg:items-center gap-3 px-4 py-3.5 rounded-[10px] mb-2.5 cursor-pointer transition-all duration-150"
      style={{
        border: `1.5px solid ${isSelected ? "#E85D3A" : "#e5e7eb"}`,
        background: isSelected ? "#fff5f2" : "white",
      }}
    >
      {/* Top row on mobile — avatar + info + actions */}
      <div className="flex items-start gap-3 flex-1 min-w-0">

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <Image
            src={creative.avatar}
            alt={creative.name}
            width={48}
            height={48}
            className="rounded-full object-cover"
          />
          {creative.online && (
            <div className="absolute bottom-px right-px w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[14px] font-bold text-[#1a1a2e]">{creative.name}</span>
            {creative.verified && <BadgeCheck size={14} fill="blue" stroke="white" />}
          </div>
          <p className="m-0 mb-1.5 text-xs text-gray-500">{creative.role}</p>
          <div className="flex flex-wrap items-center gap-2 lg:gap-2.5">
            <div className="flex items-center gap-0.5">
              <Star size={12} fill="#F59E0B" stroke="#F59E0B" />
              <span className="text-xs font-semibold text-gray-700">{creative.rating.toFixed(1)}</span>
            </div>
            <span className="text-xs font-semibold text-gray-700">{creative.rate}</span>
            <span className="text-[11px] text-gray-500">{creative.completedProjects} Completed</span>
          </div>
        </div>

        {/* Actions — inline on mobile (top right), column on desktop */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="w-[30px] h-[30px] rounded-full bg-[#1a1a2e] flex items-center justify-center cursor-pointer">
            <MessageSquare size={14} stroke="white" />
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(creative.id); }}
            className="bg-[#E2554F] border-none rounded-md px-3 lg:px-3.5 py-1.5 cursor-pointer text-white font-semibold text-xs whitespace-nowrap hover:bg-[#d44a44] transition-colors"
          >
            Send Brief
          </button>
        </div>

      </div>
    </div>
  );
};

export default FavoriteCreativeCard;