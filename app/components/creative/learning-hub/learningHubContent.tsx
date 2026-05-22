"use client";
import { useState } from "react";
import { Search, SlidersHorizontal, ChevronDown, Loader2 } from "lucide-react";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import LearningStats from "./learningHubStats";
import ActiveCourseBanner from "./activeCourseBanner";
import { useCourseStore } from "../../../lib/stores/courseStore";
import CourseSection from "./courseSection";
import { useLearningHub } from "../../../lib/hooks/useLearningHub";

const filterChips = [
  { label: "All Tutorials", level: "ALL" },
  { label: "Beginners", level: "BEGINNER" },
  { label: "All Levels", level: "ALL" },
  { label: "Mid-Level", level: "INTERMEDIATE" },
  { label: "Expert", level: "ADVANCED" },
];

const LearningHubContent: React.FC = () => {
  const [activeChip, setActiveChip] = useState("All Tutorials");
  const [search, setSearch] = useState("");
  const [visibleSections, setVisibleSections] = useState(3);

  const selectedCourse = useCourseStore((s) => s.selectedCourse);
  const {
    allCourses,
    beginnerCourses,
    advancedCourses,
    myCourses,
    loading,
    error,
  } = useLearningHub();

  const handleChipClick = (chip: { label: string; level: string }) => {
    setActiveChip(chip.label);
  };

  const allSections = [
    { title: "All Courses", courses: allCourses },
    { title: "Beginner Courses", courses: beginnerCourses },
    { title: "Advanced Courses", courses: advancedCourses },
  ];

  const filteredSections = allSections.map((section) => ({
    ...section,
    courses: Array.isArray(section.courses)
      ? section.courses
          .filter((c) =>
            c.title?.toLowerCase().includes(search.toLowerCase())
          )
          .map((c) => ({
            ...c,
            rating: typeof c.rating === "number" ? c.rating : 0,
            price: typeof c.price === "number" ? c.price : 0,
            description: typeof c.description === "string" ? c.description : "",
            image: typeof c.image === "string" ? c.image : "",
            level: typeof c.level === "string" ? c.level : "",
            format: typeof c.format === "string" ? c.format : "",
            skillTag: typeof c.skillTag === "string" ? c.skillTag : "",
            thumbnail: typeof c.thumbnail === "string" ? c.thumbnail : "",
            duration: typeof c.duration === "string" ? c.duration : "",
            instructor: typeof c.instructor === "string" ? c.instructor : "",
            progress: typeof c.progress === "number" ? c.progress : 0,
          }))
      : [],
  }));

  return (
    <div>
      <Breadcrumb crumbs={[
        { label: "Dashboard", path: "/creative/dashboard" },
        { label: "Learning Hub" },
      ]} />

      <h1 className="text-2xl font-bold font-heading text-gray-900 mb-5">Learning Hub</h1>

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
            key={chip.label}
            onClick={() => handleChipClick(chip)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeChip === chip.label
                ? "bg-[#E2554F] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <LearningStats
        certificationsEarned={myCourses.certifications.length}
        coursesCompleted={myCourses.completed.length}
        activeCourse={myCourses.active.length}
      />

      {/* Active course banner */}
      {selectedCourse && <ActiveCourseBanner course={selectedCourse} />}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Loading courses...</span>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Course sections */}
      {!loading && filteredSections.slice(0, visibleSections).map((section) => (
        <CourseSection
          key={section.title}
          title={section.title}
          courses={section.courses}
          search={search}
          activeChip={activeChip}
        />
      ))}

      {/* Load More */}
      {!loading && visibleSections < allSections.length && (
        <div className="flex justify-center mt-4 mb-8">
          <button
            onClick={() => setVisibleSections((prev) => prev + 1)}
            className="bg-[#E2554F] hover:bg-red-600 text-white font-semibold font-body px-12 py-3 rounded-lg transition-colors text-sm"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default LearningHubContent;