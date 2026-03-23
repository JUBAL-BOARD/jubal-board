import Link from "next/link";
import { Star } from "lucide-react";
import { Course } from "@/app/types";

const levelColors: Record<string, string> = {
  Beginners: "bg-gray-200 text-black",
  "All Levels": "bg-gray-200 text-black",
  Advanced: "bg-gray-200 text-black",
};

export default function LearningHub({ courses }: { courses: Course[] }) {
  return (
    <section className="mb-8 bg-[#fafafa] p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl lg:text-3xl font-bold text-gray-900">Learning Hub</h3>
        <Link href="/creative/learning-hub" className="text-sm text-[#E2554F] font-medium hover:text-red-600">
          View All
        </Link>
      </div>

      {/* Horizontal scroll on mobile, 4-col grid on desktop */}
      <div className="flex gap-4 overflow-x-auto lg:overflow-x-visible lg:grid lg:grid-cols-4 pb-2 lg:pb-0 snap-x snap-mandatory scroll-smooth scrollbar-hide">
        {courses.map((course) => (
          <div
            key={course.id}
            className="flex-shrink-0 w-[70vw] sm:w-[45vw] lg:w-auto snap-start bg-white border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
          >
            {/* Image */}
            <div className="relative h-32 bg-gray-100 overflow-hidden">
              {course.image && (
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
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
              <h4 className="font-semibold text-black text-sm text-center mb-2">{course.title}</h4>

              <div className="flex justify-center mb-2">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${levelColors[course.level]}`}>
                  {course.level}
                </span>
              </div>

              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-black">Format: {course.format}</span>
                <div className="flex items-center gap-0.5">
                  <Star size={11} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-medium text-black">{course.rating}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-black">Duration: {course.duration}</span>
                <span className="text-xs font-medium text-green-600">${course.price}</span>
              </div>

              <p className="text-xs text-black mb-3 line-clamp-2">{course.description}</p>

              <div className="text-center">
                <button className="w-[60%] bg-[#E2554F] hover:bg-red-600 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
                  Start Course
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}