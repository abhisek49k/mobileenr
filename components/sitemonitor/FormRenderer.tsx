import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";
import React, { useEffect } from "react";
import { Label } from "@/components/ui/Label";
import { TextField } from "@/components/ui/TextField";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/Dropdown";
import { Toggle } from "@/components/ui/Toggle";
import ImageUploader, { ImageAsset } from "@/components/ui/ImageUploader";
import { Scanner } from "../ui/Scanner";
import { useFieldMonitorStore } from "@/store/field-monitor/useFieldMonitorStore";
import { useProjectStore } from "@/store/projects/useProjectStore";
import { useSiteMonitorStore } from "@/store/site-monitor/useSiteMonitorStore";

type FieldOption = { label: string; value: any };

interface Field {
  fieldId: string;
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  editable: boolean;
  options?: FieldOption[];
  config?: { maxFiles: number };
  multiline?: boolean;
}

interface SiteMonitorSchema {
  formId: string;
  title: string;
  fields: Field[];
}

// Utility
const getOptions = (field: Field) => field.options ?? [];

// Component Map

const ComponentMap: Record<
  string,
  (
    field: Field,
    value: any,
    onChange: (value: any) => void,
    fullState: Record<string, any>,
    setValues: (obj: any) => void
  ) => React.ReactNode
> = {
  text: (field, value, onChange) => (
    <View className="mb-4">
      <Label required={field.required}>{field.label}</Label>
      <TextField.Root
        placeholder={field.placeholder}
        value={String(value || "")}
        onChangeText={onChange}
        className="mt-2"
        disabled={!field.editable}
      />
    </View>
  ),

  textarea: (field, value, onChange) => (
    <View className="mb-4">
      <Label required={field.required}>{field.label}</Label>
      <TextField.Root
        placeholder={field.placeholder}
        value={String(value || "")}
        onChangeText={onChange}
        className="mt-2"
        multiline
        textAlignVertical="top"
        disabled={!field.editable}
      />
    </View>
  ),

  number: (field, value, onChange) => (
    <View className="mb-4">
      <Label required={field.required}>{field.label}</Label>
      <TextField.Root
        placeholder={field.placeholder}
        value={String(value || "")}
        onChangeText={onChange}
        keyboardType="numeric"
        className="mt-2"
        disabled={!field.editable}
      />
    </View>
  ),

  dropdown: (field, value, onChange) => {
    const options = getOptions(field);
    return (
      <View className="mb-4">
        <Label required={field.required}>{field.label}</Label>
        <DropdownMenu value={value} onValueChange={onChange}>
          <DropdownMenuTrigger className="w-full">
            <View className="mt-2 flex-row h-14 w-full px-4 rounded-xl border bg-background-primary border-border-primary items-center">
              <Text>{options.find((o) => o.value === value)?.label || "Select"}</Text>
            </View>
          </DropdownMenuTrigger>

          <DropdownMenuContent width={300}>
            <ScrollView style={{ maxHeight: 250 }}>
              {options.map((o) => (
                <DropdownMenuCheckboxItem key={o.value} label={o.label} value={o.value} />
              ))}
            </ScrollView>
          </DropdownMenuContent>
        </DropdownMenu>
      </View>
    );
  },

  toggle: (field, value, onChange) => (
    <View className="mb-4">
      <Label required={field.required}>{field.label}</Label>
      <Toggle
        value={value}
        onValueChange={onChange}
        options={[
          { label: "Yes", value: true },
          { label: "No", value: false },
        ]}
      />
    </View>
  ),

  imageUpload: (field, value, onChange) => (
    <View className="mb-4">
      <Label required={field.required}>{field.label}</Label>
      <ImageUploader
        images={(value as ImageAsset[]) || []}
        onImagesChanged={onChange}
        maxFiles={field.config?.maxFiles}
      />
    </View>
  ),

  // ⭐ SCANNER COMPONENT
  scan: (field, value, onChange, fullState, setValues) => {
    return (
      <View className="mb-4">
        <Label required={field.required}>{field.label}</Label>

        <Scanner.Root
          onValueChange={(v) => setValues({ [field.name]: v })}
          onDataScanned={(data) => {
            setValues({
              truck_make: data?.truck_make,
              truck_color: data?.truck_color,
              has_sideboards: data?.has_sideboards,
              rb_curved_surface_area: data?.rb_curved_surface_area,
            });
          }}
        >
          <Scanner.Trigger>
            <View className="flex-row">
              <Scanner.Input placeholder={field.placeholder ?? "Scan QR Code"} />
              <Scanner.ScanButton />
            </View>
          </Scanner.Trigger>

          <Scanner.Status />

          <Scanner.Details>
            <Scanner.DetailRow label="Make" value={fullState.truck_make} />
            <Scanner.DetailRow label="Color" value={fullState.truck_color} isColor />
            <Scanner.DetailRow
              label="Sideboard"
              value={fullState.has_sideboards ? "Yes" : "No"}
            />
            <Scanner.DetailRow label="CY" value={fullState.rb_curved_surface_area} />
          </Scanner.Details>
        </Scanner.Root>
      </View>
    );
  },
};

export function SiteMonitorFormRenderer({
  schema,
}: {
  schema: SiteMonitorSchema | undefined;
}) {


  const formState = useSiteMonitorStore((s) => s.values);
  const setValue = useSiteMonitorStore((s) => s.setValue);
  const loadDefaults = useSiteMonitorStore((s) => s.loadDefaults);
  const selectedType = "Vegetative";

  useEffect(() => {
    if (schema && selectedType) {
      loadDefaults(schema, selectedType);
    }
  }, [schema, selectedType]);

  if (!schema || !selectedType) return <Text>No schema available</Text>;

  const typeDef = schema.types[selectedType];
  const fields = typeDef?.fields ?? [];

  return (
    <>
      {fields.map((field: Field) => {
        const Renderer = ComponentMap[field.type];
        if (!Renderer)
          return <Text key={field.name}>Unsupported: {field.type}</Text>;

        return (
          <View key={field.fieldId}>
            {Renderer(
              field,
              formState[field.name],
              (v) => setValue(field.name, v),
              formState,
              (obj) =>
                Object.entries(obj).forEach(([k, v]) => setValue(k, v))
            )}
          </View>
        );
      })}
    </>
  );
}
