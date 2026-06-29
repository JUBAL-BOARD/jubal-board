"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Sidebar from "@/app/components/creative/dashboard/sideBar";
import DashboardTopbar from "@/app/components/creative/dashboard/dashboardTopbar";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import { useRouter, useParams } from "next/navigation";
import { Loader2, X, ChevronDown, ChevronUp, Download, FileText, PlayCircle, Headphones, Check, BookOpen } from "lucide-react";
import { useCourseStore } from "../../../lib/stores/courseStore";
import { useCreativeProfile } from "@/app/lib/hooks/useCreativeProfile";
import { useCourseDetail } from "@/app/lib/hooks/useCourseDetail";
import { apiRequest } from "@/app/lib/api";

function getYouTubeId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function isDocumentResource(resource?: { resourceType: string; resourceUrl: string }): boolean {
  if (!resource) return false;
  if (resource.resourceType === "ARTICLE") return true;
  return resource.resourceUrl?.toLowerCase().endsWith(".pdf") ?? false;
}

function ResourceTypeIcon({ resourceType, resourceUrl }: { resourceType: string; resourceUrl: string }) {
  if (isDocumentResource({ resourceType, resourceUrl })) {
    return <FileText size={13} className="text-gray-400 shrink-0" />;
  }
  if (resourceType === "AUDIO") {
    return <Headphones size={13} className="text-gray-400 shrink-0" />;
  }
  return <PlayCircle size={13} className="text-gray-400 shrink-0" />;
}

interface EnrollmentState {
  courseId: string;
  enrolled: boolean;
  status: string; // "PENDING_ACTIVATION" | "IN_PROGRESS" | "COMPLETED"
  progressPercentage: number;
  completedSections: string[];
  certificateIncluded: boolean;
  certificateReady: boolean;
  certificatePending: boolean;
}

const CERT_POLL_INTERVAL_MS = 5000;
const CERT_MAX_POLL_ATTEMPTS = 12;

const CourseDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;

  const storeCourse = useCourseStore((s) => s.selectedCourse);
  const { course, loading: courseLoading, error: courseError } = useCourseDetail(courseId);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  // Resources have no id field from the API — resourceUrl is unique per
  // resource, so it's used as the stable identifier throughout this page.
  const [activeResourceKey, setActiveResourceKey] = useState<string | null>(null);
  // Modules have no id field either — moduleNumber is the stable identifier
  // the API does provide.
  const [openModuleNumber, setOpenModuleNumber] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { profile, loading: profileLoading, error } = useCreativeProfile();

  const [enrollment, setEnrollment] = useState<EnrollmentState | null>(null);
  const [enrollmentChecked, setEnrollmentChecked] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const [progressSubmitting, setProgressSubmitting] = useState(false);
  const [completeSubmitting, setCompleteSubmitting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);
  const [certPolling, setCertPolling] = useState(false);
  const [certError, setCertError] = useState<string | null>(null);
  const [addingToProfile, setAddingToProfile] = useState(false);
  const [addedToProfile, setAddedToProfile] = useState(false);
  const certAttemptsRef = useRef(0);
  const certCancelledRef = useRef(false);

  useEffect(() => {
    if (!courseLoading && !course && !storeCourse) {
      router.replace("/creative/learning-hub");
    }
  }, [course, storeCourse, courseLoading, router]);

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const tokenRes = await fetch("/api/auth/session/token", { credentials: "include" });
    const { token } = await tokenRes.json();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchCertificate = useCallback(async () => {
    if (!course) return;
    certCancelledRef.current = false;
    certAttemptsRef.current = 0;
    setCertPolling(true);
    setCertError(null);

    const poll = async () => {
      if (certCancelledRef.current) return;
      try {
        const headers = await getAuthHeaders();
        const res = await apiRequest<any>(`/api/v1/learning/courses/${course.id}/certificate`, {
          method: "GET",
          headers,
        });
        const data = res.data?.data ?? res.data;
        if (data?.certificateUrl) {
          setCertificateUrl(data.certificateUrl);
          setAddedToProfile(Boolean(data.addedToProfile));
          setCertPolling(false);
          return;
        }
      } catch (err: any) {
        const status = err?.status ?? err?.response?.status;
        if (status && status !== 404) {
          setCertError("Couldn't load your certificate. Please try again shortly.");
          setCertPolling(false);
          return;
        }
      }

      certAttemptsRef.current += 1;
      if (certAttemptsRef.current >= CERT_MAX_POLL_ATTEMPTS) {
        setCertPolling(false);
        setCertError(
          "Your certificate is taking longer than usual to generate. Check back in a few minutes."
        );
        return;
      }

      setTimeout(poll, CERT_POLL_INTERVAL_MS);
    };

    poll();
  }, [course]);

  useEffect(() => {
    if (!course || enrollmentChecked) return;

    const hasRealEnrollment = Boolean(course.enrollment) && course.enrollment?.enrolled !== false;

    if (hasRealEnrollment && course.enrollment) {
      setEnrollment({
        courseId: course.id,
        enrolled: course.enrollment.enrolled,
        status: course.enrollment.status,
        progressPercentage: course.enrollment.progressPercentage,
        completedSections: course.enrollment.completedSections ?? [],
        certificateIncluded: course.enrollment.certificateIncluded,
        certificateReady: course.enrollment.certificateReady,
        certificatePending: course.enrollment.certificatePending,
      });

      if (course.enrollment.status === "COMPLETED" && course.enrollment.certificateReady) {
        fetchCertificate();
      }
    }

    if (course.modules?.length && !activeResourceKey) {
      setOpenModuleNumber(course.modules[0].moduleNumber);
      const firstVideo = course.modules
        .flatMap((m) => m.resources)
        .find((r) => r.resourceType === "VIDEO");
      if (firstVideo) setActiveResourceKey(firstVideo.resourceUrl);
    }

    setEnrollmentChecked(true);
  }, [course, enrollmentChecked, activeResourceKey, fetchCertificate]);

  useEffect(() => {
    return () => {
      certCancelledRef.current = true;
    };
  }, []);

  const allResources = (course?.modules ?? []).flatMap((m) => m.resources);
  const totalResources = allResources.length;
  const activeResource =
    allResources.find((r) => r.resourceUrl === activeResourceKey) ?? allResources[0];

  const isDocument = isDocumentResource(activeResource);
  const youTubeId =
    activeResource?.resourceType === "VIDEO" ? getYouTubeId(activeResource?.resourceUrl) : null;

  const handleEnroll = async () => {
    if (!course) return;
    setEnrolling(true);
    setEnrollError(null);
    try {
      const headers = await getAuthHeaders();
      const res = await apiRequest<any>(`/api/v1/learning/courses/${course.id}/enroll`, {
        method: "POST",
        headers,
      });
      const data = res.data?.data ?? res.data;
      if (data) setEnrollment(data);
    } catch (err: any) {
      setEnrollError(err?.message ?? "Couldn't enroll in this course. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  const markResourceComplete = useCallback(
    async (resourceKey: string) => {
      if (!course || !enrollment) return;
      if (enrollment.completedSections.includes(resourceKey)) return;

      const updatedSections = [...enrollment.completedSections, resourceKey];
      const newPercentage = totalResources > 0
        ? Math.round((updatedSections.length / totalResources) * 100)
        : 0;

      setProgressSubmitting(true);
      try {
        const headers = await getAuthHeaders();
        const res = await apiRequest<any>(`/api/v1/learning/courses/${course.id}/progress`, {
          method: "PATCH",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({
            completedSections: updatedSections,
            progressPercentage: newPercentage,
          }),
        });
        const updated = res.data?.data ?? res.data;
        if (updated) setEnrollment(updated);
      } catch (err) {
        console.error("Failed to update progress:", err);
      } finally {
        setProgressSubmitting(false);
      }
    },
    [course, enrollment, totalResources]
  );

  const handleSelectResource = (resourceKey: string) => {
    setActiveResourceKey(resourceKey);
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

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (activeResource) markResourceComplete(activeResource.resourceUrl);
  };

  const handleComplete = async () => {
    if (!course) return;
    setCompleteSubmitting(true);
    setCompleteError(null);
    try {
      const headers = await getAuthHeaders();
      const res = await apiRequest<any>(`/api/v1/learning/courses/${course.id}/complete`, {
        method: "POST",
        headers,
      });
      const updated = res.data?.data ?? res.data;
      if (updated) setEnrollment(updated);
      if (updated?.certificateIncluded) {
        fetchCertificate();
      }
    } catch (err: any) {
      setCompleteError(
        err?.message ?? "Couldn't mark this course as completed. Please try again."
      );
    } finally {
      setCompleteSubmitting(false);
    }
  };

  const handleAddToProfile = async () => {
    if (!course) return;
    setAddingToProfile(true);
    try {
      const headers = await getAuthHeaders();
      await apiRequest<any>(`/api/v1/learning/courses/${course.id}/certificate/add-to-profile`, {
        method: "POST",
        headers,
      });
      setAddedToProfile(true);
    } catch (err) {
      console.error("Failed to add certificate to profile:", err);
    } finally {
      setAddingToProfile(false);
    }
  };

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

  if (!course && !storeCourse) return null;

  const userName = profile?.fullName || "Creative";
  const userAvatar =
    profile?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

  const displayTitle = course?.title ?? storeCourse?.title ?? "";
  const displayThumbnail = course?.thumbnailUrl ?? storeCourse?.thumbnail;

  const isResourceComplete = (resourceKey: string) =>
    enrollment?.completedSections.includes(resourceKey) ?? false;

  const allSectionsComplete =
    totalResources > 0 && (enrollment?.completedSections.length ?? 0) >= totalResources;
  const isCourseCompleted = enrollment?.status === "COMPLETED";

  const needsEnrollment = enrollmentChecked && !enrollment;
  const isFreeCourse = course?.isFree || course?.cost === 0;

  const toggleModule = (moduleNumber: number) => {
    setOpenModuleNumber((prev) => (prev === moduleNumber ? null : moduleNumber));
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
          ) : needsEnrollment && isFreeCourse ? (
            <div className="flex flex-col items-center text-center py-16 px-4">
              <div className="w-20 h-20 rounded-full bg-[#fafafa] flex items-center justify-center mb-5">
                <BookOpen size={36} className="text-[#e84545]" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h2>
              <p className="text-sm text-gray-500 mb-6 max-w-md">
                Enroll in this free course to start tracking your progress and
                unlock the certificate on completion.
              </p>
              {enrollError && <p className="text-sm text-red-500 mb-4">{enrollError}</p>}
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="px-10 py-3 bg-[#e84545] hover:bg-[#d03535] text-white font-bold rounded-xl transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {enrolling && <Loader2 size={15} className="animate-spin" />}
                Enroll Now — Free
              </button>
            </div>
          ) : needsEnrollment && !isFreeCourse ? (
            <div className="flex flex-col items-center text-center py-16 px-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h2>
              <p className="text-sm text-gray-500 mb-6 max-w-md">
                This is a paid course. Purchase it from the Learning Hub to get started.
              </p>
              <button
                onClick={() => router.push("/creative/learning-hub")}
                className="px-10 py-3 bg-[#1a1a2e] hover:bg-[#121220] text-white font-bold rounded-xl transition-colors text-sm"
              >
                Back to Learning Hub
              </button>
            </div>
          ) : (
            <>
              {enrollment && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-black">Your Progress</span>
                    <span className="text-sm font-semibold text-black">{enrollment.progressPercentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#e84545] rounded-full transition-all"
                      style={{ width: `${enrollment.progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="relative bg-black rounded-xl overflow-hidden mb-2 aspect-video">
                {!activeResource ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    No content available for this course yet.
                  </div>
                ) : isDocument ? (
                  <div className="w-full h-full bg-white flex flex-col">
                    <iframe
                      src={activeResource.resourceUrl}
                      title={activeResource.title}
                      className="w-full h-full"
                    />
                  </div>
                ) : youTubeId ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${youTubeId}`}
                    title={activeResource.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      src={activeResource.resourceUrl}
                      poster={activeResource.thumbnailUrl ?? displayThumbnail}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={handleVideoEnded}
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
                <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">
                      {isDocument ? "Now viewing" : "Now playing"}: {activeResource.title}
                    </p>
                    {isDocument && (
                      <a
                        href={activeResource.resourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#e84545] hover:text-[#d03535] transition-colors"
                      >
                        <FileText size={13} />
                        Open in new tab
                      </a>
                    )}
                  </div>

                  {isResourceComplete(activeResource.resourceUrl) ? (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                      <Check size={14} /> Completed
                    </span>
                  ) : (
                    <button
                      onClick={() => markResourceComplete(activeResource.resourceUrl)}
                      disabled={progressSubmitting}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {progressSubmitting && <Loader2 size={12} className="animate-spin" />}
                      Mark as {isDocument ? "Read" : "Complete"}
                    </button>
                  )}
                </div>
              )}

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

              <div className="mb-4">
                <h3 className="text-xl font-bold text-black mb-3">Course Description</h3>
                <p className="bg-[#fafafa] p-6 text-md text-black leading-relaxed">
                  {course.description}
                </p>
              </div>

              <div className="mb-5">
                <h3 className="text-xl font-bold text-black mb-3">Course Outline</h3>
                <div className="flex flex-col gap-2">
                  {(course.modules ?? []).map((module) => (
                    <div key={module.moduleNumber} className="overflow-hidden">
                      <button
                        onClick={() => toggleModule(module.moduleNumber)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-[#fafafa] hover:bg-gray-100 transition-colors text-left"
                      >
                        <span className="text-sm font-semibold text-black">
                          {module.moduleNumber}. {module.title}
                        </span>
                        {openModuleNumber === module.moduleNumber ? (
                          <ChevronUp size={16} className="text-gray-500 shrink-0" />
                        ) : (
                          <ChevronDown size={16} className="text-gray-500 shrink-0" />
                        )}
                      </button>
                      {openModuleNumber === module.moduleNumber && (
                        <div className="px-4 py-2 bg-white">
                          {module.resources.map((resource) => (
                            <button
                              key={resource.resourceUrl}
                              onClick={() => handleSelectResource(resource.resourceUrl)}
                              className={`w-full text-left bg-[#fafafa] p-6 flex items-center gap-2 py-1.5 text-sm mb-1 rounded ${
                                resource.resourceUrl === activeResourceKey ? "ring-2 ring-[#e84545]" : ""
                              } text-black`}
                            >
                              <ResourceTypeIcon
                                resourceType={resource.resourceType}
                                resourceUrl={resource.resourceUrl}
                              />
                              <span>{resource.title}</span>
                              {isResourceComplete(resource.resourceUrl) && (
                                <Check size={13} className="text-green-500 shrink-0" />
                              )}
                              <span className="ml-auto text-xs text-gray-400">({resource.duration})</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center mb-6">
                {completeError && (
                  <p className="text-sm text-red-500 mb-3">{completeError}</p>
                )}
                <button
                  onClick={handleComplete}
                  disabled={!allSectionsComplete || completeSubmitting || isCourseCompleted}
                  className="px-16 py-3 bg-[#e84545] hover:bg-[#d03535] text-white font-bold rounded-xl transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {completeSubmitting && <Loader2 size={15} className="animate-spin" />}
                  {isCourseCompleted
                    ? "Course Completed"
                    : allSectionsComplete
                    ? "Complete Course"
                    : `Complete all sections to finish (${enrollment?.completedSections.length ?? 0}/${totalResources})`}
                </button>
              </div>

              {isCourseCompleted && enrollment?.certificateIncluded && (
                <div className="bg-[#fafafa] border border-gray-100 rounded-xl p-6 mb-10">
                  {certificateUrl ? (
                    <>
                      <h3 className="text-lg font-bold text-center text-[#1c1c3a] mb-5">
                        Your Certificate is Ready
                      </h3>
                      <div className="flex justify-center mb-6">
                        <iframe
                          src={certificateUrl}
                          title="Certificate"
                          className="w-full max-w-lg aspect-[1.4/1] rounded-lg border border-gray-200 bg-white"
                        />
                      </div>
                      <div className="flex items-center justify-between px-4">
                        <a
                          href={certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-5 py-2.5 bg-[#e84545] hover:bg-[#d03535] text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                          <Download size={15} />
                          Download Certificate
                        </a>
                        <button
                          onClick={handleAddToProfile}
                          disabled={addingToProfile || addedToProfile}
                          className="px-5 py-2.5 bg-[#e84545] hover:bg-[#d03535] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {addingToProfile && <Loader2 size={14} className="animate-spin" />}
                          {addedToProfile ? "Added to Profile" : "Add to Profile"}
                        </button>
                      </div>
                    </>
                  ) : certPolling ? (
                    <div className="flex flex-col items-center py-6">
                      <Loader2 size={28} className="animate-spin text-[#e84545] mb-3" />
                      <p className="text-sm text-gray-500">
                        Generating your certificate — this usually takes a few seconds…
                      </p>
                    </div>
                  ) : certError ? (
                    <div className="flex flex-col items-center py-6">
                      <p className="text-sm text-red-500 mb-3">{certError}</p>
                      <button
                        onClick={fetchCertificate}
                        className="text-sm font-semibold text-[#e84545] hover:text-[#d03535] underline"
                      >
                        Try again
                      </button>
                    </div>
                  ) : null}
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