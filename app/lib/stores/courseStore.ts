import { create } from "zustand";
import { Course } from "@/app/types";

type CourseStore = {
  selectedCourse: Course | null;
  setSelectedCourse: (course: Course) => void;
};

export const useCourseStore = create<CourseStore>((set) => ({
  selectedCourse: null,
  setSelectedCourse: (course) => set({ selectedCourse: course }),
}));