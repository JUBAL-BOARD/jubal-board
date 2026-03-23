import Image from "next/image";
import { MessageSquare } from "lucide-react";
import type { Project } from "../../../types";

interface Props {
  projects: Project[];
}

const ProjectRow: React.FC<{ project: Project }> = ({ project }) => (
  <div className="flex items-center gap-3 py-3 border-b border-gray-100">

    {/* Thumbnail */}
    <div className="relative w-[100px] h-[100px] flex-shrink-0">
      <Image
        src={project.thumbnail}
        alt={project.title}
        fill
        className="object-cover"
      />
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <p className="m-0 text-xl font-semibold text-[#1a1a2e]">{project.title}</p>

      {/* Assignee */}
      <div className="flex items-center gap-1.5 my-1">
        <Image
          src={project.assigneeAvatar}
          alt={project.assignee}
          width={30}
          height={30}
          className="rounded-full object-cover"
        />
        <span className="text-base text-gray-500">{project.assignee}</span>
      </div>

      <span className="text-[15px] text-[#E2554F] font-medium">{project.status}</span>

      {/* Progress Bar */}
      <div className="flex items-center gap-2 mt-1">
        <div className="flex-1 h-[5px] bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#E2554F] rounded-full"
            style={{ width: `${project.progress}%` }}
          />
        </div>
        <span className="text-[14px] text-gray-500 whitespace-nowrap">
          {project.progress}%
        </span>
      </div>
    </div>

    {/* Message Button */}
    <div className="w-7 h-7 rounded-full bg-[#1a1a2e] flex items-center justify-center cursor-pointer flex-shrink-0">
      <MessageSquare size={14} stroke="white" />
    </div>

  </div>
);

const ActiveProjects: React.FC<Props> = ({ projects }) => {
  return (
    <div className="flex-1 bg-[#fafafa] p-5">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[26px] font-extrabold text-[#1a1a2e] m-0">
          Active Projects
        </h3>
        <button className="bg-transparent border-none text-[#e2554f] font-semibold text-[13px] cursor-pointer hover:underline">
          View All
        </button>
      </div>
      {projects.map((p, i) => <ProjectRow key={i} project={p} />)}
    </div>
  );
};

export default ActiveProjects;