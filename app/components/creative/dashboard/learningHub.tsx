import Link from "next/link";
import { Star, Loader2 } from "lucide-react";
import { Course } from "@/app/lib/hooks/useLearningHub";
import { useRouter } from "next/navigation";
import { useCourseStore } from "@/app/lib/stores/courseStore";
import { useLearningHub } from "@/app/lib/hooks/useLearningHub";

const levelColors: Record<string, string> = {
  Beginners: "bg-gray-200 text-black",
  "All Levels": "bg-gray-200 text-black",
  Advanced: "bg-gray-200 text-black",
};

export default function LearningHub() {
  const router = useRouter();
  const setSelectedCourse = useCourseStore((s) => s.setSelectedCourse);

  const { allCourses, loading, error } = useLearningHub();

  const courses = allCourses.slice(0, 4);

  const handleStartCourse = (course: Course) => {
    setSelectedCourse(course as any);
    router.push(`/creative/learning-hub/${course.id}`);
  };

  return (
    <section className="mb-8 bg-[#fafafa] p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl lg:text-3xl font-heading font-bold text-gray-900">Learning Hub</h3>
        <Link href="/creative/learning-hub" className="text-sm text-[#E2554F] font-medium hover:text-red-600">
          View All
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading courses...</span>
        </div>
      )}

      {error && !loading && (
        <p className="text-sm text-red-500 text-center py-6">{error}</p>
      )}

      {!loading && !error && courses.length === 0 && (
        <p className="text-sm text-black text-center py-6">No courses available.</p>
      )}

      {!loading && !error && (
        <div className="flex gap-4 overflow-x-auto lg:overflow-x-visible lg:grid lg:grid-cols-4 pb-2 lg:pb-0 snap-x snap-mandatory scroll-smooth scrollbar-hide">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex-shrink-0 w-[70vw] sm:w-[45vw] lg:w-auto snap-start bg-white border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
            >
              {/* Image */}
              <div className="relative h-32 bg-gray-100 overflow-hidden">
                {course.image as string && (
                  <img
                    src={course.image as string}
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
                <h4 className="font-heading font-semibold text-black text-sm text-center mb-2">{course.title}</h4>

                <div className="flex justify-center mb-2">
                  <span className={`text-[10px] font-body font-semibold px-2 py-0.5 rounded-full ${levelColors[course.level ?? ""] ?? "bg-gray-200 text-black"}`}>
                    {course.level}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-body text-black">Format: {course.format}</span>
                  <div className="flex items-center gap-0.5">
                    <Star size={11} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-body font-medium text-black">{course.rating as number ?? "—"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-body text-black">Duration: {course.duration}</span>
                  <span className="text-xs font-body font-medium text-green-600">${course.price as number ?? "—"}</span>
                </div>

                <p className="text-xs font-body text-black mb-3 line-clamp-2">{course.description as string}</p>

                <div className="text-center">
                  <button
                    onClick={() => handleStartCourse(course)}
                    className="w-[60%] mx-auto bg-[#E2554F] hover:bg-red-600 text-white text-xs font-body font-semibold py-2 rounded-lg transition-colors"
                  >
                    Start Course
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}