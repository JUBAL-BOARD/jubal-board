import { create } from "zustand";
import { FreshGig } from "@/app/types";

type GigStore = {
  selectedGig: FreshGig | null;
  setSelectedGig: (gig: FreshGig) => void;
};

export const useGigStore = create<GigStore>((set) => ({
  selectedGig: null,
  setSelectedGig: (gig) => set({ selectedGig: gig }),
}));