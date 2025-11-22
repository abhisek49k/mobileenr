import { create } from "zustand";
import type { Project } from "@/components/ProjectListItem";

export interface ContractorOption {
  label: string;
  value: string;
}

interface ProjectState {
  selectedProject: Project | null;
  selectedPrime: ContractorOption | null;
  selectedSub: ContractorOption | null;
}

interface ProjectActions {
  setProject: (project: Project) => void;

  setPrimeContractor: (contractor: ContractorOption | null) => void;
  setSubContractor: (contractor: ContractorOption | null) => void;

  clearProject: () => void;
}

const initialState: ProjectState = {
  selectedProject: null,
  selectedPrime: null,
  selectedSub: null,
};

export const useProjectStore = create<ProjectState & ProjectActions>((set) => ({
  ...initialState,

  setProject: (project) =>
    set({
      selectedProject: project,
      selectedPrime: null, // reset when changing project
      selectedSub: null,   // reset when changing project
    }),

  setPrimeContractor: (contractor) => set({ selectedPrime: contractor }),

  setSubContractor: (contractor) => set({ selectedSub: contractor }),

  clearProject: () => set(initialState),
}));
