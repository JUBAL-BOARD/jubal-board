import Link from "next/link";
import { Star, Clock, Loader2 } from "lucide-react";
import { Course, Resource } from "@/app/lib/hooks/useLearningHub";
import { useRouter } from "next/navigation";
import { useCourseStore } from "@/app/lib/stores/courseStore";
import { useLearningHub } from "@/app/lib/hooks/useLearningHub";

const levelColors: Record<string, string> = {
  Beginners: "bg-gray-200 text-black",
  "All Levels": "bg-gray-200 text-black",
  Advanced: "bg-gray-200 text-black",
};

const typeColors: Record<string, string> = {
  YOUTUBE: "bg-red-700 text-white",
  BLOG: "bg-blue-900 text-white",
  QUICK_READ: "bg-teal-900 text-white",
  VIDEO: "bg-purple-900 text-white",
};

type FeedItem =
  | { kind: "course"; data: Course }
  | { kind: "resource"; data: Resource };

// A Resource never has a "level" badge keyed off course-style values, so
// this is enough to tell the two shapes apart at render time.
const isResource = (item: FeedItem): item is { kind: "resource"; data: Resource } =>
  item.kind === "resource";

export default function LearningHub() {
  const router = useRouter();
  const setSelectedCourse = useCourseStore((s) => s.setSelectedCourse);

  const { allCourses, resources, loading, error } = useLearningHub();

  // Mix courses and resources together, capped at 4 total for the preview.
  const feed: FeedItem[] = [
    ...allCourses.map((c): FeedItem => ({ kind: "course", data: c })),
    ...resources.map((r): FeedItem => ({ kind: "resource", data: r })),
  ].slice(0, 4);

  const handleStartCourse = (course: Course) => {
    setSelectedCourse(course as any);
    router.push(`/creative/learning-hub/${course.id}`);
  };

  const handleOpenResource = (resource: Resource) => {
    if (resource.resourceUrl) {
      window.open(resource.resourceUrl, "_blank", "noopener,noreferrer");
    }
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

      {!loading && !error && feed.length === 0 && (
        <p className="text-sm text-black text-center py-6">No courses available.</p>
      )}

      {!loading && !error && (
        <div className="flex gap-4 overflow-x-auto lg:overflow-x-visible lg:grid lg:grid-cols-4 pb-2 lg:pb-0 snap-x snap-mandatory scroll-smooth scrollbar-hide">
          {feed.map((item) =>
            isResource(item) ? (
              // ----- Resource card -----
              <div
                key={`resource-${item.data.id}`}
                className="flex-shrink-0 w-[70vw] sm:w-[45vw] lg:w-auto snap-start bg-white border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="relative h-32 bg-gray-100 overflow-hidden">
                  {item.data.thumbnailUrl ? (
                    <img
                      src={item.data.thumbnailUrl}
                      alt={item.data.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-medium">
                      No preview
                    </div>
                  )}
                  {item.data.resourceType === "YOUTUBE" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <h4 className="font-heading font-semibold text-black text-sm text-center mb-2">{item.data.title}</h4>

                  <div className="flex justify-center mb-2">
                    <span className={`text-[10px] font-body font-semibold px-2 py-0.5 rounded-full ${typeColors[item.data.resourceType ?? ""] ?? "bg-gray-200 text-black"}`}>
                      {item.data.resourceType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-body text-black">{item.data.sourceName}</span>
                    {item.data.duration && (
                      <div className="flex items-center gap-0.5">
                        <Clock size={11} className="text-gray-400" />
                        <span className="text-xs font-body font-medium text-black">{item.data.duration}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs font-body text-black mb-3 line-clamp-2">{item.data.descriptionPreview}</p>

                  <div className="text-center">
                    <button
                      onClick={() => handleOpenResource(item.data)}
                      className="w-[60%] mx-auto bg-[#E2554F] hover:bg-red-600 text-white text-xs font-body font-semibold py-2 rounded-lg transition-colors"
                    >
                      View Resource
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // ----- Course card (unchanged) -----
              <div
                key={`course-${item.data.id}`}
                className="flex-shrink-0 w-[70vw] sm:w-[45vw] lg:w-auto snap-start bg-white border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="relative h-32 bg-gray-100 overflow-hidden">
                  {(item.data.image as string) && (
                    <img
                      src={item.data.image as string}
                      alt={item.data.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  {item.data.format === "Video" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <h4 className="font-heading font-semibold text-black text-sm text-center mb-2">{item.data.title}</h4>

                  <div className="flex justify-center mb-2">
                    <span className={`text-[10px] font-body font-semibold px-2 py-0.5 rounded-full ${levelColors[item.data.level ?? ""] ?? "bg-gray-200 text-black"}`}>
                      {item.data.level}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-body text-black">Format: {item.data.format}</span>
                    <div className="flex items-center gap-0.5">
                      <Star size={11} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-body font-medium text-black">{(item.data.rating as number) ?? "—"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-body text-black">Duration: {item.data.duration}</span>
                    <span className="text-xs font-body font-medium text-green-600">${(item.data.price as number) ?? "—"}</span>
                  </div>

                  <p className="text-xs font-body text-black mb-3 line-clamp-2">{item.data.description as string}</p>

                  <div className="text-center">
                    <button
                      onClick={() => handleStartCourse(item.data)}
                      className="w-[60%] mx-auto bg-[#E2554F] hover:bg-red-600 text-white text-xs font-body font-semibold py-2 rounded-lg transition-colors"
                    >
                      Start Course
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}