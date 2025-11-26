// store/useFieldMonitorStore.ts
import { create } from "zustand";

interface FieldMonitorState {
  values: Record<string, any>;
  setValue: (key: string, value: any) => void;
  loadDefaults: (schema: any, type: string) => void;
}

export const useFieldMonitorStore = create<FieldMonitorState>((set) => ({
  values: {},

  setValue: (key, value) =>
    set((state) => ({
      values: { ...state.values, [key]: value },
    })),

  loadDefaults: (schema, type) =>
    set(() => {
      const values: Record<string, any> = {};

      const typeDef = schema?.types?.[type];
      if (!typeDef || !Array.isArray(typeDef.fields)) return { values };

      typeDef.fields.forEach((f: any) => {
        values[f.name] =
          f.defaultValue !== undefined ? f.defaultValue : null;
      });

      return { values };
    }),
}));


