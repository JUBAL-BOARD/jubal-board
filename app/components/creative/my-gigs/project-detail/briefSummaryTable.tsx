import type { BriefRow } from "./types";

interface BriefSummaryTableProps {
  rows: BriefRow[];
  compact?: boolean;
}

export default function BriefSummaryTable({ rows, compact = false }: BriefSummaryTableProps) {
  return (
    <table className="w-full text-sm">
      <tbody>
        {rows.map((row) => (
          <tr key={row.label} className="border-b border-gray-50 last:border-0">
            <td
              className={`text-black font-medium align-top ${
                compact ? "py-2 pr-4 w-32 text-sm" : "py-2.5 pr-6 w-36"
              }`}
            >
              {row.label}
            </td>
            <td className={`text-black ${compact ? "py-2 text-sm" : "py-2.5"}`}>{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}