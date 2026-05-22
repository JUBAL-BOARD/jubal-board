import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "../api";

export interface Course {
  id: string;
  title: string;
  level?: string;
  format?: string;
  skillTag?: string;
  paid?: boolean;
  thumbnail?: string;
  duration?: string;
  instructor?: string;
  progress?: number;
  [key: string]: unknown;
}

export interface MyCourses {
  active: Course[];
  completed: Course[];
  certifications: Course[];
}

interface FetchCoursesParams {
  level?: string;
  format?: string;
  skillTag?: string;
  paid?: boolean;
  page?: number;
  limit?: number;
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

const toArray = (val: unknown): Course[] => {
  if (Array.isArray(val)) return val;
  return [];
};

export const useLearningHub = () => {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [beginnerCourses, setBeginnerCourses] = useState<Course[]>([]);
  const [advancedCourses, setAdvancedCourses] = useState<Course[]>([]);
  const [myCourses, setMyCourses] = useState<MyCourses>({
    active: [],
    completed: [],
    certifications: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async (params: FetchCoursesParams = {}): Promise<Course[]> => {
    const token = await getToken();
    const query = new URLSearchParams();
    if (params.level) query.set("level", params.level);
    if (params.format) query.set("format", params.format);
    if (params.skillTag) query.set("skillTag", params.skillTag);
    if (params.paid !== undefined) query.set("paid", String(params.paid));
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));

    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      const res = await apiRequest<any>(
        `/api/v1/learning/courses?${query.toString()}`,
        { method: "GET", headers }
      );
      // Handle all possible response shapes
      return toArray(res.data?.data ?? res.data?.courses ?? res.data);
    } catch {
      return [];
    }
  }, []);

  const fetchMyCourses = useCallback(async (): Promise<MyCourses> => {
    const empty = { active: [], completed: [], certifications: [] };
    try {
      const token = await getToken();
      if (!token) return empty;

      const res = await apiRequest<any>("/api/v1/learning/my-courses", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const d = res.data?.data ?? res.data ?? {};
      return {
        active: toArray(d.active),
        completed: toArray(d.completed),
        certifications: toArray(d.certifications),
      };
    } catch {
      return empty;
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [all, beginner, advanced, my] = await Promise.all([
        fetchCourses({ limit: 20 }),
        fetchCourses({ level: "BEGINNER", limit: 10 }),
        fetchCourses({ level: "ADVANCED", limit: 10 }),
        fetchMyCourses(),
      ]);
      setAllCourses(all);
      setBeginnerCourses(beginner);
      setAdvancedCourses(advanced);
      setMyCourses(my);
    } catch (err) {
      console.error("Learning hub fetch error:", err);
      setError("Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [fetchCourses, fetchMyCourses]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return {
    allCourses,
    beginnerCourses,
    advancedCourses,
    myCourses,
    loading,
    error,
    refetch: loadAll,
    fetchCourses,
  };
};