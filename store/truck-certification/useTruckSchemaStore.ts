import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { processSchema } from "@/utils/schemaProcessor";
import { getTruckCertSchema } from "@/api/client";
import { zustandMMKVStorage } from "@/utils/mmkvStorage";

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

          console.log(localVersion, "🚀 localVersion");

          // Fetch remote schema
          const remoteData = await getTruckCertSchema();
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
