import { MyGig } from "@/app/types";

interface Props {
  gigs: MyGig[];
}

const GigStatsBar: React.FC<Props> = ({ gigs }) => {
  const completed = gigs.filter((g) => g.status === "Completed").length;
  const active = gigs.filter((g) => g.status === "Active" || g.status === "In Progress").length;
  const revised = gigs.filter((g) => g.status === "Revised").length;
  const onCollab = gigs.filter((g) => g.status === "Collaborating").length;

  const stats = [
    { label: "Completed Gigs", count: completed, bg: "bg-green-100", text: "text-green-700" },
    { label: "Active Gigs", count: active, bg: "bg-cyan-100", text: "text-cyan-700" },
    { label: "Revised Gigs", count: revised, bg: "bg-purple-100", text: "text-purple-700" },
    { label: "Gigs on Collab", count: onCollab, bg: "bg-amber-50", text: "text-amber-700" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className={`${s.bg} rounded-xl px-6 py-5`}>
          <p className={`text-4xl text-center font-bold ${s.text} mb-1`}>{s.count}</p>
          <p className="text-sm text-black text-center font-medium">{s.label}</p>
        </div>
      ))}
    </div>
  );
};

export default GigStatsBar;