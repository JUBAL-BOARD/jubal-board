import { create } from "zustand";

export interface BriefFormData {
  jobTitle: string;
  projectCategory: string;
  projectCategoryId: string;
  specificSkills: string;
  specificSkillIds: string[];
  specificSkillNames: string[];
  jobDescription: string;
  referenceFile: File | null;
  referenceFileName: string;
  numCreatives: string;
  currency: string;
  budgetMin: string;
  budgetMax: string;
  timelineValue: string;
  timelineUnit: string;
  deliveryDate: string;
  modeOfProject: string;
  location: string;
}

interface BriefStore {
  form: BriefFormData;
  setField: (field: keyof BriefFormData, value: string | string[] | File | null) => void;
  reset: () => void;
}

const defaultForm: BriefFormData = {
  jobTitle: "",
  projectCategory: "",
  projectCategoryId: "",
  specificSkills: "",
  specificSkillIds: [],
  specificSkillNames: [],
  jobDescription: "",
  referenceFile: null,
  referenceFileName: "",
  numCreatives: "1 creative",
  currency: "Dollars ($)",
  budgetMin: "",
  budgetMax: "",
  timelineValue: "",
  timelineUnit: "days",
  deliveryDate: "",
  modeOfProject: "Virtual",
  location: "",
};

export const useBriefStore = create<BriefStore>((set) => ({
  form: defaultForm,
  setField: (field, value) =>
    set((state) => ({ form: { ...state.form, [field]: value } })),
  reset: () => set({ form: defaultForm }),
}));