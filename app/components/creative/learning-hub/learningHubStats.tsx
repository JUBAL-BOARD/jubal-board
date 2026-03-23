import { GraduationCap } from "lucide-react";

interface Props {
  certificationsEarned: number;
  coursesCompleted: number;
  activeCourse: number;
}

const LearningStats: React.FC<Props> = ({ certificationsEarned, coursesCompleted, activeCourse }) => {
  const stats = [
    { value: certificationsEarned, label: "Certifications\nEarned", bg: "bg-pink-100", icon: "bg-[#E2554F]" },
    { value: coursesCompleted, label: "Courses\nCompleted", bg: "bg-cyan-100", icon: "bg-cyan-500" },
    { value: activeCourse, label: "Active\nCourse", bg: "bg-pink-100", icon: "bg-[#E2554F]" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {stats.map((s) => (
        <div key={s.label} className={`${s.bg} rounded-xl px-6 py-5 flex flex-col items-center`}>
          <div className={`${s.icon} w-10 h-10 rounded-full flex items-center justify-center mb-3`}>
            <GraduationCap size={18} className="text-white" />
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-1">{s.value}</p>
          <p className="text-sm text-gray-600 text-center whitespace-pre-line leading-snug">{s.label}</p>
        </div>
      ))}
    </div>
  );
};

export default LearningStats;