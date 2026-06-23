
import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "../api";

export interface CourseResource {
  id: string;
  resourceType: string; // "VIDEO" | "ARTICLE" | "QUIZ" | etc.
  title: string;
  resourceUrl: string;
  duration: string;
  thumbnailUrl?: string | null;
  order: number;
}

export interface CourseModule {
  id: string;
  moduleNumber: number;
  title: string;
  description: string;
  resources: CourseResource[];
}

export interface CourseEnrollment {
  courseId: string;
  enrolled: boolean;
  status: string; // "NOT_ENROLLED" | "IN_PROGRESS" | "COMPLETED"
  progressPercentage: number;
  completedSections: string[];
  certificateIncluded: boolean;
  certificateReady: boolean;
  certificatePending: boolean;
}

export interface CourseDetail {
  id: string;
  title: string;
  thumbnailUrl: string;
  provider: string;
  description: string;
  level: string;
  format: string;
  duration: string;
  cost: number;
  isFree: boolean;
  certificateIncluded: boolean;
  skillTags: string[];
  isFeatured: boolean;
  rating: number;
  enrollment?: CourseEnrollment;
  modules?: CourseModule[];
}

const getToken = async (): Promise<string | null> => {
  try {
    const res = await fetch("/api/auth/session/token", { credentials: "include" });
    const { token } = await res.json();
    return token ?? null;
  } catch {
    return null;
  }
};

export const useCourseDetail = (courseId: string | undefined) => {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourse = useCallback(async () => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await apiRequest<any>(`/api/v1/learning/courses/${courseId}`, {
        method: "GET",
        headers,
      });

      const data = res.data?.data ?? res.data ?? null;
      setCourse(data);
    } catch (err) {
      console.error("Course detail fetch error:", err);
      setError("Failed to load course. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  return { course, loading, error, refetch: fetchCourse };
};