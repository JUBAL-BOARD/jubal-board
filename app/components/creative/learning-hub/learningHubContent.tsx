"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import LearningStats from "./learningHubStats";
import ActiveCourseBanner from "./activeCourseBanner";
import CourseSection from "./courseSection";
import {
  recommendedCourses,
  jubalBoardCourses,
  advancedCourses,
} from "@/app/data";

const filterChips = ["All Tutorials", "Beginners", "All Levels", "Mid-Level", "Expert", "Duration"];
const SECTION_SIZE = 3;

const LearningHubContent: React.FC = () => {
  const [activeChip, setActiveChip] = useState("All Tutorials");
  const [search, setSearch] = useState("");
  const [visibleSections, setVisibleSections] = useState(3);

  const allSections = [
    { title: "Recommended for you", courses: recommendedCourses },
    { title: "Jubal Board Courses", courses: jubalBoardCourses },
    { title: "Advanced Courses", courses: advancedCourses },
  ];

  return (
    <div>
      <Breadcrumb crumbs={[
        { label: "Dashboard", path: "/creative/dashboard" },
        { label: "Learning Hub" },
      ]} />

      <h1 className="text-2xl font-bold text-gray-900 mb-5">Learning Hub</h1>

      {/* Search + Filter */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Tutorials"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
            onClick={() => setActiveChip(chip)}
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
      <LearningStats
        certificationsEarned={4}
        coursesCompleted={4}
        activeCourse={1}
      />

      {/* Active course */}
      <ActiveCourseBanner />

      {/* Course sections */}
      {allSections.slice(0, visibleSections).map((section) => (
        <CourseSection
          key={section.title}
          title={section.title}
          courses={section.courses}
          search={search}
          activeChip={activeChip}
        />
      ))}

      {/* Load More */}
      {visibleSections < allSections.length && (
        <div className="flex justify-center mt-4 mb-8">
          <button
            onClick={() => setVisibleSections((prev) => prev + 1)}
            className="bg-[#E2554F] hover:bg-red-600 text-white font-semibold px-12 py-3 rounded-lg transition-colors text-sm"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default LearningHubContent;