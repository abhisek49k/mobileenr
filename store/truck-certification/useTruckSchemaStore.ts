import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { processSchema } from "@/utils/schemaProcessor";
import { getTruckCertSchema } from "@/api/client";
import { zustandMMKVStorage } from "@/utils/mmkvStorage";
import localSchema from "@/assets/schema/truck-cert.json";

interface Dependency {
  fieldId: string;
  condition: "equals" | "isNotEmpty";
  value?: any;
  actions: { action: "show" }[];
}

interface Field {
  fieldId: string;
  name: string;
  type: string;
  defaultValue?: any;
  dependencies?: Dependency[]; // Field-level dependencies
  calculation?: { formula: string; variables: string[]; unit: string };
  options?: { value: string; icon?: { url?: string; localUri?: string } }[];
  ref_img?: { url?: string; localUri?: string };
  [key: string]: any;
}

interface Section {
  sectionId: string;
  title: string;
  order: number;
  fields: Field[];
  dependencies?: Dependency[]; // Section-level dependencies
  [key: string]: any;
}

interface FormSchema {
  version?: string | number;
  sections: Section[];
  totalSections?: number; // Total sections available in the longest path
  [key: string]: any;
}

// ========================
// MMKV Keys
// ========================
const SCHEMA_KEY = "truck_schema";
const FIELD_MAP_KEY = "truck_field_map";
const VERSION_KEY = "truck_schema_version";

// ========================
// Types
// ========================
interface TruckSchemaState {
  schema: any | null;
  fieldMap: Record<string, any> | null;
  version: string | null;
  loading: boolean;
  syncSchema: () => Promise<void>;
}

// ========================
// Zustand Store
// ========================
export const useTruckSchemaStore = create<TruckSchemaState>()(
  persist(
    (set, get) => ({
      schema: null,
      fieldMap: null,
      version: null,
      loading: true,

      // Sync schema with API + process images + persist in MMKV + Zustand
      syncSchema: async () => {
        set({ loading: true });
        try {
          const localVersion = get().version;

          console.log(localVersion, "🚀 localVersion Truck Cert");

          // Fetch remote schema
          // const remoteData = await getTruckCertSchema();
          const remoteData = localSchema as FormSchema;

          if (!remoteData?.formId || !remoteData?.version) return;

          // console.log(remoteData.version, "🚀 remoteVersion", remoteData);

          // Only process if version changed
          if (remoteData.version !== localVersion) {
            console.log("🚀 remoteData version changed",);
            const { schema, fieldMap } = await processSchema(remoteData);

            // Persist in MMKV via adapter
            await zustandMMKVStorage.setItem(SCHEMA_KEY, JSON.stringify(schema));
            await zustandMMKVStorage.setItem(FIELD_MAP_KEY, JSON.stringify(fieldMap));
            await zustandMMKVStorage.setItem(VERSION_KEY, remoteData.version);

            // Update Zustand store
            set({ schema, fieldMap, version: remoteData.version, loading: false });
          } else {
            // Version same → load from cache
            console.log("📦 Loaded Truck Certification Schema from MMKV cache");
            // Version same → load from MMKV cache
            const cachedSchemaStr = await zustandMMKVStorage.getItem(SCHEMA_KEY);
            const cachedFieldMapStr = await zustandMMKVStorage.getItem(FIELD_MAP_KEY);

            set({
              schema: cachedSchemaStr ? JSON.parse(cachedSchemaStr) : null,
              fieldMap: cachedFieldMapStr ? JSON.parse(cachedFieldMapStr) : null,
              version: localVersion,
              loading: false,
            });
          }
        } catch (error) {
          console.error("❌ Truck schema sync failed:", error);
          set({ loading: false });
        }
      },
    }),
    {
      name: "truck_schema_store",
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);
