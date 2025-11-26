import { zustandMMKVStorage } from "@/utils/mmkvStorage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,

      login: () => set({ isLoggedIn: true }),

      logout: () => set({ isLoggedIn: false }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);
