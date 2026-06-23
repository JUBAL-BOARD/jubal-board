"use client";

import { useEffect, useState, useRef } from "react";
import Sidebar from "@/app/components/creative/dashboard/sideBar";
import DashboardTopbar from "@/app/components/creative/dashboard/dashboardTopbar";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import { useRouter, useParams } from "next/navigation";
import { Loader2, X, ChevronDown, ChevronUp, Download } from "lucide-react";
import { useCourseStore } from "../../../lib/stores/courseStore";
import { useCreativeProfile } from "@/app/lib/hooks/useCreativeProfile";
import { useCourseDetail } from "@/app/lib/hooks/useCourseDetail";

// Extracts a YouTube video ID from common URL formats, or null if not YouTube
function getYouTubeId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

const CourseDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;

  const storeCourse = useCourseStore((s) => s.selectedCourse);
  const { course, loading: courseLoading, error: courseError } = useCourseDetail(courseId);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeResourceId, setActiveResourceId] = useState<string | null>(null);
  const [openModule, setOpenModule] = useState<string | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { profile, loading: profileLoading, error } = useCreativeProfile();

  // Guard against direct URL access — kept above all early returns
  useEffect(() => {
    if (!courseLoading && !course && !storeCourse) {
      router.replace("/creative/learning-hub");
    }
  }, [course, storeCourse, courseLoading, router]);

  // Default to first module open + first video resource active once full detail loads
  useEffect(() => {
    if (course?.modules?.length && !activeResourceId) {
      setOpenModule(course.modules[0].id);
      const firstVideo = course.modules
        .flatMap((m) => m.resources)
        .find((r) => r.resourceType === "VIDEO");
      if (firstVideo) setActiveResourceId(firstVideo.id);
    }
  }, [course, activeResourceId]);

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 size={48} className="animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Error loading profile: {error}</p>
      </div>
    );
  }

  // Nothing to show at all yet (no detail, no summary) — bail out (the
  // redirect effect above will fire if this persists after loading).
  if (!course && !storeCourse) return null;

  const userName = profile?.fullName || "Creative";
  const userAvatar =
    profile?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

  // Title/thumbnail can come from the lightweight summary while the real
  // detail is loading, but modules/enrollment/pricing ONLY ever come from
  // `course` (the real fetched detail) — a CourseSummary never has them.
  const displayTitle = course?.title ?? storeCourse?.title ?? "";
  const displayThumbnail = course?.thumbnailUrl ?? storeCourse?.thumbnail;

  const allResources = (course?.modules ?? []).flatMap((m) => m.resources);
  const activeResource = allResources.find((r) => r.id === activeResourceId) ?? allResources[0];
  const youTubeId = getYouTubeId(activeResource?.resourceUrl);

  const toggleModule = (id: string) => {
    setOpenModule((prev) => (prev === id ? null : id));
  };

  const handleSelectResource = (resourceId: string) => {
    setActiveResourceId(resourceId);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const handleComplete = () => {
    setShowCertificate(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <DashboardTopbar
        userName={userName}
        userAvatar={userAvatar}
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex flex-1">
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <div className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-10`}>
          <button className="absolute top-4 right-4 z-50 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={22} />
          </button>
          <Sidebar activeItem="Learning Hub" />
        </div>

        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <Breadcrumb crumbs={[
            { label: "Dashboard",    path: "/creative/dashboard" },
            { label: "Learning Hub", path: "/creative/learning-hub" },
            { label: displayTitle },
          ]} />

          <h1 className="text-2xl font-bold text-gray-900 mb-5">Course Details</h1>

          {/* While the real detail is still loading, show a lightweight skeleton
              using only the summary data — no modules/video exist yet */}
          {courseLoading || courseError ? (
            <div className="mb-5">
              <div className="relative bg-black rounded-xl overflow-hidden mb-2 aspect-video flex items-center justify-center">
                {courseError ? (
                  <p className="text-red-400 text-sm">{courseError}</p>
                ) : (
                  <Loader2 size={32} className="animate-spin text-gray-400" />
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{displayTitle}</h2>
            </div>
          ) : !course ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-gray-400 text-sm">Course details unavailable.</p>
            </div>
          ) : (
            <>
              {/* Video player */}
              <div className="relative bg-black rounded-xl overflow-hidden mb-2 aspect-video">
                {!activeResource ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    No video available for this course yet.
                  </div>
                ) : youTubeId ? (
                  // YouTube embed — native controls, no custom play/pause/skip
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${youTubeId}`}
                    title={activeResource.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  // Direct file URL (mp4/S3/etc) — native <video> with custom controls
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      src={activeResource.resourceUrl}
                      poster={activeResource.thumbnailUrl ?? displayThumbnail}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-8">
                      <button
                        onClick={() => handleSkip(-10)}
                        className="w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex flex-col items-center justify-center text-white transition-colors"
                      >
                        <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                          <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                        </svg>
                        <span className="text-[9px] font-bold mt-0.5">10</span>
                      </button>

                      <button
                        onClick={handlePlayPause}
                        className="w-14 h-14 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-gray-900 transition-colors shadow-lg"
                      >
                        {isPlaying ? (
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-1">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>

                      <button
                        onClick={() => handleSkip(15)}
                        className="w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex flex-col items-center justify-center text-white transition-colors"
                      >
                        <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 scale-x-[-1]">
                          <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                        </svg>
                        <span className="text-[9px] font-bold mt-0.5">15</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {activeResource && (
                <p className="text-sm text-gray-500 mb-5">Now playing: {activeResource.title}</p>
              )}

              {/* Course title + meta */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h2>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <svg viewBox="0 0 20 20" fill="#F5A623" className="w-4 h-4">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-semibold text-gray-700">{course.rating}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-[#1c1c3a] text-white text-xs font-semibold rounded">{course.level}</span>
                    <span className="text-gray-500">Duration: {course.duration}</span>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-lg">
                  {course.isFree || course.cost === 0 ? "Free Course" : `$${course.cost}`}
                </span>
              </div>

              {/* Course Description */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-black mb-3">Course Description</h3>
                <p className="bg-[#fafafa] p-6 text-md text-black leading-relaxed">
                  {course.description}
                </p>
              </div>

              {/* Course Outline — built from modules/resources */}
              <div className="mb-5">
                <h3 className="text-xl font-bold text-black mb-3">Course Outline</h3>
                <div className="flex flex-col gap-2">
                  {(course.modules ?? []).map((module) => (
                    <div key={module.id} className="overflow-hidden">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-[#fafafa] hover:bg-gray-100 transition-colors text-left"
                      >
                        <span className="text-sm font-semibold text-black">
                          {module.moduleNumber}. {module.title}
                        </span>
                        {openModule === module.id ? (
                          <ChevronUp size={16} className="text-gray-500 shrink-0" />
                        ) : (
                          <ChevronDown size={16} className="text-gray-500 shrink-0" />
                        )}
                      </button>
                      {openModule === module.id && (
                        <div className="px-4 py-2 bg-white">
                          {module.resources.map((resource) => (
                            <button
                              key={resource.id}
                              onClick={() => handleSelectResource(resource.id)}
                              className={`w-full text-left bg-[#fafafa] p-6 flex items-center gap-2 py-1.5 text-sm mb-1 rounded ${
                                resource.id === activeResourceId ? "ring-2 ring-[#e84545]" : ""
                              } text-black`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                              <span>{resource.title}</span>
                              <span className="ml-auto text-xs text-gray-400">({resource.duration})</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Complete Course button */}
              <div className="flex justify-center mb-6">
                <button
                  onClick={handleComplete}
                  className="px-16 py-3 bg-[#e84545] hover:bg-[#d03535] text-white font-bold rounded-xl transition-colors text-sm"
                >
                  Complete Course
                </button>
              </div>

              {/* Certificate section */}
              {showCertificate && (
                <div className="bg-[#fafafa] border border-gray-100 rounded-xl p-6 mb-10 relative">
                  <button onClick={() => setShowCertificate(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <ChevronUp size={18} />
                  </button>
                  <h3 className="text-lg font-bold text-center text-[#1c1c3a] mb-5">Your Certificate is Ready</h3>
                  <div className="border-2 border-teal-200 rounded-lg p-8 max-w-lg mx-auto mb-6 bg-white relative">
                    <div className="absolute inset-2 border border-teal-100 rounded pointer-events-none" />
                    <div className="text-center mb-2">
                      <span className="font-serif text-3xl italic text-gray-700">J</span>
                    </div>
                    <h4 className="text-center text-sm font-bold tracking-widest text-gray-800 uppercase mb-4">
                      Certificate of Completion
                    </h4>
                    <p className="text-center text-xs text-gray-500 mb-6">
                      This is to certify that the student has successfully completed the course:
                    </p>
                    <div className="border-b border-gray-300 mb-4" />
                    <p className="text-center text-sm font-bold text-gray-800 mb-6">{course.title}</p>
                    <div className="flex items-end justify-between mt-4">
                      <div className="text-center">
                        <div className="border-b border-gray-400 w-24 mb-1" />
                        <span className="text-xs text-gray-400">Date</span>
                      </div>
                      <div className="flex flex-col items-center -mt-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center shadow-md border-4 border-yellow-200">
                          <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-serif italic text-sm text-gray-600 mb-1">Jm—</div>
                        <div className="border-b border-gray-400 w-24 mb-1" />
                        <span className="text-xs text-gray-400">Instructor</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4">
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#e84545] hover:bg-[#d03535] text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      <Download size={15} />
                      Download Certificate
                    </button>
                    <button className="px-5 py-2.5 bg-[#e84545] hover:bg-[#d03535] text-white text-sm font-semibold rounded-lg transition-colors">
                      Add to Profile
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default CourseDetailPage;