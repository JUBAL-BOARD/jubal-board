import { MyGig } from "@/app/types";

interface Props {
  gigs: MyGig[];
}

const GigStatsBar: React.FC<Props> = ({ gigs }) => {
  const all = gigs.length
  const completed = gigs.filter((g) => g.status === "Completed").length;
  const active = gigs.filter((g) => g.status === "Active" || g.status === "In Progress").length;
  const revised = gigs.filter((g) => g.status === "Revised").length;
  const onCollab = gigs.filter((g) => g.status === "Collaborating").length;

  const stats = [
    { label: "All Gigs", count: all, bg: "bg-[#FFD6D4]", text: "text-black" },
    { label: "Completed Gigs", count: completed, bg: "bg-[#E5FFEC]", text: "text-black" },
    { label: "Active Gigs", count: active, bg: "bg-[#00C0E833]", text: "text-black" },
    { label: "Revised Gigs", count: revised, bg: "bg-[#CB30E033]", text: "text-black" },
    { label: "Gigs on Collab", count: onCollab, bg: "bg-[#AC7F5E33]", text: "text-black" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((s) => (
        <div key={s.label} className={`${s.bg} rounded-xl px-6 py-5`}>
          <p className={`text-4xl text-center font-bold ${s.text} mb-1`}>{s.count}</p>
          <p className="text-sm text-black text-center font-body font-medium">{s.label}</p>
        </div>
      ))}
    </div>
  );
};

export default GigStatsBar;