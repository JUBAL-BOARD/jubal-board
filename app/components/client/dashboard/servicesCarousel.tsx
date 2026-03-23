"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import type { Service } from "../../../types";

interface Props {
  services: Service[];
}

const ServicesCarousel: React.FC<Props> = ({ services }) => {
  const [page, setPage] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth } = scrollRef.current;
    const pageWidth = scrollWidth / 3;
    setPage(Math.round(scrollLeft / pageWidth));
  };

  const goToPage = (i: number) => {
    if (!scrollRef.current) return;
    const pageWidth = scrollRef.current.scrollWidth / 3;
    scrollRef.current.scrollTo({ left: pageWidth * i, behavior: "smooth" });
    setPage(i);
  };

  return (
    <div className="mb-8 bg-[#fafafa] p-5">
      <h3 className="text-[26px] font-extrabold text-[#1a1a2e] m-0 mb-4">
        Services you may like
      </h3>

      {/* Scrollable Row */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3.5 overflow-x-auto pb-1 scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {services.map((service, i) => (
          <div
            key={i}
            className="relative rounded-lg overflow-hidden min-w-[300px] h-[300px] flex-shrink-0 cursor-pointer"
          >
            <Image
              src={service.bg}
              alt={service.label}
              fill
              className="object-cover"
            />
            {/* Label Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[20%] flex items-center justify-center px-3 bg-[#1c1c3a]">
              <span className="text-white font-semibold text-[13px]">
                {service.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-3.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            onClick={() => goToPage(i)}
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

export default ServicesCarousel;