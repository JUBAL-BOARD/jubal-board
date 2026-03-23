import { Star } from "lucide-react";

const distribution = [
  { star: 5, count: 30, total: 35 },
  { star: 4, count: 2, total: 35 },
  { star: 3, count: 1, total: 35 },
  { star: 2, count: 1, total: 35 },
  { star: 1, count: 1, total: 35 },
];

const RatingBreakdown: React.FC = () => {
  return (
    <div className="bg-[#fafafa] p-8 mb-6">
      {/* Score + stars */}
      <div className="flex flex-col items-center mb-4">
        <p className="text-4xl font-bold text-gray-900 mb-2">5.0</p>
        <div className="flex items-center gap-1 mb-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} size={28} className="text-yellow-400 fill-yellow-400" />
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-1">Based on 35 reviews</p>
      </div>

      {/* Bar distribution */}
      <div className="space-y-2.5 max-w-lg mx-auto">
        {distribution.map((row) => (
          <div key={row.star} className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-3 text-right">{row.star}</span>
            <Star size={13} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />
            <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all"
                style={{ width: `${(row.count / row.total) * 100}%` }}
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