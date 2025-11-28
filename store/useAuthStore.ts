import { zustandMMKVStorage } from "@/utils/mmkvStorage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface User {
  name: string;
  email: string;
  memberSince: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const mockUser: User = {
  name: 'Alex Mercer',
  email: 'a.mercer@blackwatch.gov',
  memberSince: '2024-03-01',
  role: 'E&R Admin',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null, // Initialize user as null
      isLoggedIn: false,

      // Expects user data on successful login
      login: () => set({ 
        isLoggedIn: true, 
        user: mockUser 
      }),

      // Clears user data on logout
      logout: () => set({ 
        isLoggedIn: false, 
        user: null 
      }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);