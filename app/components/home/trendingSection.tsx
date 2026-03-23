"use client";

import { useState } from "react";
import { trendingServices } from "../../data";
import ServiceCard from "./serviceCard";
import SectionHeader from "./sectionHeader";

const TOTAL_PAGES = 3;

const TrendingSection: React.FC = () => {
  const [page, setPage] = useState<number>(0);

  return (
    <div className="px-8 py-9 bg-[#fafafa] w-[95%] mx-auto mt-8 h-fit">
      <SectionHeader title="Trending Services" />

      <div className="grid grid-cols-5 gap-3.5">
        {trendingServices.map((service, i) => (
          <ServiceCard key={i} label={service.label} bg={service.bg} />
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-5">
        {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
          <div
            key={i}
            onClick={() => setPage(i)}
            className="h-2 rounded-full cursor-pointer transition-all duration-200"
            style={{
              width: i === page ? 8 : 8,
              background: i === page ? "#E2554F" : "#d1d5db",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TrendingSection;