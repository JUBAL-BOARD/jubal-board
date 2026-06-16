import { Star } from "lucide-react";

interface RatingBreakdownProps {
  averageRating: number;
  totalReviews: number;
  distribution: { star: number; count: number; total: number }[];
  loading: boolean;
}

const RatingBreakdown: React.FC<RatingBreakdownProps> = ({
  averageRating,
  totalReviews,
  distribution,
  loading,
}) => {
  return (
    <div className="bg-[#fafafa] p-8 mb-6">
      <div className="flex flex-col items-center mb-4">
        <p className="text-4xl font-bold text-gray-900 mb-2">
          {loading ? "…" : averageRating > 0 ? averageRating.toFixed(1) : "—"}
        </p>
        <div className="flex items-center gap-1 mb-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} size={28} className="text-yellow-400 fill-yellow-400" />
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {loading ? "Loading…" : `Based on ${totalReviews} review${totalReviews !== 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="space-y-2.5 max-w-lg mx-auto">
        {distribution.map((row) => (
          <div key={row.star} className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-3 text-right">{row.star}</span>
            <Star size={13} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />
            <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all"
                style={{ width: row.total > 0 ? `${(row.count / row.total) * 100}%` : "0%" }}
              />
            </div>
            <span className="text-sm text-gray-600 w-4 text-right">{row.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingBreakdown;