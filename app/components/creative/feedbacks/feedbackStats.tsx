interface FeedbackStatsProps {
  averageRating: number;
  totalReviews: number;
  positivePercent: number;
  loading: boolean;
}

const FeedbackStats: React.FC<FeedbackStatsProps> = ({
  averageRating,
  totalReviews,
  positivePercent,
  loading,
}) => {
  const stats = [
    { value: loading ? "…" : averageRating > 0 ? averageRating.toFixed(1) : "—", label: "Rating" },
    { value: loading ? "…" : String(totalReviews), label: "Reviews" },
    { value: loading ? "…" : `${positivePercent}%`, label: "Positive" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {stats.map((s) => (
        <div key={s.label} className="bg-[#fafafa] border px-6 py-6 text-center">
          <p className="text-4xl font-bold text-[#1a1a2e] mb-2">{s.value}</p>
          <p className="text-sm text-gray-500">{s.label}</p>
        </div>
      ))}
    </div>
  );
};

export default FeedbackStats;