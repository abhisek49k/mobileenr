import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '@/components/ui/Header';
import { Project, ProjectListItem } from '@/components/ProjectListItem';
import { useProjectStore } from '@/store/projects/useProjectStore';

// --- Mock Data ---
// In a real app, this would come from an API call.
const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj_123',
    name: 'Hurricane Ian COJ Debris Monitoring Services',
    location: 'FLORIDA Jacksonville',
  },
  {
    id: 'proj_456',
    name: 'Coastal Storm Ida Restoration Project',
    location: 'NEW YORK Suffolk County',
  },
  {
    id: 'proj_789',
    name: 'Wildfire Cleanup and Recovery',
    location: 'CALIFORNIA Napa Valley',
  },
];

export default function ProjectsScreen() {

  const router = useRouter();
  const setProject = useProjectStore((state) => state.setProject);

  const handleProjectPress = (project: Project) => {
    // Navigate to the dynamic route with the project's ID
    setProject(project.id, project.name);
    router.push({
      pathname: `/projects/[id]`,
      params: { id: project.id, name: project.name },
    });
  };

  return (
    <View className="flex-1 bg-background-secondary">
      <Header
        headerLeft={<Text className="text-[22px] font-semibold text-white font-open-sans-bold">EZ Debris</Text>}
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
      <View className="absolute bottom-10 w-full">
        <Text className="text-sm text-text-primary text-center font-open-sans">
          Developed by <Text className="text-accent-primary font-open-sans">GISKernel</Text>
        </Text>
      </View>
    </View>
  );
}