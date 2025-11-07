// store/network.ts
import { create } from 'zustand';

interface NetworkState {
  isOnline: boolean;
  setOnline: (status: boolean) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isOnline: true, // assume initially online
  setOnline: (status) => set({ isOnline: status }),
}));
