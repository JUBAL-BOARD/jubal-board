"use client";

import { useState, useRef, useEffect } from "react";
import { Star, Loader2, X, ExternalLink } from "lucide-react";
import { CourseSummary } from "@/app/lib/hooks/useLearningHub";
import { useRouter } from "next/navigation";
import { useCourseStore } from "../../../lib/stores/courseStore";

interface Props {
  title: string;
  courses: CourseSummary[];
  search: string;
  activeChip: string;
  enrolledCourseIds: string[];
  processingCourseIds?: string[];
  onEnrolled?: () => void;
  fetchMyCourses?: () => Promise<{ active: CourseSummary[]; processing: CourseSummary[] }>;
}

const levelColors: Record<string, string> = {
  Beginners: "bg-blue-900 text-white",
  "All Levels": "bg-blue-900 text-white",
  Advanced: "bg-purple-900 text-white",
  "Mid-Level": "bg-teal-900 text-white",
};

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 60; // 5 minutes of active polling within the modal

// How long a `processing` record is trusted as "still genuinely in flight"
// before we treat it as abandoned/cancelled and let the user purchase again.
// There's no backend signal for cancellation — Flutterwave never tells us
// the user backed out — so this is a client-side heuristic only.
const STALE_PURCHASE_MS = 5 * 60 * 1000;

const purchaseTimestampKey = (courseId: string) => `purchase_initiated_${courseId}`;

const getPurchaseTimestamp = (courseId: string): number | null => {
  try {
    const raw = localStorage.getItem(purchaseTimestampKey(courseId));
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
};

const setPurchaseTimestamp = (courseId: string) => {
  try {
    localStorage.setItem(purchaseTimestampKey(courseId), String(Date.now()));
  } catch {
    // localStorage unavailable (e.g. private mode) — staleness check will
    // just treat this course as immediately stale on next load, which is
    // an acceptable fallback (worst case: one extra purchase click).
  }
};

const clearPurchaseTimestamp = (courseId: string) => {
  try {
    localStorage.removeItem(purchaseTimestampKey(courseId));
  } catch {}
};

const isPurchaseStale = (courseId: string): boolean => {
  const ts = getPurchaseTimestamp(courseId);
  if (ts === null) return true; // no record on this device = treat as stale
  return Date.now() - ts > STALE_PURCHASE_MS;
};

const CourseSection: React.FC<Props> = ({
  title,
  courses,
  search,
  activeChip,
  enrolledCourseIds,
  processingCourseIds = [],
  onEnrolled,
  fetchMyCourses,
}) => {
  const router = useRouter();
  const setSelectedCourse = useCourseStore((s) => s.setSelectedCourse);

  const [optimisticEnrolledIds, setOptimisticEnrolledIds] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [errorByCourse, setErrorByCourse] = useState<Record<string, string>>({});

  // Courses we've determined are stale-processing (backend still says
  // "processing" but our local timestamp says it's been too long) — these
  // should show "Purchase Course" again instead of "Payment Processing…".
  const [staleProcessingIds, setStaleProcessingIds] = useState<Set<string>>(new Set());

  // ── Paid-course checkout status panel state ──
  // No iframe anymore — Flutterwave does a top-level redirect to a callback
  // URL, which can't live inside an iframe. Checkout opens in a new tab;
  // this panel just shows status while we poll in the background.
  const [checkoutCourse, setCheckoutCourse] = useState<CourseSummary | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [pollTimedOut, setPollTimedOut] = useState(false);
  const pollAttemptsRef = useRef(0);
  const pollCancelledRef = useRef(false);

  const enrolledSet = new Set([...enrolledCourseIds, ...optimisticEnrolledIds]);

  // Re-check staleness for every processing course whenever the list of
  // processing ids changes (e.g. on page load, or after a refetch).
  useEffect(() => {
    if (processingCourseIds.length === 0) return;
    const stale = processingCourseIds.filter((id) => isPurchaseStale(id));
    if (stale.length > 0) {
      setStaleProcessingIds((prev) => new Set([...prev, ...stale]));
      stale.forEach(clearPurchaseTimestamp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processingCourseIds.join(",")]);

  // A course only shows "Payment Processing…" if the backend says it's
  // processing AND our local timestamp says that's still fresh.
  const genuinelyProcessingSet = new Set(
    processingCourseIds.filter((id) => !staleProcessingIds.has(id))
  );

  const filtered = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesChip =
      activeChip === "All Tutorials" ||
      c.level === activeChip ||
      (activeChip === "Duration" && true);
    return matchesSearch && matchesChip;
  });

  if (filtered.length === 0) return null;

  const goToCourse = (course: CourseSummary) => {
    setSelectedCourse(course);
    router.push(`/creative/learning-hub/${course.id}`);
  };

  const clearCourseError = (courseId: string) => {
    setErrorByCourse((prev) => {
      const next = { ...prev };
      delete next[courseId];
      return next;
    });
  };

  // ── Free course enroll (unchanged behavior) ──
  const enrollFree = async (course: CourseSummary) => {
    setPendingId(course.id);
    clearCourseError(course.id);

    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();

      if (!token) {
        router.push("/signin");
        return;
      }

      const res = await fetch(`/api/v1/learning/courses/${course.id}/enroll`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const alreadyEnrolled = res.status === 409;

      if (res.ok || alreadyEnrolled) {
        setOptimisticEnrolledIds((prev) => new Set(prev).add(course.id));
        onEnrolled?.();
        goToCourse(course);
        return;
      }

      const body = await res.json().catch(() => null);
      throw new Error(body?.message ?? `Failed to enroll (${res.status})`);
    } catch (err) {
      setErrorByCourse((prev) => ({
        ...prev,
        [course.id]: err instanceof Error ? err.message : "Something went wrong",
      }));
    } finally {
      setPendingId(null);
    }
  };

  // ── Paid course purchase: POST /purchase, open checkout in a new tab ──
  const purchasePaid = async (course: CourseSummary) => {
    setPendingId(course.id);
    clearCourseError(course.id);

    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();

      if (!token) {
        router.push("/signin");
        return;
      }

      const res = await fetch(`/api/v1/learning/courses/${course.id}/purchase`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const body = await res.json().catch(() => null);

      if (res.status === 201 && body?.data?.authorizationUrl) {
        const url = body.data.authorizationUrl as string;

        // Fresh attempt — clear any stale flag for this course and stamp
        // a new timestamp so the 5-minute staleness window restarts.
        setStaleProcessingIds((prev) => {
          const next = new Set(prev);
          next.delete(course.id);
          return next;
        });
        setPurchaseTimestamp(course.id);

        const opened = window.open(url, "_blank", "noopener,noreferrer");
        setPopupBlocked(!opened);
        setCheckoutCourse(course);
        setCheckoutUrl(url);
        startPolling(course);
        return;
      }

      if (res.status === 400 && body?.message?.toLowerCase().includes("already enrolled")) {
        setOptimisticEnrolledIds((prev) => new Set(prev).add(course.id));
        clearPurchaseTimestamp(course.id);
        onEnrolled?.();
        return;
      }

      if (res.status === 403) {
        throw new Error("This course is available to Premium creatives only.");
      }

      // Anything else (e.g. backend says "purchase already pending" for a
      // genuinely-fresh attempt) — surface it rather than spinning forever.
      throw new Error(body?.message ?? `Couldn't start checkout (${res.status})`);
    } catch (err) {
      setErrorByCourse((prev) => ({
        ...prev,
        [course.id]: err instanceof Error ? err.message : "Something went wrong",
      }));
    } finally {
      setPendingId(null);
    }
  };

  // ── Poll my-courses until the course leaves `processing` and lands in `active` ──
  const startPolling = (course: CourseSummary) => {
    pollCancelledRef.current = false;
    pollAttemptsRef.current = 0;
    setPollTimedOut(false);

    const poll = async () => {
      if (pollCancelledRef.current) return;

      try {
        const result = await fetchMyCourses?.();
        const stillProcessing = result?.processing?.some(
          (c: any) => c.courseId === course.id || c.id === course.id
        );
        const nowActive = result?.active?.some(
          (c: any) => c.courseId === course.id || c.id === course.id
        );

        if (nowActive && !stillProcessing) {
          setOptimisticEnrolledIds((prev) => new Set(prev).add(course.id));
          clearPurchaseTimestamp(course.id);
          onEnrolled?.();
          closeCheckoutPanel();
          return;
        }
      } catch {
        // Network blip — keep polling, don't surface an error mid-payment.
      }

      pollAttemptsRef.current += 1;
      if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) {
        setPollTimedOut(true);
        return;
      }

      setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();
  };

  const closeCheckoutPanel = () => {
    pollCancelledRef.current = true;
    setCheckoutCourse(null);
    setCheckoutUrl(null);
    setPopupBlocked(false);
    setPollTimedOut(false);
  };

  useEffect(() => {
    return () => {
      pollCancelledRef.current = true;
    };
  }, []);

  const isPaidCourse = (course: CourseSummary) =>
    course.paid === true || (typeof course.price === "number" && course.price > 0);

  const handleStartCourse = (course: CourseSummary) => {
    if (enrolledSet.has(course.id)) {
      goToCourse(course);
      return;
    }
    if (isPaidCourse(course)) {
      purchasePaid(course);
    } else {
      enrollFree(course);
    }
  };

  const reopenCheckout = () => {
    if (checkoutUrl) {
      const opened = window.open(checkoutUrl, "_blank", "noopener,noreferrer");
      setPopupBlocked(!opened);
    }
  };

  return (
    <section className="mb-8">
      <h2 className="text-xl lg:text-2xl font-bold font-heading text-black mb-4">{title}</h2>

      <div className="flex gap-4 overflow-x-auto lg:overflow-x-visible lg:grid lg:grid-cols-3 pb-2 lg:pb-0 snap-x snap-mandatory scroll-smooth scrollbar-hide">
        {filtered.map((course) => {
          const isEnrolled = enrolledSet.has(course.id);
          const isProcessing = genuinelyProcessingSet.has(course.id);
          const isPending = pendingId === course.id;
          const courseError = errorByCourse[course.id];
          const paid = isPaidCourse(course);

          let buttonLabel: string;
          if (isPending) {
            buttonLabel = paid ? "Starting checkout…" : "Enrolling…";
          } else if (isProcessing) {
            buttonLabel = "Payment Processing…";
          } else if (isEnrolled) {
            buttonLabel = "Continue Course";
          } else if (paid) {
            buttonLabel = "Purchase Course";
          } else {
            buttonLabel = "Start Course";
          }

          return (
            <div
              key={course.id}
              className="flex-shrink-0 w-[70vw] sm:w-[45vw] lg:w-auto snap-start bg-[#fafafa] overflow-hidden hover:shadow-md transition-shadow group"
            >
              {/* Thumbnail */}
              <div className="relative h-32 lg:h-36 bg-gray-100 overflow-hidden">
                <img
                  src={course.image as string}
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
                <h4 className="font-semibold font-heading text-black text-sm text-center mb-2">{course.title}</h4>

                <div className="flex justify-center mb-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${levelColors[course.level as string] ?? "bg-gray-100 text-black"}`}>
                    {course.level}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-black">Format: {course.format as string}</span>
                  <div className="flex items-center gap-0.5">
                    <Star size={11} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-medium text-black">{course.rating as number}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-black">Duration: {course.duration}</span>
                  <span className="text-xs font-medium text-green-600">${course.price as number}</span>
                </div>

                <p className="text-xs text-black font-body mb-3 line-clamp-2">{course.description as string}</p>

                {courseError && (
                  <p className="text-[10px] text-red-500 text-center mb-2">{courseError}</p>
                )}

                <div className="text-center">
                  <button
                    onClick={() => handleStartCourse(course)}
                    disabled={isPending || isProcessing}
                    className="w-[60%] mx-auto bg-[#E2554F] hover:bg-red-600 disabled:opacity-60 text-white text-xs font-semibold py-2 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    {(isPending || isProcessing) && <Loader2 size={12} className="animate-spin" />}
                    {buttonLabel}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Checkout status panel (Flutterwave runs in its own tab) ── */}
      {checkoutCourse && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-black">
                {checkoutCourse.title}
              </span>
              {pollTimedOut && (
                <button onClick={closeCheckoutPanel} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="px-6 py-8 flex flex-col items-center text-center gap-4">
              {popupBlocked ? (
                <>
                  <p className="text-sm text-gray-600">
                    Your browser blocked the checkout popup.
                  </p>
                  <button
                    onClick={reopenCheckout}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#E2554F] hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    <ExternalLink size={15} />
                    Open Checkout
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600">
                    Complete your payment in the tab that just opened.
                  </p>
                  <button
                    onClick={reopenCheckout}
                    className="flex items-center gap-2 text-xs font-semibold text-[#E2554F] hover:text-red-600 transition-colors"
                  >
                    <ExternalLink size={13} />
                    Didn't open? Click here
                  </button>
                </>
              )}

              <div className="flex items-center gap-2 mt-2">
                {!pollTimedOut && <Loader2 size={13} className="animate-spin text-gray-400" />}
                <p className="text-xs text-gray-500">
                  {pollTimedOut
                    ? "Still waiting on confirmation — you can close this and check back shortly."
                    : "We'll detect when your payment is confirmed automatically."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CourseSection;