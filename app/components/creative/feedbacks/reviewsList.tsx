"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Review } from "@/app/types";
import { feedbackReviews } from "@/app/data";

const filterChips = ["All", "Positive", "Critical", "5", "4"];
const PAGE_SIZE = 4;

const ReviewsList: React.FC = () => {
  const [activeChip, setActiveChip] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = feedbackReviews.filter((r) => {
    if (activeChip === "All") return true;
    if (activeChip === "Positive") return r.rating >= 4;
    if (activeChip === "Critical") return r.rating < 4;
    return r.rating === Number(activeChip);
  });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div>
      {/* Props header + chips */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <h2 className="text-lg font-bold text-gray-900">Props</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {filterChips.map((chip) => (
            <button
              key={chip}
              onClick={() => { setActiveChip(chip); setVisibleCount(PAGE_SIZE); }}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                activeChip === chip
                  ? "bg-[#E2554F] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {chip}
              {(chip === "5" || chip === "4") && (
                <Star size={11} className="fill-current" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-[#fafafa] p-8 flex flex-col gap-3">
        {visible.map((review) => (
          <div key={review.id} className="bg-white rounded-xl p-4">
            <div className="flex items-start gap-3 mb-2">
              <img
                src={review.avatar}
                alt={review.name}
                className="w-16 h-16 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-black text-md">{review.name}</p>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-black">{review.rating.toFixed(1)}</span>
                  <span className="text-sm text-gray-400">{review.timeAgo}</span>
                </div>
              </div>
            </div>
            <p className="text-md text-black leading-relaxed">{review.comment}</p>
          </div>
        ))}
      </div>

      {/* See More */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="flex items-center gap-2 bg-[#E2554F] hover:bg-red-600 text-white font-semibold px-10 py-2.5 rounded-lg transition-colors text-sm"
          >
            <span className="text-lg"></span>
            See More
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsList;