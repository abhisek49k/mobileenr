import React from "react";
import { View, Text, FlatList } from "react-native";
import { useRouter } from "expo-router";
import Header from "@/components/ui/Header";
import { Project, ProjectListItem } from "@/components/ProjectListItem";
import { useProjectStore } from "@/store/projects/useProjectStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// --- Mock Data ---
// In a real app, this would come from an API call.
const MOCK_PROJECTS: Project[] = [
  {
    id: "proj_123",
    name: "Hurricane Ian COJ Debris Monitoring Services",
    location: "FLORIDA Jacksonville",
    primeContractors: [
      { label: "AshBritt Environmental", value: "ashbritt_env" },
      { label: "CrowderGulf", value: "crowdergulf" },
      { label: "Ceres Environmental Services", value: "ceres_env" },
    ],
    subContractors: [
      { label: "DRC Emergency Services", value: "drc_emergency" },
      { label: "Phillips & Jordan", value: "phillips_jordan" },
      { label: "Custom Tree Care", value: "custom_tree_care" },
    ],
  },
  {
    id: "proj_456",
    name: "Coastal Storm Ida Restoration Project",
    location: "NEW YORK Suffolk County",
    primeContractors: [
      { label: "Tetra Tech Inc.", value: "tetra_tech" },
      { label: "Haugland Energy Group", value: "haugland_energy" },
      { label: "ECC (Environmental Chemical Corp)", value: "ecc_env" },
    ],
    subContractors: [
      { label: "Apex Companies LLC", value: "apex_companies" },
      { label: "Arcadis US", value: "arcadis_us" },
      { label: "WSP USA Environment", value: "wsp_usa" },
    ],
  },
  {
    id: "proj_789",
    name: "Wildfire Cleanup and Recovery",
    location: "CALIFORNIA Napa Valley",
    primeContractors: [
      { label: "Cal Fire Restoration Group", value: "cal_fire_restoration" },
      { label: "Sukut Construction", value: "sukut_construction" },
      {
        label: "Pacific States Environmental Contractors",
        value: "pacific_states_env",
      },
    ],
    subContractors: [
      { label: "SCS Engineers", value: "scs_engineers" },
      { label: "Granite Construction", value: "granite_construction" },
      { label: "Environmental Recovery Corp", value: "erc_recovery" },
    ],
  },
];

export default function ProjectsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setProject = useProjectStore((state) => state.setProject);

  const handleProjectPress = (project: Project) => {
    setProject(project); // store full project data
    router.push({
      pathname: `/projects/[id]`,
      params: { id: project.id, name: project.name },
    });
  };

  return (
    <View
      className="flex-1 bg-background-secondary"
      style={{ paddingBottom: insets.bottom + 10 }}
    >
      <Header
        headerLeft={
          <Text className="text-[22px] font-semibold text-white font-open-sans-bold">
            EZ Debris
          </Text>
        }
      />
      <FlatList
        data={MOCK_PROJECTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProjectListItem
            project={item}
            onPress={() => handleProjectPress(item)}
          />
        )}
        contentContainerStyle={{ padding: 16 }}
      />

      {/* --- Footer Text --- */}
      <View className="w-full">
        <Text className="text-sm text-text-primary text-center font-open-sans">
          Developed by{" "}
          <Text className="text-accent-primary font-open-sans">GISKernel</Text>
        </Text>
      </View>
    </View>
  );
}
