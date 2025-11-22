import { create } from 'zustand'

// NOTE: MMKV import and setup are completely removed
// import { createMMKV } from 'react-native-mmkv'
// const formStorage = createMMKV({ id: 'truck-form-values' })

interface TruckFormState {
  values: Record<string, any> // fieldId → value
  setValue: (fieldId: string, value: any) => void
  reset: () => void
  loadDefaults: (schema: any) => void
}

// 💡 Initial values start as an empty object in memory
const initialValues = {}

export const useTruckFormStore = create<TruckFormState>((set, get) => ({
  values: initialValues, // Initialize with empty object

  // 🔹 Update state dynamically (in-memory only)
  setValue: (fieldId, value) => {
    const updated = { ...get().values, [fieldId]: value }
    set({ values: updated })
    // MMKV persistence removed here: formStorage.set(...)
  },

  // 🔹 Load default values from schema (on first mount)
  loadDefaults: (schema) => {
    const defaults: Record<string, any> = {}
    schema?.sections?.forEach((section: any) => {
      section.fields?.forEach((field: any) => {
        // Use field.name for key to match the schema and rendering logic
        // This sets the initial default value, or null if no default is specified
        defaults[field.name] = field.defaultValue ?? null 
      })
    })

    // Merge existing in-memory values over new defaults to preserve any input
    const finalValues = { ...defaults, ...get().values }
    
    set({ values: finalValues })
    // MMKV persistence removed here: formStorage.set(...)
  },

  // 🔹 Reset all (in-memory only)
  reset: () => {
    set({ values: {} })
    // MMKV removal removed here: formStorage.remove(...)
  },
}))