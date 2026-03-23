const stats = [
  { value: "5.0", label: "Rating" },
  { value: "35", label: "Reviews" },
  { value: "95%", label: "Postive" },
];

const FeedbackStats: React.FC = () => {
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