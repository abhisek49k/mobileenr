
import { Directory, File, Paths } from "expo-file-system/next";


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
export async function processSchema(
  schema: FormSchema
): Promise<{ schema: FormSchema; fieldMap: Record<string, Field> }> {

    console.log("🚀 schema", schema);
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

  console.log("🚀 processedSchema", processedSchema);

  return { schema: processedSchema, fieldMap };
}
