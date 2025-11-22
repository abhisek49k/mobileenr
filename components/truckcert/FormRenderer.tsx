import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import React, { useCallback, useState, useMemo } from "react";
// Assuming the path to your hooks and components are correct
import { useThemeColors } from "@/hooks/useThemeColors";
import { Label } from "@/components/ui/Label";
import { TextField } from "@/components/ui/TextField";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/Dropdown";
import { DatePicker } from "@/components/ui/DatePicker";
import { Toggle } from "@/components/ui/Toggle";
import ImageUploader, { ImageAsset } from "@/components/ui/ImageUploader";
import { Eye, EyeOff, AtSign } from "lucide-react-native";
import { Separator } from "@/components/ui/Separator";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { InputView } from "../ui/InputView";
import { CalculatedView } from "../ui/CalculatedView";
import { useTruckFormStore } from "@/store/truck-certification/useTruckStore";

// --- Type Definitions for Schema ---
type FieldOption = {
  label: string;
  value: any;
  icon?: { url: string; localUri?: string };
};

interface Field {
  fieldId: string;
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  editable: boolean;
  options?:
    | {
        type: "static" | "dynamic";
        data: FieldOption[];
      }
    | FieldOption[];
  dependencies?: { fieldId: string; condition: string; value: any }[];
  config?: { maxFiles: number; allowedTypes: string[] };
  calculation?: { formula: string; variables: string[]; unit: string };
  defaultValue?: any;
  multiline?: boolean;
  ref_img?: { url: string }; // Added for image display
  [key: string]: any;
}

interface Section {
  sectionId: string;
  title: string;
  order: number;
  fields: Field[];
  [key: string]: any;
}

interface FormSchema {
  sections: Section[];
  [key: string]: any;
}

// --- Utility to safely extract options array ---
const getFieldOptions = (field: Field): FieldOption[] => {
  if (!field.options) {
    return [];
  }
  // Check if options is the new structured object
  if (
    !Array.isArray(field.options) &&
    field.options.data &&
    Array.isArray(field.options.data)
  ) {
    return field.options.data;
  }
  // Fallback for the old simple array structure
  if (Array.isArray(field.options)) {
    return field.options;
  }
  return [];
};


// --- Component Map ---
const ComponentMap: Record<
  string,
  (
    field: Field,
    value: any,
    onChange: (value: any) => void,
    themeColors: any,
    formState: Record<string, any>
  ) => React.ReactNode
> = {
  // 1. TEXT, EMAIL, PHONE, NUMBER, TEXTAREA (Combined logic for text inputs)
  text: (field, value, onChange) => (
    <View className="mb-4" key={field.name}>
      <Label required={field.required}>{field.label}</Label>
      <TextField.Root
        placeholder={field.placeholder}
        value={String(value || "")}
        onChangeText={onChange}
        className="mt-2"
        keyboardType="default"
        multiline={field.type === "textarea"}
        textAlignVertical={field.type === "textarea" ? "top" : "auto"}
        disabled={!field.editable}
      />
    </View>
  ),

  textarea: (field, value, onChange) => (
    <View className="mb-4" key={field.name}>
      <Label required={field.required}>{field.label}</Label>
      <TextField.Root
        placeholder={field.placeholder}
        value={String(value || "")}
        onChangeText={onChange}
        className="mt-2"
        keyboardType="default"
        multiline={true}
        textAlignVertical={"top"}
        disabled={!field.editable}
      />
    </View>
  ),

  email: (field, value, onChange) => (
    <View className="mb-4" key={field.name}>
      <Label required={field.required}>{field.label}</Label>
      <TextField.Root
        placeholder={field.placeholder}
        value={String(value || "")}
        onChangeText={onChange}
        className="mt-2"
        keyboardType="email-address" // Updated keyboardType
        textAlignVertical={"auto"}
        disabled={!field.editable}
      />
    </View>
  ),

  phone: (field, value, onChange) => (
    <View className="mb-4" key={field.name}>
      <Label required={field.required}>{field.label}</Label>
      <TextField.Root
        placeholder={field.placeholder}
        value={String(value || "")}
        onChangeText={onChange}
        className="mt-2"
        keyboardType="phone-pad"
        textAlignVertical={"auto"}
        disabled={!field.editable}
      />
    </View>
  ),

  // 3. MEASUREMENT
  measurement: (field, value, onChange) => (
    <View className="mb-4" key={field.name}>
      <Label required={field.required}>{field.label}</Label>
      <InputView
        value={value}
        onSave={onChange}
        placeholder="Enter measurement in Inches"
        dialogTitle="Enter Measurement"
        dialogImage={field.ref_img?.url}
        dialogInputPlaceholder="Enter Measurement in Inches"
      />
    </View>
  ),

  calculated_view: (field, value, onChange, themeColors, formState) => {
    if (!field.calculation) {
      console.error(
        `Field ${field.name} is of type calculated_view but missing 'calculation' config.`
      );
      return null;
    }

    // 1. Extract dependency values from the current formState
    const dependencyValues = field.calculation.variables.map((variableName) => {
      // Retrieve the value from formState based on the variable name
      const val = formState[variableName];
      // Ensure the value is treated as a number/string for CalculatedView's dependency array
      return val !== undefined && val !== null ? val : 0;
    });

    return (
      <View className="mb-4" key={field.name}>
        {/* 2. Render the CalculatedView component */}
        <CalculatedView
          label={field.label}
          // Pass the formula string from the schema
          formula={field.calculation.formula}
          // Pass the values extracted from formState
          dependencies={dependencyValues}
          // Pass the unit
          unit={field.calculation.unit}
          className="mt-2"
        />
      </View>
    );
  },

  // 3. IMAGE UPLOAD
  imageUpload: (field, value, onChange) => (
    <View className="mb-0" key={field.name}>
      <Label required={field.required} className="mb-2">
        {field.label}
      </Label>
      <ImageUploader
        images={(value as ImageAsset[]) || []}
        onImagesChanged={onChange}
        maxFiles={field.config?.maxFiles}
      />
    </View>
  ),

  // 4. DROPDOWN (Generic Select)
  dropdown: (field, value, onChange) => {
    // --- UPDATED: Safely extract options array using utility ---
    const options = getFieldOptions(field);
    const selectedLabel =
      options?.find((opt) => opt.value === value)?.label ||
      field.placeholder ||
      "Select";

    return (
      <View className="mb-4" key={field.name}>
        <Label required={field.required} className="mb-2">
          {field.label}
        </Label>
        <DropdownMenu value={value} onValueChange={onChange}>
          <DropdownMenuTrigger className="w-full">
            <View className="mt-2 flex-row items-center justify-between h-14 w-full px-4 rounded-xl border bg-background-primary shadow-sm border-border-primary">
              <Text
                className={`text-base ${value ? "text-text-primary" : "text-text-secondary/60"}`}
              >
                {selectedLabel}
              </Text>
            </View>
          </DropdownMenuTrigger>
          <DropdownMenuContent width={320}>
            <ScrollView style={styles.dropdownScroll}>
              {options.map((item) => (
                <DropdownMenuCheckboxItem
                  key={item.value}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </ScrollView>
          </DropdownMenuContent>
        </DropdownMenu>
      </View>
    );
  },

  // 5. DATE PICKER
  date: (field, value, onChange) => (
    <View className="mb-4" key={field.name}>
      <Label required={field.required} className="mb-2">
        {field.label}
      </Label>
      <DatePicker
        value={value instanceof Date ? value : value ? new Date(value) : null}
        onValueChange={onChange}
        placeholder={field.placeholder || "MM/DD/YYYY"}
      />
    </View>
  ),

  // 6. TOGGLE (Boolean/Option Switch)
  toggle: (field, value, onChange) => {
    // --- UPDATED: Safely extract options array using utility ---
    const options = getFieldOptions(field);

    // Provide a default if no options are configured
    const toggleOptions =
      options.length > 0
        ? options
        : [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ];

    return (
      <View className="mb-4" key={field.name}>
        <Label required={field.required} className="pb-2">
          {field.label}
        </Label>
        <Toggle
          options={toggleOptions as { label: string; value: any }[]}
          value={value}
          onValueChange={onChange}
        />
      </View>
    );
  },

  // 7. CUSTOM SELECTOR (Mapping to RadioGroup with Images/Icons)
  customSelector: (field, value, onChange) => {
    // --- UPDATED: Safely extract options array using utility ---
    const options = getFieldOptions(field);

    return (
      <View className="mb-6" key={field.name}>
        <Label required={field.required} className="mb-4">
          {field.label}
        </Label>
        <RadioGroup.Root value={value} onValueChange={onChange}>
          {options.map((item) => {
            const imageSource = item.icon?.url
              ? { uri: item.icon.url } // Prioritize remote URL
              : item.icon?.localUri
                ? { uri: item.icon.localUri } // Fallback to local URI
                : null;

            return (
              <RadioGroup.Item
                key={item.value}
                value={item.value}
                className="mb-3"
              >
                <RadioGroup.Label>{item.label}</RadioGroup.Label>
                {/* Render only if a valid image source exists */}
                {imageSource ? (
                  <RadioGroup.Image source={imageSource} title={item.label} />
                ) : null}
              </RadioGroup.Item>
            );
          })}
        </RadioGroup.Root>
      </View>
    );
  },

  imagedisplay: (field, value, onChange, themeColors) => {
    // Assuming the URL for the image is provided via a custom field property, e.g., 'ref_img.url'
    const imageUrl = field?.ref_img?.url

    if (!imageUrl) {
        return (
            <View className="mb-4" key={field.name}>
                <Text className="text-text-secondary italic">No image source defined.</Text>
            </View>
        );
    }
    
    return (
        <View className="mb-4" key={field.name}>
            <Label className='mb-2'>{field.label}</Label>
            
            {/* Outer View with rounded gray border */}
            <View className="p-1 border border-border-secondary rounded-xl bg-background-tertiary">
                <Image
                    source={{ uri: imageUrl }}
                    // Set a default size for the image container
                    style={{ width: '100%', height: 200, borderRadius: 10 }}
                    resizeMode="contain"
                    // Optional: Placeholder while loading
                    // defaultSource={require('path/to/placeholder.png')}
                />
            </View>
        </View>
    );
  },
};

// --- FormRenderer Component (UPDATED to use useTruckFormStore) ---
export function FormRenderer({ schema }: { schema: FormSchema | undefined }) {
  const colorTheme = useThemeColors();

  // --- 1. Get State and Setter from the Truck Form Store ---
  const formState = useTruckFormStore((state) => state.values);
  const updateField = useTruckFormStore((state) => state.setValue);
  const loadDefaults = useTruckFormStore((state) => state.loadDefaults);

  console.log(formState,'--- formState ---');

  // Load defaults from schema into the store once when the schema is available
  React.useEffect(() => {
    if (schema) {
      loadDefaults(schema);
    }
  }, [schema, loadDefaults]); 

  if (!schema || !schema.sections || schema.sections.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-lg font-semibold text-text-secondary">
          No form data available for this section.
        </Text>
      </View>
    );
  }

  // Function to handle the actual calculation based on formula string
  const calculateValue = useCallback(
    (field: Field) => {
      // NOTE: Use 'calculated_view' for the type check to match the component map key
      if (field.type !== "calculated_view" || !field.calculation) return null;

      const { formula, variables } = field.calculation;

      let expression = formula;
      let allVariablesValid = true;

      variables.forEach((v) => {
        const val = formState[v];
        let numVal: number = 0;

        if (typeof val === "number" && !isNaN(val)) {
          numVal = val;
        } else if (typeof val === "string") {
          const parsedVal = parseFloat(val);
          if (!isNaN(parsedVal) && isFinite(parsedVal)) {
            numVal = parsedVal;
          } else {
            allVariablesValid = false;
          }
        } else {
          allVariablesValid = false;
        }

        // Replace variable names in the formula with their numeric values
        expression = expression.replace(new RegExp(v, "g"), numVal.toString());
      });

      if (!allVariablesValid) return null;

      try {
        // WARNING: In a production app, use a safe math parser library instead of eval().
        // This calculation is primarily for display in CalculatedView, not for form saving.
        const result = eval(expression);
        if (typeof result === "number" && isFinite(result)) {
          return Math.floor(result * 100) / 100; // Round to 2 decimal places
        }
        return null;
      } catch (e) {
        console.error(`Calculation error for ${field.name}:`, e);
        return null;
      }
    },
    [formState]
  );

  return (
    <>
      {/* ScrollView content is now wrapped in the FormRenderer export */}
      {schema.sections.map((section) => (
        <View key={section.sectionId} className="mb-8">
          {section.fields.map((field) => {
            const Renderer = ComponentMap[field.type];
            if (!Renderer) {
              console.warn(`No renderer found for field type: ${field.type}`);
              return (
                <Text key={field.name} className="text-red-500">
                  Unsupported field type: {field.type}
                </Text>
              );
            }

            // 1. Dependency/Visibility Check
            const isVisible = (() => {
              if (!field.dependencies || field.dependencies.length === 0)
                return true;

              return field.dependencies.every((dep) => {
                const depValue = formState[dep.fieldId]; // Use formState from the store

                if (dep.condition === "equals") {
                  return depValue === dep.value;
                }
                return true;
              });
            })();

            if (!isVisible) return null;

            // 2. Determine Value
            // CalculatedView gets its value dynamically through its own logic 
            // but we call calculateValue here to correctly pass the result if needed elsewhere, 
            // though CalculatedView handles its own internal display value based on 'dependencies' prop.
            const value =
              field.type === "calculated_view"
                ? calculateValue(field)
                : formState[field.name];

            // 3. Render Field
            return Renderer(
              field,
              value,
              // Use updateField from the store, keying by field.name
              (newValue) => updateField(field.name, newValue),
              colorTheme,
              formState // Pass the full state for calculated_view dependencies
            );
          })}
        </View>
      ))}
    </>
  );
}

// Simple styles for ScrollView inside Dropdown
const styles = StyleSheet.create({
  dropdownScroll: {
    maxHeight: 300,
  },
});