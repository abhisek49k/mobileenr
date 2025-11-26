import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { processSchema } from "@/utils/schemaProcessor";
import { zustandMMKVStorage } from "@/utils/mmkvStorage";
import localSiteMonitorSchema from "@/assets/schema/site-monitor.json";

// ========================
// MMKV Keys
// ========================
const SM_SCHEMA_KEY = "site_monitor_schema";
const SM_FIELD_MAP_KEY = "site_monitor_field_map";
const SM_VERSION_KEY = "site_monitor_schema_version";

// ========================
// Types
// ========================
interface SiteMonitorSchemaState {
  schema: any | null;
  fieldMap: Record<string, any> | null;
  version: string | null;
  loading: boolean;
  syncSchema: () => Promise<void>;
}

// ========================
// Zustand Store
// ========================
export const useSiteMonitorSchemaStore = create<SiteMonitorSchemaState>()(
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

          console.log(localVersion, "🚀 localVersion site monitor");

          // const remoteData = await getSiteMonitorSchema();
          const remoteData = localSiteMonitorSchema; // fallback for development

          if (!remoteData?.formId || !remoteData?.version) {
            console.warn("⚠️ Invalid site monitor schema");
            set({ loading: false });
            return;
          }

          // If version changed → process & persist
          if (remoteData.version !== localVersion) {
            console.log("🔄 Site Monitor Schema version changed");

            const { schema, fieldMap } = await processSchema(remoteData);

            // Save to MMKV
            await zustandMMKVStorage.setItem(SM_SCHEMA_KEY, JSON.stringify(schema));
            await zustandMMKVStorage.setItem(SM_FIELD_MAP_KEY, JSON.stringify(fieldMap));
            await zustandMMKVStorage.setItem(SM_VERSION_KEY, remoteData.version);

            // Update Zustand
            set({
              schema,
              fieldMap,
              version: remoteData.version,
              loading: false,
            });

          } else {
            // Version same → load from cache
            console.log("📦 Loaded Site Monitor Schema from MMKV cache");

            const cachedSchema = await zustandMMKVStorage.getItem(SM_SCHEMA_KEY);
            const cachedFieldMap = await zustandMMKVStorage.getItem(SM_FIELD_MAP_KEY);

            set({
              schema: cachedSchema ? JSON.parse(cachedSchema) : null,
              fieldMap: cachedFieldMap ? JSON.parse(cachedFieldMap) : null,
              version: localVersion,
              loading: false,
            });
          }
        } catch (error) {
          console.error("❌ Site Monitor Schema sync error:", error);
          set({ loading: false });
        }
      },
    }),
    {
      name: "site_monitor_schema_store",
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);
