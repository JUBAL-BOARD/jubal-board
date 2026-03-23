"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Star, BadgeCheck, MessageCircle } from "lucide-react";
import { Creative } from "../../../types";

interface Props {
  creatives: Creative[];
}

const CreativeCard: React.FC<{ creative: Creative }> = ({ creative }) => (
  <div className="bg-white border border-gray-200 rounded-[10px] overflow-hidden min-w-[300px] h-[400px] flex-shrink-0">

    {/* Portfolio Image */}
    <div className="relative h-[250px]">
      <Image
        src={creative.portfolioImg}
        alt="portfolio"
        fill
        className="object-cover"
      />
      {creative.premium && (
        <span className="absolute bottom-2 right-2 bg-[#F59E0B] text-white text-[10px] font-bold px-2 py-0.5 rounded">
          Premium
        </span>
      )}
    </div>

    {/* Info */}
    <div className="px-3.5 pt-[30px] pb-3.5">
      <div className="flex items-center justify-between">

        {/* Avatar + Name */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Image
              src={creative.avatar}
              alt={creative.name}
              width={50}
              height={50}
              className="rounded-full object-cover"
            />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[13px] font-bold text-[#1a1a2e]">{creative.name}</span>
              {creative.verified && <BadgeCheck size={14} fill="#3B82F6" stroke="white" />}
            </div>
            <span className="text-[11px] text-gray-500">{creative.role}</span>
          </div>
        </div>

        {/* Message Button */}
        <div className="w-7 h-7 rounded-full bg-[#1a1a2e] flex items-center justify-center cursor-pointer">
          <MessageCircle size={14} stroke="#6B7280" />
        </div>

      </div>

      {/* Rating + View Profile */}
      <div className="flex items-center justify-between mt-2.5">
        <div className="flex items-center gap-1">
          <Star size={13} fill="#F59E0B" stroke="#F59E0B" />
          <span className="text-xs font-semibold text-gray-700">{creative.rating.toFixed(1)}</span>
        </div>
        <button className="bg-transparent border-none cursor-pointer text-xs text-[#E2554F] font-semibold hover:underline">
          View Profile
        </button>
      </div>
    </div>

  </div>
);

const SuggestedCreatives: React.FC<Props> = ({ creatives }) => {
  const [page, setPage] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const pageWidth = scrollWidth / 3;
    setPage(Math.round(scrollLeft / pageWidth));
  };

  const goToPage = (i: number) => {
    if (!scrollRef.current) return;
    const pageWidth = scrollRef.current.scrollWidth / 3;
    scrollRef.current.scrollTo({ left: pageWidth * i, behavior: "smooth" });
    setPage(i);
  };

  return (
    <div className="mb-8 bg-[#fafafa] p-5">
      <h3 className="text-[26px] font-extrabold text-[#1a1a2e] m-0 mb-4">
        Suggested Creatives
      </h3>

      {/* Scrollable Row */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {creatives.map((c, i) => <CreativeCard key={i} creative={c} />)}
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-3.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            onClick={() => goToPage(i)}
            className="h-2 rounded-full cursor-pointer transition-all duration-200"
            style={{
              width: i === page ? 8 : 8,
              background: i === page ? "#E2554F" : "#d1d5db",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SuggestedCreatives;