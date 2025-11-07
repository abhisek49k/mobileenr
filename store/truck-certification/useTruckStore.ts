import { create } from 'zustand';

// Define the shape of the data for each step
interface DriverDetails {
  driverName: string;
  licenseNumber: string;
}

interface OwnerDetails {
  ownerName: string;
  company: string;
}

// Define the state structure
interface TruckState {
  driverDetails: DriverDetails | null;
  ownerDetails: OwnerDetails | null;
  // Add more properties for other steps here
}

// Define the actions to update the state
interface TruckActions {
  setDriverDetails: (details: DriverDetails) => void;
  setOwnerDetails: (details: OwnerDetails) => void;
  reset: () => void;
}

const initialState: TruckState = {
  driverDetails: null,
  ownerDetails: null,
};

// Create the store
export const useTruckStore = create<TruckState & TruckActions>((set) => ({
  ...initialState,
  setDriverDetails: (details) => set({ driverDetails: details }),
  setOwnerDetails: (details) => set({ ownerDetails: details }),
  reset: () => set(initialState),
}));