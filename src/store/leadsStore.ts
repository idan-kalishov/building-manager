import { create } from "zustand";
import type { Lead } from "../types";

interface LeadsStore {
  leads: Lead[];
  setLeads: (l: Lead[]) => void;
}

export const useLeadsStore = create<LeadsStore>((set) => ({
  leads: [],
  setLeads: (leads) => set({ leads }),
}));
