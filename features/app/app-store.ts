import { create } from 'zustand';

type AppState = {
  activeHouseholdId: string | null;
  setActiveHouseholdId: (householdId: string | null) => void;
};

export const useAppStore = create<AppState>((set) => ({
  activeHouseholdId: null,
  setActiveHouseholdId: (householdId) => set({ activeHouseholdId: householdId }),
}));
