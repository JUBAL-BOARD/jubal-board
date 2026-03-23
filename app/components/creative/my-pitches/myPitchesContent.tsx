"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import PitchCard from "./pitchCard";
import { creativePitches } from "@/app/data";

const filterChips = ["All Pitches", "Approved", "Pending", "Ongoing"];
const PAGE_SIZE = 6;

const MyPitchesContent: React.FC = () => {
  const [activeChip, setActiveChip] = useState("All Pitches");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = creativePitches.filter((pitch) => {
    const matchesSearch = pitch.gigTitle.toLowerCase().includes(search.toLowerCase());
    const matchesChip =
      activeChip === "All Pitches" ||
      pitch.status.toLowerCase() === activeChip.toLowerCase();
    return matchesSearch && matchesChip;
  });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div>
      <Breadcrumb crumbs={[
        { label: "Dashboard", path: "/creative/dashboard" },
        { label: "My Pitches" },
      ]} />

      <h1 className="text-2xl font-bold text-gray-900 mb-5">My Pitches</h1>

      {/* Search + Filter */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisibleCount(PAGE_SIZE); }}
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
      <div className="flex items-center gap-2 mb-6">
        {filterChips.map((chip) => (
          <button
            key={chip}
            onClick={() => { setActiveChip(chip); setVisibleCount(PAGE_SIZE); }}
            className={`px-2 lg:px-5 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-colors ${
              activeChip === chip
                ? "bg-red-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Count */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">All ({filtered.length})</h2>

      {/* Grid */}
      <div className="bg-[#fafafa] p-2 lg:p-6 grid grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((pitch) => (
          <PitchCard key={pitch.id} pitch={pitch} />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-12 py-3 rounded-lg transition-colors text-sm"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default MyPitchesContent;