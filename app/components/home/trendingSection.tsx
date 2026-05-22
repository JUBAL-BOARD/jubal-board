"use client";
import { useEffect, useState, useCallback } from "react";
import ServiceCard from "./serviceCard";
import SectionHeader from "./sectionHeader";
import { Loader2 } from "lucide-react";

interface PlatformService {
  id: string;
  name: string;
  imageUrl: string;
  categoryId: string;
}

const PAGE_SIZE = 5; // items per page (matches your 5-col grid)

const TrendingSection: React.FC = () => {
  const [page, setPage] = useState<number>(0);
  const [services, setServices] = useState<PlatformService[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  const fetchServices = useCallback(async (pageIndex: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/v1/platform-services?page=${pageIndex + 1}&limit=${PAGE_SIZE}`
      );
      if (!res.ok) return;
      const json = await res.json();

      // handle both raw array and { data, total, page } shapes
      const list: PlatformService[] = Array.isArray(json)
        ? json
        : Array.isArray(json.data)
        ? json.data
        : [];

      const total: number = json.total ?? json.totalCount ?? list.length;
      setServices(list);
      setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices(page);
  }, [page, fetchServices]);

  const handlePageChange = (i: number) => {
    if (i === page) return;
    setPage(i);
  };

  return (
    <div className="px-4 sm:px-8 py-9 bg-[#fafafa] w-[95%] mx-auto mt-8 h-fit">
      <SectionHeader title="Trending Services" />

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-[#E2554F]" size={28} />
        </div>
      ) : services.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-10">
          No services found.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              label={service.name}
              bg={service.imageUrl}
              categoryId={service.categoryId}
            />
          ))}
        </div>
      )}

      {/* Pagination Dots */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <div
              key={i}
              onClick={() => handlePageChange(i)}
              className="h-2 rounded-full cursor-pointer transition-all duration-200"
              style={{
                width: 8,
                background: i === page ? "#E2554F" : "#d1d5db",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TrendingSection;