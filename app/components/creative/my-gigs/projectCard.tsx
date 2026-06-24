"use client";

const apiStatusToLabel = (status: string): string => {
  const map: Record<string, string> = {
    IN_PROGRESS: "In Progress", COMPLETED: "Completed", REVISED: "Revised",
    COLLABORATING: "Collaborating", PARTIALLY_COMPLETED: "Partially Completed",
    ACTIVE: "Active", PENDING_PAYMENT: "Active",
  };
  return map[status] ?? status;
};

const progressBarColor: Record<string, string> = {
  IN_PROGRESS: "bg-[#E2554F]", COMPLETED: "bg-green-500", REVISED: "bg-yellow-400",
  COLLABORATING: "bg-green-500", PARTIALLY_COMPLETED: "bg-orange-400",
  ACTIVE: "bg-blue-500", PENDING_PAYMENT: "bg-blue-500",
};

interface ProjectCardProps {
  title: string;
  status: string;
  progress: number;
  dueIn: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ title, status, progress, dueIn }) => (
  <div className="bg-[#fafafa] border border-gray-100 rounded-xl p-5 mb-4 text-center">
    <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
    <span className="inline-block px-4 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full mb-4">
      {apiStatusToLabel(status)}
    </span>
    <div className="flex w-[60%] mx-auto items-center gap-3 mb-3">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${progressBarColor[status] ?? "bg-gray-400"}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-600">{progress}%</span>
    </div>
    <div className="flex items-center justify-center gap-2 text-sm text-black">
      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="10" cy="10" r="8" />
        <path strokeLinecap="round" d="M10 6v4l2.5 2.5" />
      </svg>
      <span>Due in {dueIn}</span>
    </div>
  </div>
);

export default ProjectCard;