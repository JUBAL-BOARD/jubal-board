import { getDueIn, statusColorMap, statusLabelMap } from "./utils";

interface ProjectHeaderCardProps {
  title?: string;
  status?: string;
  progressPercentage?: number;
  dueDate?: string | null;
  compact?: boolean;
}

export default function ProjectHeaderCard({
  title,
  status,
  progressPercentage,
  dueDate,
  compact = false,
}: ProjectHeaderCardProps) {
  return (
    <div className={`bg-[#fafafa] p-6 ${compact ? "" : "text-center"}`}>
      <h2 className={`font-bold text-black ${compact ? "text-xl mb-1" : "text-xl mb-2"}`}>
        {title ?? "—"}
      </h2>
      <span
        className={`inline-block px-4 py-1 text-xs font-semibold rounded-full ${
          compact ? "mb-3" : "mb-4"
        } ${statusColorMap[status ?? ""] ?? "bg-gray-100 text-gray-600"}`}
      >
        {statusLabelMap[status ?? ""] ?? status ?? "—"}
      </span>
      <div className={`flex items-center gap-3 ${compact ? "mb-2" : "mb-3 max-w-md mx-auto"}`}>
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#e84545] rounded-full"
            style={{ width: `${progressPercentage ?? 0}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-black">{progressPercentage ?? 0}%</span>
      </div>
      <div
        className={`flex items-center gap-2 text-sm text-black ${
          compact ? "" : "justify-center"
        }`}
      >
        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="10" cy="10" r="8" />
          <path strokeLinecap="round" d="M10 6v4l2.5 2.5" />
        </svg>
        <span>Due in {dueDate ? getDueIn(dueDate) : "—"}</span>
      </div>
    </div>
  );
}