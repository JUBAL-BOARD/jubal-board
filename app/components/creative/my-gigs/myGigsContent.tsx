"use client";

import { useState } from "react";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import GigStatsBar from "@/app/components/creative/my-gigs/gigStatsBar";
import GigListItem from "@/app/components/creative/my-gigs/gigListItem";
import GigsPagination from "@/app/components/creative/my-gigs/gigsPagination";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { myGigs } from "@/app/data";

const filterChips = ["All Gigs", "Active", "Recent", "Completed", "Revised", "Partially Completed", "On Collab"];

const MyGigsContent: React.FC = () => {
  const [activeChip, setActiveChip] = useState("All Gigs");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState(6);

  const filtered = myGigs.filter((gig) => {
    const matchesSearch = gig.title.toLowerCase().includes(search.toLowerCase());
    const matchesChip =
      activeChip === "All Gigs" ||
      gig.status.toLowerCase() === activeChip.toLowerCase();
    return matchesSearch && matchesChip;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <Breadcrumb crumbs={[
        { label: "Dashboard", path: "/creative/dashboard" },
        { label: "My Gigs" },
      ]} />

      <h1 className="text-2xl font-bold text-gray-900 mb-5">My Gigs</h1>

      {/* Search + Filter */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors">
          <SlidersHorizontal size={15} className="text-red-400" />
          Filter By
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {filterChips.map((chip) => (
          <button
            key={chip}
            onClick={() => { setActiveChip(chip); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeChip === chip
                ? "bg-[#E2554F] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Stats */}
      <GigStatsBar gigs={myGigs} />

      {/* List */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold text-black mb-4">All ({filtered.length})</h2>
        <div className="flex flex-col gap-3">
          {paginated.map((gig) => (
            <GigListItem key={gig.id} gig={gig} />
          ))}
        </div>
      </div>

      {/* Pagination */}
      <GigsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={(val) => { setPerPage(val); setPage(1); }}
      />
    </div>
  );
};

export default MyGigsContent;