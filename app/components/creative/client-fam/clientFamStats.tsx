interface Props {
  total: number;
  thisMonth: number;
  activePercent: number;
}

const ClientFamStats: React.FC<Props> = ({ total, thisMonth, activePercent }) => {
  const stats = [
    { value: total, label: "Total Client\nFam" },
    { value: thisMonth, label: "This Month\nSubscribers" },
    { value: `${activePercent}%`, label: "Active\nClient Fam" },
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-cyan-50 w-[80%] mx-auto lg:w-full border border-cyan-100 rounded-xl px-6 py-5 text-center">
          <p className="text-4xl font-bold text-gray-900 mb-1">{s.value}</p>
          <p className="text-sm text-gray-500 whitespace-pre-line leading-snug">{s.label}</p>
        </div>
      ))}
    </div>
  );
};

export default ClientFamStats;