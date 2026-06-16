"use client";
import { useState } from "react";
import { Star } from "lucide-react";
import { Review } from "@/app/types";

interface ReviewsListProps {
  reviews: Review[];
  loading: boolean;
}

const filterChips = ["All", "Positive", "Critical", "5", "4"];
const PAGE_SIZE = 4;

const ReviewsList: React.FC<ReviewsListProps> = ({ reviews, loading }) => {
  const [activeChip, setActiveChip] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = reviews.filter((r) => {
    if (activeChip === "All") return true;
    if (activeChip === "Positive") return r.rating >= 4;
    if (activeChip === "Critical") return r.rating < 4;
    return r.rating === Number(activeChip);
  });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  if (loading) {
    return (
      <div className="bg-[#fafafa] p-8 flex flex-col gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <h2 className="text-lg font-bold font-heading text-gray-900">Props</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {filterChips.map((chip) => (
            <button
              key={chip}
              onClick={() => { setActiveChip(chip); setVisibleCount(PAGE_SIZE); }}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium font-body transition-colors ${
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

      <div className="bg-[#fafafa] p-8 flex flex-col gap-3">
        {visible.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-6">No reviews found.</p>
        ) : (
          visible.map((review) => (
            <div key={review.id} className="bg-white rounded-xl p-4">
              <div className="flex items-start gap-3 mb-2">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold font-heading text-black text-md">{review.name}</p>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium font-body text-black">{review.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-400">{review.timeAgo}</span>
                  </div>
                </div>
              </div>
              <p className="text-md text-black font-body leading-relaxed">{review.comment}</p>
            </div>
          ))
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="flex items-center gap-2 bg-[#E2554F] hover:bg-red-600 text-white font-body font-semibold px-10 py-2.5 rounded-lg transition-colors text-sm"
          >
            <span className="text-lg">+</span>
            See More
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsList;