import React from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import Header from "@/components/ui/Header";
import { Project, ProjectListItem } from "@/components/ProjectListItem";
import { useProjectStore } from "@/store/projects/useProjectStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MOCK_PROJECTS } from "@/constants";

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useThemeColors } from "@/hooks/useThemeColors";
import MenuIcon from "@/components/menuIcon";

export default function ProjectsScreen() {

  const colorTheme = useThemeColors();
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
        headerRight={<MenuIcon/>}
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
