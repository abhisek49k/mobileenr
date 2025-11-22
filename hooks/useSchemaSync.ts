import { useEffect, useState, useMemo } from "react";
import { createMMKV } from "react-native-mmkv";
import { Directory, File, Paths } from "expo-file-system/next";
import { getTruckCertSchema } from "@/api/client"; // Assuming this API client exists

// =========================================================================
// 1. TYPE DEFINITIONS
// =========================================================================

// Dependency structure must match your schema (e.g., 'equals', 'isNotEmpty')
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

interface SchemaSyncBaseResult {
  schema: FormSchema | null;
  fieldMap: Record<string, Field> | null;
  loading: boolean;
  // maxSections is now taken directly from schema.totalSections if available
  maxSections: number;
  // New: Form state and setters are exposed for use by FormRenderer
  formState: Record<string, any>;
  setFieldValue: (fieldName: string, value: any) => void;

  // New: Visibility filters
  visibilityMap: Record<string, boolean>;
  getVisibleFieldsForSection: (sectionId: string) => Field[];
}

// Result when sectionId IS provided
interface SectionSpecificResult extends SchemaSyncBaseResult {
  currentSection: Section | null;
  nextRoute: string | null;
  previousRoute: string | null;
}

// Result when sectionId IS NOT provided
interface FullSchemaResult extends SchemaSyncBaseResult {
  currentSection: null;
  nextRoute: null;
  previousRoute: null;
}

type UseSchemaSyncResult = SectionSpecificResult | FullSchemaResult;

// =========================================================================
// 2. CONSTANTS & UTILITIES
// =========================================================================

const SCHEMA_KEY = "truck_schema";
const FIELD_MAP_KEY = "truck_field_map";
const SCHEMA_VERSION_KEY = "truck_schema_version";
const storage = createMMKV();

// Helper function to evaluate conditions
const evaluateCondition = (
  condition: string,
  fieldValue: any,
  targetValue: any
): boolean => {
  switch (condition) {
    case "equals":
      // Handles explicit equality (string, boolean, number)
      return fieldValue === targetValue;
    case "isNotEmpty":
      // Checks for non-empty string or array, and not null/undefined
      if (fieldValue === null || fieldValue === undefined || fieldValue === "")
        return false;
      if (Array.isArray(fieldValue)) return fieldValue.length > 0;
      return true;
    default:
      return false;
  }
};

// Create or ensure a directory exists (omitted implementation for brevity, assuming original is correct)
async function ensureDirExists(
  parentDir: Directory,
  subDirName: string
): Promise<Directory> {
  const subDir = new Directory(`${parentDir.uri}/${subDirName}`);
  if (!subDir.exists) {
    try {
      await subDir.create({ intermediates: true });
    } catch (e) {
      console.error(`❌ Failed to create directory ${subDirName}:`, e);
    }
  }
  return subDir;
}

// Download and cache image using FileSystem Next API
async function downloadAndCacheImage(
  url: string,
  filename: string
): Promise<string> {
  try {
    const cacheDir = await ensureDirExists(Paths.cache, "truck-schema-images");
    const file = new File(cacheDir, filename);

    if (await file.exists) return file.uri;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    await file.write(uint8);
    return file.uri;
  } catch (error) {
    console.error("❌ Image download failed:", url, error);
    return url;
  }
}

// Process schema and cache icons/ref images
async function processSchema(
  schema: FormSchema
): Promise<{ schema: FormSchema; fieldMap: Record<string, Field> }> {
  // Clone schema to avoid direct mutation of fetch result
  const processedSchema: FormSchema = JSON.parse(JSON.stringify(schema));
  const fieldMap: Record<string, Field> = {};

  for (const section of processedSchema.sections || []) {
    for (const field of section.fields || []) {
      const clonedField: Field = { ...field };

      if (field.type === "customSelector" && field.options) {
        for (const opt of field.options) {
          if (opt.icon?.url) {
            opt.icon.localUri = await downloadAndCacheImage(
              opt.icon.url,
              `${field.name}_${opt.value}.png`
            );
          }
        }
      }

      if (field.ref_img?.url) {
        field.ref_img.localUri = await downloadAndCacheImage(
          field.ref_img.url,
          `${field.name}_ref.png`
        );
      }

      fieldMap[field.name] = clonedField;
    }
  }

  // Save to MMKV
  storage.set(SCHEMA_KEY, JSON.stringify(processedSchema));
  storage.set(FIELD_MAP_KEY, JSON.stringify(fieldMap));
  storage.set(SCHEMA_VERSION_KEY, processedSchema.version?.toString() ?? "1.0");

  return { schema: processedSchema, fieldMap };
}

// =========================================================================
// 3. MAIN HOOK IMPLEMENTATION
// =========================================================================

export function useSchemaSync(currentSectionId?: string): UseSchemaSyncResult {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [fieldMap, setFieldMap] = useState<Record<string, Field> | null>(null);
  const [loading, setLoading] = useState(true);

  // Core logic for fetching/caching/syncing
  useEffect(() => {
    const loadSchema = async () => {
      let remoteSchema: FormSchema | null = null;
      try {
        // Load cached schema first (offline-first)
        const cachedSchemaJson = storage.getString(SCHEMA_KEY);
        const cachedFieldMapJson = storage.getString(FIELD_MAP_KEY);
        if (cachedSchemaJson && cachedFieldMapJson) {
          setSchema(JSON.parse(cachedSchemaJson) as FormSchema);
          setFieldMap(JSON.parse(cachedFieldMapJson) as Record<string, Field>);
        }

        // Fetch latest schema
        remoteSchema = (await getTruckCertSchema()) as FormSchema;

        if (remoteSchema && remoteSchema.sections) {
          const savedVersion = storage.getString(SCHEMA_VERSION_KEY);
          const remoteVersion = remoteSchema.version?.toString();

          if (savedVersion !== remoteVersion) {
            console.log(
              "🔄 Schema version changed or first load, syncing assets..."
            );
            const { schema: newSchema, fieldMap: newFieldMap } =
              await processSchema(remoteSchema);
            setSchema(newSchema);
            setFieldMap(newFieldMap);
          } else if (!cachedSchemaJson) {
            // If no cache but versions match (rare), set the remote schema
            setSchema(remoteSchema);
          }
        } else if (!cachedSchemaJson) {
          // Throw if remote is invalid and no cache exists
          throw new Error(
            "Failed to load a valid schema from remote or cache."
          );
        }
      } catch (error) {
        console.error("❌ Schema sync failed:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSchema();
  }, []);

  // Dynamic Calculation Logic (Routes, Current Section, and Max Sections)
  const sectionData = useMemo(() => {
    let maxSections = 0;
    let currentSection: Section | null = null;
    let nextRoute: string | null = null;
    let previousRoute: string | null = null;

    // Calculate max sections first, if schema is available
    if (schema && schema.sections) {
      maxSections = schema.sections.length;
    }

    // Only calculate section-specific data if an ID is provided
    if (currentSectionId && schema && schema.sections) {
      const sections = schema.sections.sort(
        (a: Section, b: Section) => a.order - b.order
      );
      const currentIndex = sections.findIndex(
        (s: Section) => s.sectionId === currentSectionId
      );

      if (currentIndex !== -1) {
        currentSection = sections[currentIndex];

        // Determine Next Route
        const nextSection = sections[currentIndex + 1];
        nextRoute = nextSection ? `/truckcert/${nextSection.sectionId}` : null;

        // Determine Previous Route
        const previousSection = sections[currentIndex - 1];
        previousRoute = previousSection
          ? `/truckcert/${previousSection.sectionId}`
          : null;
      } else {
        console.warn(
          `Section ID '${currentSectionId}' not found in loaded schema.`
        );
      }
    }

    return {
      currentSection,
      nextRoute,
      previousRoute,
      maxSections, // Include the calculated total sections
    };
  }, [schema, currentSectionId]);

  // Final Return
  return {
    schema,
    fieldMap,
    loading,
    ...sectionData,
  } as UseSchemaSyncResult;
}
