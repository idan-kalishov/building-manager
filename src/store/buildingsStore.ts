import { create } from "zustand";
import type { Building } from "../types";

interface BuildingsStore {
  buildings: Building[];
  setBuildings: (b: Building[]) => void;
}

export const useBuildingsStore = create<BuildingsStore>((set) => ({
  buildings: [],
  setBuildings: (buildings) => set({ buildings }),
}));
