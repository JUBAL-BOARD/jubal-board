import { create } from "zustand";

type IDType = "National Identity card(NIN)" | "Voter's Card" | "Driver's License" | "International Passport" | "Others";

interface VerificationStore {
  selfieFile: File | null;
  selfiePreview: string;
  idType: IDType;
  idFile: File | null;
  idPreview: string;
  businessDocFile: File | null;
  businessDocPreview: string;
  setSelfie: (file: File, preview: string) => void;
  setIdType: (type: IDType) => void;
  setIdFile: (file: File, preview: string) => void;
  setBusinessDoc: (file: File, preview: string) => void;
  reset: () => void;
}

export const useVerificationStore = create<VerificationStore>((set) => ({
  selfieFile: null,
  selfiePreview: "",
  idType: "National Identity card(NIN)",
  idFile: null,
  idPreview: "",
  businessDocFile: null,
  businessDocPreview: "",
  setSelfie: (file, preview) => set({ selfieFile: file, selfiePreview: preview }),
  setIdType: (type) => set({ idType: type }),
  setIdFile: (file, preview) => set({ idFile: file, idPreview: preview }),
  setBusinessDoc: (file, preview) => set({ businessDocFile: file, businessDocPreview: preview }),
  reset: () => set({
    selfieFile: null, selfiePreview: "",
    idType: "National Identity card(NIN)",
    idFile: null, idPreview: "",
    businessDocFile: null, businessDocPreview: "",
  }),
}));