import { formatDate } from "./utils";
import type { Milestone } from "./types";

interface MilestonesListProps {
  milestones?: Milestone[];
}

export default function MilestonesList({ milestones }: MilestonesListProps) {
  if (!milestones || milestones.length === 0) {
    return <p className="text-sm text-gray-400">No milestones set.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {milestones.map((m, i) => (
        <div
          key={m.id}
          className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-lg bg-white"
        >
          <div>
            <p className="text-sm font-semibold text-black">{m.title ?? `Milestone ${i + 1}`}</p>
            {m.completedAt && (
              <p className="text-xs text-black mt-0.5">Completed {formatDate(m.completedAt)}</p>
            )}
          </div>
          <span
            className={`px-3 py-1 rounded-lg text-xs font-semibold ${
              m.isCompleted ? "bg-green-100 text-green-600" : "bg-red-100 text-red-400"
            }`}
          >
            {m.isCompleted ? "Completed" : "Pending"}
          </span>
        </div>
      ))}
    </div>
  );
}