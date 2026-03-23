"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  path?: string;
}

interface Props {
  crumbs: Crumb[];
}

const Breadcrumb: React.FC<Props> = ({ crumbs }) => {
  const router = useRouter();

  return (
    <div className="flex items-center gap-1.5 bg-[#fafafa] px-4 py-3 mb-4 text-sm lg:text-base text-gray-500">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <div key={crumb.label} className="flex items-center gap-1.5">
            <span
              onClick={() => crumb.path && router.push(crumb.path)}
              className={`
                ${crumb.path ? "cursor-pointer" : "cursor-default"}
                ${isLast ? "text-[#1a1a2e] font-semibold" : "text-gray-500 font-normal"}
              `}
            >
              {crumb.label}
            </span>
            {!isLast && <ChevronRight size={14} stroke="#9CA3AF" />}
          </div>
        );
      })}
    </div>
  );
};

export default Breadcrumb;