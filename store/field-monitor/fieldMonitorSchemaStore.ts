import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { processSchema } from "@/utils/schemaProcessor";
import { zustandMMKVStorage } from "@/utils/mmkvStorage";
import localFieldMonitorSchema from "@/assets/schema/field-monitor.json";

// ========================
// MMKV Keys
// ========================
const FM_SCHEMA_KEY = "field_monitor_schema";
const FM_FIELD_MAP_KEY = "field_monitor_field_map";
const FM_VERSION_KEY = "field_monitor_schema_version";

// ========================
// Types
// ========================
interface FieldMonitorSchemaState {
  schema: any | null;
  fieldMap: Record<string, any> | null;
  version: string | null;
  loading: boolean;
  syncSchema: () => Promise<void>;
}

// ========================
// Zustand Store
// ========================
export const useFieldMonitorSchemaStore = create<FieldMonitorSchemaState>()(
  persist(
    (set, get) => ({
      schema: null,
      fieldMap: null,
      version: null,
      loading: true,

      syncSchema: async () => {
        set({ loading: true });

        try {
          const localVersion = get().version;

          console.log(localVersion, "🚀 localVersion field monitor");

          // const remoteData = await getFieldMonitorSchema();
          const remoteData = localFieldMonitorSchema; // fallback for development

          if (!remoteData?.formId || !remoteData?.version) {
            console.warn("⚠️ Invalid field monitor schema");
            set({ loading: false });
            return;
          }

          // If version changed → process & persist
          if (remoteData.version !== localVersion) {
            console.log("🔄 Field Monitor Schema version changed");

            const { schema, fieldMap } = await processSchema(remoteData);

            // Save to MMKV
            await zustandMMKVStorage.setItem(FM_SCHEMA_KEY, JSON.stringify(schema));
            await zustandMMKVStorage.setItem(FM_FIELD_MAP_KEY, JSON.stringify(fieldMap));
            await zustandMMKVStorage.setItem(FM_VERSION_KEY, remoteData.version);

            // Update Zustand
            set({
              schema,
              fieldMap,
              version: remoteData.version,
              loading: false,
            });

          } else {
            // Version same → load from cache
            console.log("📦 Loaded Field Monitor Schema from MMKV cache");

            const cachedSchema = await zustandMMKVStorage.getItem(FM_SCHEMA_KEY);
            const cachedFieldMap = await zustandMMKVStorage.getItem(FM_FIELD_MAP_KEY);

            set({
              schema: cachedSchema ? JSON.parse(cachedSchema) : null,
              fieldMap: cachedFieldMap ? JSON.parse(cachedFieldMap) : null,
              version: localVersion,
              loading: false,
            });
          }
        } catch (error) {
          console.error("❌ Field Monitor Schema sync error:", error);
          set({ loading: false });
        }
      },
    }),
    {
      name: "field_monitor_schema_store",
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);
