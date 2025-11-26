import { create } from "zustand";
import type { Project } from "@/components/ProjectListItem";

export interface Option {
  label: string;
  value: string;
}

interface ProjectState {
  selectedProject: Project | null;
  selectedPrime: Option | null;
  selectedSub: Option | null;
  selectedDebris: Option | null;
  selectedDisposal: Option | null;
  selectedTicket: Option | null
}

interface ProjectActions {
  setProject: (project: Project) => void;
  setPrimeContractor: (contractor: Option | null) => void;
  setSubContractor: (contractor: Option | null) => void;
  setDebrisType: (debrisSite: Option | null) => void;
  setDisposalType: (disposalSite: Option | null) => void;
  setTicketType: (ticket_type: Option | null) => void;
  clearProject: () => void;
}

const initialState: ProjectState = {
  selectedProject: null,
  selectedPrime: null,
  selectedSub: null,
  selectedDebris: null,
  selectedDisposal: null,
  selectedTicket: null
};

export const useProjectStore = create<ProjectState & ProjectActions>((set) => ({
  ...initialState,

  setProject: (project) =>
    set({
      selectedProject: project,
      selectedPrime: null, // reset when changing project
      selectedSub: null,   // reset when changing project
      selectedDebris: null,
      selectedDisposal: null,
      selectedTicket: null
    }),

  setPrimeContractor: (contractor) => set({ selectedPrime: contractor }),
  setSubContractor: (contractor) => set({ selectedSub: contractor }),
  setDebrisType: (debrisSite) => set({ selectedDebris: debrisSite }),
  setDisposalType: (disposalSite) => set({ selectedDisposal: disposalSite }),
  setTicketType: (ticket_type) =>  set({ selectedTicket: ticket_type }),  
  clearProject: () => set(initialState),
}));
