interface Props {
  yearsOfExperience: number;
  totalClients: number;
  totalReviews: number;
}

const ProfileStats: React.FC<Props> = ({ yearsOfExperience, totalClients, totalReviews }) => {
  const stats = [
    { value: yearsOfExperience, suffix: "", label: "years of experience" },
    { value: totalClients, suffix: "+", label: "Total Clients" },
    { value: totalReviews, suffix: "", label: "Total Reviews" },
  ];

  return (
    <div className="bg-[#fafafa] p-5">
      <div className="grid grid-cols-3 divide-x divide-gray-200">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center px-4 py-2">
            <p className="text-3xl font-bold text-black mb-1">
              {s.value}{s.suffix}
            </p>
            <p className="text-lg text-black text-center">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileStats;