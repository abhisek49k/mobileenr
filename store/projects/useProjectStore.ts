import { create } from 'zustand';

// Define the state structure
interface ProjectState {
  projectId: string | null;
  projectName: string | null;
}

// Define the actions to update the state
interface ProjectActions {
  setProject: (id: string, name: string) => void;
  clearProject: () => void;
}

const initialState: ProjectState = {
  projectId: null,
  projectName: null,
};

// Create the store
export const useProjectStore = create<ProjectState & ProjectActions>((set) => ({
  ...initialState,
  setProject: (id, name) => set({ projectId: id, projectName: name }),
  clearProject: () => set(initialState),
}));