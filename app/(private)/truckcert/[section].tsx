import {
  View,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import React, { useMemo, useCallback, useState } from "react";
import Header from "@/components/ui/Header";
import { ScreenIndicator } from "@/components/ui/ScreenIndicator";
import { Separator } from "@/components/ui/Separator";
import { ArrowRight, ChevronLeft, CircleX } from "lucide-react-native";
import Button from "@/components/ui/Button";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useThemeColors } from "@/hooks/useThemeColors";
import { FormRenderer } from "@/components/truckcert/FormRenderer";
import { useProjectStore } from "@/store/projects/useProjectStore";
// 💡 REQUIRED: Import the form store to read the selected value
import { useTruckFormStore } from "@/store/truck-certification/useTruckStore";
import { useTruckSchemaStore } from "@/store/truck-certification/useTruckSchemaStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Dialog } from "@/components/ui/Dialog";

// --- Type Definitions for Schema (Required for the dynamic logic) ---
interface FieldOption {
  label: string;
  value: any;
  nextSectionId?: string;
  conditionalNextSection?: {
    basedOnField: string;
    mapping: { [key: string]: string };
  };
  [key: string]: any;
}

interface Field {
  fieldId: string;
  name: string;
  type: "customSelector" | "toggle" | string;
  options?: FieldOption[];
  [key: string]: any;
}

interface Dependency {
  conditionalNextSection?: {
    basedOnField: string;
    mapping: { [key: string]: string };
  };
  [key: string]: any;
}

interface Section {
  sectionId: string;
  title: string;
  order: number;
  fields: Field[];
  dependencies?: Dependency[];
  nextSectionId?: string;
  isLast?: boolean;
  [key: string]: any;
}
interface FormSchema {
  sections: Section[];
  [key: string]: any;
}

export default function SectionPage() {
  const router = useRouter();
  const colorTheme = useThemeColors();
  const insets = useSafeAreaInsets();
  const { section: sectionId } = useLocalSearchParams<{ section?: string }>();
  const [isDialogOpen, setDialogOpen] = useState(false);


  // 💡 REQUIRED: Get the current form values
  const formState = useTruckFormStore((state) => state.values);

  const { schema, loading } = useTruckSchemaStore();

  // --- Find the current section ---
  const currentSection = useMemo(() => {
    if (!schema?.sections) return undefined;
    return schema.sections.find((s: Section) => s.sectionId === sectionId);
  }, [schema, sectionId]);

  const maxSections = schema?.sections?.length ?? 0;

  // 💡 CORE LOGIC: Dynamic Next Route Calculation (RE-IMPLEMENTED)
  const getNextRoute = useCallback((): string => {
    if (!currentSection) return "/truckcert/summary";

    // 1. Explicit last section
    if (currentSection.isLast) return "/truckcert/review";

    // 2. Check Section-Level Dependencies for Routing Override
    if (currentSection.dependencies) {
      for (const dep of currentSection.dependencies) {
        if (dep.conditionalNextSection) {
          const { basedOnField, mapping } = dep.conditionalNextSection;
          const mappedValue = formState[basedOnField];
          const nextId = mapping[mappedValue];

          if (nextId) {
            // Found a mapped route (e.g., 'review')
            return nextId === "review" ? "/truckcert/review" : `/truckcert/${nextId}`;
          }
        }
      }
    }

    // 3. Check routing fields for dynamic nextSectionId
    const routingField = currentSection.fields.find((f: Field) =>
      (f.type === "customSelector" || f.type === "toggle")
    );

    // Check Field Option Overrides
    if (routingField && routingField.options) {
      const selectedOption = routingField.options?.find(
        (opt: FieldOption) => opt.value === formState[routingField.name]
      );

      if (selectedOption && selectedOption.nextSectionId) {
        if (selectedOption.nextSectionId === "review") {
          return "/truckcert/review";
        }
        return `/truckcert/${selectedOption.nextSectionId}`;
      }

      // Also check conditionalNextSection logic if it's on a field option (less common)
      if (selectedOption && selectedOption.conditionalNextSection) {
        const { basedOnField, mapping } = selectedOption.conditionalNextSection;
        const nextId = mapping[formState[basedOnField]];
        if (nextId) return nextId === "review" ? "/truckcert/review" : `/truckcert/${nextId}`;
      }
    }

    // 4. Explicit nextSectionId on the section object (Default flow)
    if (currentSection.nextSectionId) {
      if (currentSection.nextSectionId === "review") {
        return "/truckcert/review";
      }
      return `/truckcert/${currentSection.nextSectionId}`;
    }

    // 5. Fallback
    return "/truckcert/summary";
  }, [currentSection, formState]);

  const finalNextRoute = getNextRoute();

  // --- Prepare schema for FormRenderer ---
  const sectionSchemaForRenderer = useMemo((): FormSchema | undefined => {
    if (!currentSection) return undefined;
    return { sections: [currentSection] };
  }, [currentSection]);

  // --- Loading and Error Check ---
  if (loading || !sectionSchemaForRenderer) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colorTheme["backgroundSecondary"],
        }}
      >
        <ActivityIndicator size="large" color={colorTheme["accentPrimary"]} />
        <Text style={{ color: colorTheme["textPrimary"], marginTop: 10 }}>
          {loading ? "Loading form data..." : "Preparing section..."}
        </Text>
      </View>
    );
  }

  const isSectionValid = useMemo(() => {
    if (!currentSection) return false;

    return currentSection.fields
      .filter((field: Field) => field.required) // ✅ only required fields
      .every((field: Field) => {
        const value = formState[field.name];

        // For toggle (boolean) fields, `false` is valid, undefined/null is invalid
        if (field.type === "toggle") return value !== undefined;

        // For other fields (text, selector, etc.)
        return value !== undefined && value !== null && value !== "";
      });
  }, [currentSection, formState]);



  return (
    <View
      className="flex-1 bg-background-secondary"
      style={{ paddingBottom: insets.bottom + 10 }}
    >
      {/* Header */}
      <Header
        headerLeft={
          <Button
            onPress={() => router.back()}
            className="w-[40px] h-[40px] flex-row items-center bg-background-primary rounded-full"
          >
            <ChevronLeft size={24} color={colorTheme["textPrimary"]} />
          </Button>
        }
        headerCenter={
          <Text className="text-[22px] font-semibold text-white font-open-sans-bold">
            Truck Certification
          </Text>
        }
      />

      {/* Screen Indicator and Title */}
      <View className="pb-4">
        <ScreenIndicator
          maxSteps={maxSections}
          currentStep={currentSection?.order ?? 0}
        />
        <Text className="text-xl font-semibold text-accent-primary text-center -mt-2">
          {currentSection?.title}
        </Text>
      </View>

      <Separator />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}
          className=""
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 p-8">
            {/* Form Renderer Component: Use key to force component remount on section change */}
            <FormRenderer
              key={currentSection.sectionId}
              schema={sectionSchemaForRenderer}
            />

            <Separator className="mt-0" />

            <View className="flex-row items-center justify-center gap-2 mt-8">
              {/* BACK Button */}
              <Button
                className="flex-1 border border-accent-primary bg-background-primary py-4 rounded-2xl gap-3"
                onPress={() => setDialogOpen(true)}
              >
                <Text className="text-accent-primary font-base font-open-sans-bold">
                  Cancel
                </Text>
                <CircleX size={20} color={colorTheme["accentPrimary"]} />
              </Button>

              {/* NEXT Button */}
              <Button
                className="bg-accent-primary flex-1 py-4 rounded-2xl gap-2"
                disabled={!isSectionValid}
                onPress={() => router.push(finalNextRoute)}
              >
                <Text className="text-white font-base font-open-sans-bold">
                  Next
                </Text>
                <ArrowRight size={20} color={colorTheme["backgroundPrimary"]} />
              </Button>
            </View>
          </View>

          {/* --- Footer Text --- */}
          <View className="w-full">
            <Text className="text-sm text-text-primary text-center font-open-sans">
              Developed by{" "}
              <Text className="text-accent-primary font-open-sans">
                GISKernel
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>


      <Dialog.Root open={isDialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Content className="py-2 px-4" showCloseButton={false}>
            <Dialog.Header className="pt-10" title="Are you sure you want to exit? Field Changes will be lost."/>
            <Dialog.Footer className="flex-row gap-2">
              <Button
                className="border border-accent-primary bg-background-primary py-4 px-6 rounded-2xl"
                onPress={() => setDialogOpen(false)}
              >
                <Text className="text-accent-primary font-bold">Cancel</Text>
              </Button>
              <Button
                className="bg-accent-primary py-4 px-6 rounded-2xl"
                onPress={() => router.dismissTo("/projects")}
              >
                <Text className="text-white font-bold">Exit</Text>
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </View>
  );
}
