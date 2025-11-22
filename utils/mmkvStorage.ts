import { StateStorage } from "zustand/middleware";
import { createMMKV } from "react-native-mmkv";

const mmkv = createMMKV();

export const zustandMMKVStorage: StateStorage = {
  getItem: (name: string): Promise<string | null> => {
    const value = mmkv.getString(name);
    return Promise.resolve(value ?? null);
  },

  setItem: (name: string, value: string): Promise<void> => {
    mmkv.set(name, value);
    return Promise.resolve();
  },

  removeItem: (name: string): Promise<void> => {
    mmkv.remove(name);
    return Promise.resolve();
  },
};
