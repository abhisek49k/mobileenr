// app/(private)/truck-cert/review.tsx

import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import Header from "@/components/ui/Header";
import { Button } from "@/components/ui/Button";
import {
  ChevronLeft,
  CircleX,
  ArrowRight,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { Separator } from "@/components/ui/Separator";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTruckSchemaStore } from "@/store/truck-certification/useTruckSchemaStore";
import { ScreenIndicator } from "@/components/ui/ScreenIndicator";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/Dropdown";
import { Label } from "@/components/ui/Label";
import { TextField } from "@/components/ui/TextField";
import { useProjectStore } from "@/store/projects/useProjectStore";
import MenuIcon from "@/components/menuIcon";

// --- Main Review Screen ---
const AssignProjectScreen = () => {
  const colorTheme = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [firstSection, setFirstSection] = useState<any>();

  // Use your custom schema synchronization hook
  const { schema, loading } = useTruckSchemaStore();
  const { selectedProject, selectedPrime, selectedSub, setPrimeContractor, setSubContractor } = useProjectStore();
  const maxSections = schema?.sections?.length ?? 0;

  console.log("🚀 res", selectedProject);

  console.log("🚀 schema", schema);

  useEffect(() => {
    if (!loading && schema?.sections?.length) {
      // Sort sections by order and get first section
      const firstSection = schema.sections.sort(
        (a: any, b: any) => a.order - b.order
      )[0];

      console.log(
        `✅ Schema loaded. Redirecting to first section: ${firstSection.sectionId}`
      );

      // Redirect to the first section
      setFirstSection(`/truckcert/${firstSection.sectionId}`);
    }
  }, [loading, schema, router]);

  if (loading)
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
      </View>
    );


  const isFormValid = !!selectedProject && !!selectedPrime && !!selectedSub;


  return (
    <View
      className="flex-1 bg-background-secondary"
      style={{ paddingBottom: insets.bottom + 10 }}
    >
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
          <Text className="text-xl font-semibold text-white">
            Truck Certification
          </Text>
        }
        headerRight={<MenuIcon/>}
      />

      {/* Screen Indicator and Title */}
      <View className="pb-4">
        <ScreenIndicator maxSteps={maxSections} currentStep={0} />
        <Text className="text-xl font-semibold text-accent-primary text-center -mt-2">
          Assign to Project
        </Text>
      </View>

      <Separator />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between" }}
      >
        {/* --- 2. Main Content --- */}
        <View className="p-8">
          <View>
            <Label htmlFor="project_name" className="mb-2" required>
              Project Name
            </Label>
            <TextField.Root
              placeholder="Enter project name"
              value={selectedProject?.name}
              disabled={true}
            />
          </View>
          <View className="pt-4">
            <Label htmlFor="prime_contractor" className="mb-2" required>
              Prime Contractor
            </Label>
            <DropdownMenu
              value={selectedPrime?.value}
              onValueChange={(value) => {
                const contractor = selectedProject?.primeContractors.find(
                  (c) => c.value === value
                );
                setPrimeContractor(contractor ?? null);
              }}
            >
              <DropdownMenuTrigger
                placeholder="Select prime contractor"
                className="w-full"
              />
              <DropdownMenuContent width={320}>
                <DropdownMenuLabel>Prime Contractors</DropdownMenuLabel>
                {selectedProject?.primeContractors?.map((item) => (
                  <DropdownMenuCheckboxItem
                    key={item.value}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </View>
          <View className="pt-4">
            <Label htmlFor="prime_contractor" className="mb-2" required>
              Sub Contractor
            </Label>
            <DropdownMenu
              value={selectedSub?.value}
              onValueChange={(value) => {
                const contractor = selectedProject?.subContractors.find(
                  (c) => c.value === value
                );
                setSubContractor(contractor ?? null);
              }}
            >
              <DropdownMenuTrigger
                placeholder="Select sub contractor"
                className="w-full"
              />
              <DropdownMenuContent width={320}>
                <DropdownMenuLabel>Sub Contractors</DropdownMenuLabel>
                {selectedProject?.subContractors?.map((item) => (
                  <DropdownMenuCheckboxItem
                    key={item.value}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </View>

          <Separator className="mt-6" />

          <View className="flex-row items-center justify-center gap-2 mt-8">
            {/* BACK Button */}
            <Button
              className="flex-1 border border-accent-primary bg-background-primary py-4 rounded-2xl gap-3"
              onPress={() => router.dismissTo("/projects")}
            >
              <Text className="text-accent-primary font-base font-open-sans-bold">
                Cancel
              </Text>
              <CircleX size={20} color={colorTheme["accentPrimary"]} />
            </Button>

            {/* NEXT Button */}
            <Button
              className="bg-accent-primary flex-1 py-4 rounded-2xl gap-2"
              onPress={() => router.push(firstSection)}
              disabled={!isFormValid}
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
    </View>
  );
};

export default AssignProjectScreen;
