import { create } from "zustand";
import { CourseSummary } from "@/app/lib/hooks/useLearningHub";

type CourseStore = {
  selectedCourse: CourseSummary | null;
  setSelectedCourse: (course: CourseSummary) => void;
};

export const useCourseStore = create<CourseStore>((set) => ({
  selectedCourse: null,
  setSelectedCourse: (course) => set({ selectedCourse: course }),
}));