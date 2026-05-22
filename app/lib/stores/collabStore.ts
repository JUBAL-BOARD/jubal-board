import { create } from "zustand";

type CollabStore = {
  activeProjectTitle: string | null;
  setActiveProjectTitle: (title: string) => void;
};

export const useCollabStore = create<CollabStore>((set) => ({
  activeProjectTitle: null,
  setActiveProjectTitle: (title) => set({ activeProjectTitle: title }),
}));