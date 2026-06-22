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

export interface Resource {
  id: string;
  title: string;
  resourceType?: string; // "YOUTUBE" | "BLOG" | "QUICK_READ" | "VIDEO"
  resourceUrl?: string;
  thumbnailUrl?: string | null;
  level?: string;
  skillTags?: string[];
  duration?: string;
  sourceName?: string;
  descriptionPreview?: string;
  isFeatured?: boolean;
  createdAt?: string;
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

interface FetchResourcesParams {
  level?: string;
  type?: string; // YOUTUBE | BLOG | QUICK_READ | VIDEO
  skillTag?: string;
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

const toArray = <T,>(val: unknown): T[] => {
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
  const [resources, setResources] = useState<Resource[]>([]);
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
      return toArray<Course>(res.data?.data ?? res.data?.courses ?? res.data);
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
        active: toArray<Course>(d.active),
        completed: toArray<Course>(d.completed),
        certifications: toArray<Course>(d.certifications),
      };
    } catch {
      return empty;
    }
  }, []);

  // Mirrors fetchCourses: same defensive token handling, same nested
  // `data.data` response shape (`{ success, data: { data: [...], meta } }`).
  // NOTE: this endpoint does NOT accept page/limit — sending them causes
  // a "property limit should not exist" validation error from the backend.
  const fetchResources = useCallback(async (params: FetchResourcesParams = {}): Promise<Resource[]> => {
    const token = await getToken();
    const query = new URLSearchParams();
    if (params.level) query.set("level", params.level);
    if (params.type) query.set("type", params.type);
    if (params.skillTag) query.set("skillTag", params.skillTag);

    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      const res = await apiRequest<any>(
        `/api/v1/learning/resources?${query.toString()}`,
        { method: "GET", headers }
      );
      return toArray<Resource>(res.data?.data ?? res.data?.resources ?? res.data);
    } catch {
      return [];
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [all, beginner, advanced, my, resourceList] = await Promise.all([
        fetchCourses({ limit: 20 }),
        fetchCourses({ level: "BEGINNER", limit: 10 }),
        fetchCourses({ level: "ADVANCED", limit: 10 }),
        fetchMyCourses(),
        fetchResources(),
      ]);
      setAllCourses(all);
      setBeginnerCourses(beginner);
      setAdvancedCourses(advanced);
      setMyCourses(my);
      setResources(resourceList);
    } catch (err) {
      console.error("Learning hub fetch error:", err);
      setError("Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [fetchCourses, fetchMyCourses, fetchResources]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return {
    allCourses,
    beginnerCourses,
    advancedCourses,
    myCourses,
    resources,
    loading,
    error,
    refetch: loadAll,
    fetchCourses,
    fetchResources,
  };
};