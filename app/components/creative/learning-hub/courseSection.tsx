import { Star } from "lucide-react";
import { Course } from "@/app/types";

interface Props {
  title: string;
  courses: Course[];
  search: string;
  activeChip: string;
}

const levelColors: Record<string, string> = {
  Beginners: "bg-blue-900 text-white",
  "All Levels": "bg-blue-900 text-white",
  Advanced: "bg-purple-900 text-white",
  "Mid-Level": "bg-teal-900 text-white",
};

const CourseSection: React.FC<Props> = ({ title, courses, search, activeChip }) => {
  const filtered = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesChip =
      activeChip === "All Tutorials" ||
      c.level === activeChip ||
      (activeChip === "Duration" && true);
    return matchesSearch && matchesChip;
  });

  if (filtered.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-xl lg:text-2xl font-bold text-black mb-4">{title}</h2>

      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="flex gap-4 overflow-x-auto lg:overflow-x-visible lg:grid lg:grid-cols-3 pb-2 lg:pb-0 snap-x snap-mandatory scroll-smooth scrollbar-hide">
        {filtered.map((course) => (
          <div
            key={course.id}
            className="flex-shrink-0 w-[70vw] sm:w-[45vw] lg:w-auto snap-start bg-[#fafafa] overflow-hidden hover:shadow-md transition-shadow group"
          >
            {/* Thumbnail */}
            <div className="relative h-32 lg:h-36 bg-gray-100 overflow-hidden">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {course.format === "Video" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-3">
              <h4 className="font-semibold text-gray-900 text-sm text-center mb-2">{course.title}</h4>

              <div className="flex justify-center mb-2">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${levelColors[course.level] ?? "bg-gray-100 text-gray-700"}`}>
                  {course.level}
                </span>
              </div>

              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Format: {course.format}</span>
                <div className="flex items-center gap-0.5">
                  <Star size={11} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-medium text-gray-700">{course.rating}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Duration: {course.duration}</span>
                <span className="text-xs font-medium text-green-600">${course.price}</span>
              </div>

              <p className="text-xs text-gray-400 mb-3 line-clamp-2">{course.description}</p>

              <div className="text-center">
                <button className="w-[60%] mx-auto bg-[#E2554F] hover:bg-red-600 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
                  Start Course
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CourseSection;