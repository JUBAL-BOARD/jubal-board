import Image from "next/image";
import { Clock, MessageSquare, Eye } from "lucide-react";
import type { DeskProject, ProjectStatus } from "../../../data/myDeskData";

interface Props {
  project: DeskProject;
}

const statusConfig: Record<ProjectStatus, { color: string; bar: string }> = {
  "In Progress": { color: "#e2554f", bar: "#e2554f" },
  "Completed":   { color: "#22C55E", bar: "#22C55E" },
  "Revision":    { color: "#F59E0B", bar: "#F59E0B" },
  "On Collabs":  { color: "#3B82F6", bar: "#3B82F6" },
};

const ProjectCard: React.FC<Props> = ({ project }) => {
  const { color, bar } = statusConfig[project.status];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-[18px] bg-[#fafafa] border border-gray-200 rounded-[10px] px-4 lg:px-5 py-4 lg:py-[18px] mb-3">

      {/* Top row on mobile — thumbnail + main info */}
      <div className="flex items-start gap-3 flex-1 min-w-0">

        {/* Thumbnail */}
        <div className="relative w-[70px] h-[70px] lg:w-[100px] lg:h-[100px] flex-shrink-0">
          <Image
            src={project.thumbnail}
            alt={project.title}
            fill
            className="object-cover rounded-lg"
          />
        </div>

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <p className="m-0 mb-2 text-base lg:text-xl font-bold text-black">{project.title}</p>

          {/* Assignee Row */}
          <div className="flex items-center gap-3 lg:gap-5 mb-2 flex-wrap">

            {/* Primary Assignee */}
            <div className="flex items-center gap-1.5 lg:gap-2">
              <div className="relative">
                <Image
                  src={project.assigneeAvatar}
                  alt={project.assignee}
                  width={32}
                  height={32}
                  className="rounded-full object-cover lg:w-[50px] lg:h-[50px]"
                />
                {project.assigneeOnline && (
                  <div className="absolute bottom-px right-px w-2 h-2 lg:w-[9px] lg:h-[9px] rounded-full bg-green-500 border-2 border-white" />
                )}
              </div>
              <span className="text-sm lg:text-lg font-semibold text-[#1a1a2e]">{project.assignee}</span>
            </div>

            {/* Collab Extra */}
            {project.isCollab && project.collabAvatar && (
              <div className="flex items-center gap-1.5 lg:gap-2">
                <div className="relative">
                  <Image
                    src={project.collabAvatar}
                    alt="collabs"
                    width={28}
                    height={28}
                    className="rounded-full object-cover lg:w-[34px] lg:h-[34px]"
                  />
                  <div className="absolute bottom-px right-px w-2 h-2 lg:w-[9px] lg:h-[9px] rounded-full bg-green-500 border-2 border-white" />
                </div>
                <span className="text-xs lg:text-[13px] text-gray-500">{project.collabExtra}</span>
              </div>
            )}
          </div>

          {/* Due Date */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <Clock size={13} stroke="#6B7280" />
            <span className="text-xs text-gray-500">{project.dueLabel}</span>
          </div>

          {/* Status */}
          <p className="m-0 mb-1.5 text-xs font-semibold" style={{ color }}>
            {project.status}
          </p>

          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${project.progress}%`, background: bar }}
              />
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">{project.progress}%</span>
          </div>
        </div>
      </div>

      {/* Action Buttons — row on mobile, column on desktop */}
      <div className="flex flex-row lg:flex-col gap-2 flex-shrink-0">
        <button className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 lg:gap-2 bg-[#1a1a2e] border-none rounded-lg px-3 lg:px-4 py-2 lg:py-2.5 cursor-pointer text-white text-xs lg:text-[13px] font-semibold whitespace-nowrap hover:opacity-90 transition-opacity">
          <MessageSquare size={13} stroke="white" /> {project.chatLabel}
        </button>
        <button className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 lg:gap-2 bg-[#E2554F] border-none rounded-lg px-3 lg:px-4 py-2 lg:py-2.5 cursor-pointer text-white text-xs lg:text-[13px] font-semibold whitespace-nowrap hover:bg-[#d44a44] transition-colors">
          <Eye size={13} stroke="white" /> View Project
        </button>
      </div>

    </div>
  );
};

export default ProjectCard;