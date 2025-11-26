import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "@/components/ui/Header";
import {
  ArrowLeft,
  ChevronLeft,
  Eye,
  TreePine,
  Truck,
} from "lucide-react-native";
import { Pressable } from "react-native";
import Button from "@/components/ui/Button";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Card } from "@/components/ui/Card";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProjectStore } from "@/store/projects/useProjectStore";

export default function ProjectDetailScreen() {
  const colorTheme = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Get the dynamic 'id' parameter from the URL
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const { setTicketType } = useProjectStore();

  // In a real app, you would use this 'id' to fetch detailed project data from an API.
  // For example: const { data: project, isLoading } = useQuery(['project', id], () => fetchProjectById(id));

  return (
    <View className="flex-1 bg-background-secondary" style={{ paddingBottom: insets.bottom + 10 }}>
      <Header
        headerLeft={
          <Button
            onPress={() => router.back()}
            className="w-[40px] h-[40px] flex-row items-center bg-background-primary rounded-full"
          >
            <ChevronLeft size={22} color={colorTheme["textPrimary"]} />
          </Button>
        }
        headerCenter={
          <Text className="text-[22px] font-semibold text-white font-open-sans-bold">
            EZ Debris
          </Text>
        }
      />
      <View className="flex-1">
        <View className="items-center justify-center p-4">
          <Text className="text-2xl font-bold text-center text-text-secondary">
            {name}
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-2 justify-between p-4">
          <Card.Root
            className="w-[169px] h-[132px]"
            onPress={() => {
              setTicketType({ label: "Field Monitor", value: 'field-monitor' })
              router.push("/fieldmonitor")
            }}
          >
            <Card.Content>
              <TreePine size={48} color={colorTheme["textSecondary"]} />
              <Text className="text-base font-semibold text-text-secondary mt-4 text-center">
                Field Monitor
              </Text>
            </Card.Content>
          </Card.Root>

          <Card.Root
            className="w-[169px] h-[132px]"
            onPress={() => {
              setTicketType({ label: "Site Monitor", value: 'site-monitor' })
              router.push("/sitemonitor")
            }}
          >
            <Card.Content>
              <Eye size={48} color={colorTheme["textSecondary"]} />
              <Text className="text-base font-semibold text-accent-primary mt-4 text-center">
                Site Monitor
              </Text>
            </Card.Content>
          </Card.Root>

          <Card.Root
            className="w-[169px] h-[132px]"
            onPress={() => {
              setTicketType({ label: "Truck Certification", value: 'truck-cert' })
              router.push("/truckcert")
            }}
          >
            <Card.Content>
              <Truck size={48} color={colorTheme["textSecondary"]} />
              <Text className="text-base font-semibold text-accent-primary mt-4 text-center">
                Truck Cert
              </Text>
            </Card.Content>
          </Card.Root>
        </View>
      </View>

      {/* --- Footer Text --- */}
      <View className="w-full">
        <Text className="text-sm text-text-primary text-center font-open-sans">
          Developed by{" "}
          <Text className="text-accent-primary font-open-sans">GISKernel</Text>
        </Text>
      </View>
    </View >
  );
}
