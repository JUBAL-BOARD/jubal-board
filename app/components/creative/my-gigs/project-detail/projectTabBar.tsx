import Link from "next/link";
import { Users } from "lucide-react";

interface ProjectTabBarProps {
  activeTab: "view" | "review";
  onTabChange: (tab: "view" | "review") => void;
  projectId: string;
  showCollabProgress: boolean;
}

export default function ProjectTabBar({
  activeTab,
  onTabChange,
  projectId,
  showCollabProgress,
}: ProjectTabBarProps) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onTabChange("view")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
            activeTab === "view"
              ? "bg-white border-red-200 text-black"
              : "bg-white border-red-200 text-black hover:bg-gray-200"
          }`}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path
              fillRule="evenodd"
              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
              clipRule="evenodd"
            />
          </svg>
          View Project
        </button>
        <button
          onClick={() => onTabChange("review")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
            activeTab === "review"
              ? "bg-[#E2554F] border-[#E2554F] text-white"
              : "bg-[#E2554F] border-[#E2554F] text-white hover:bg-red-300"
          }`}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path
              fillRule="evenodd"
              d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
              clipRule="evenodd"
            />
          </svg>
          Review Deliverables
        </button>
        {showCollabProgress && (
          <Link
            href={`/creative/collab-hub/${projectId}/collab-progress`}
            className="flex items-center gap-2 px-4 py-2 bg-[#1c1c3a] text-white text-sm font-semibold rounded-lg hover:bg-[#2e2e5a] transition-colors border border-[#1c1c3a]"
          >
            <Users size={15} />
            View Collab Progress
          </Link>
        )}
      </div>
      <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-red-400">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        Report a Dispute
      </button>
    </div>
  );
}