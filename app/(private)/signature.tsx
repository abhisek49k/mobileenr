// app/(private)/truck-cert/signatures.tsx

import React, { useState, useCallback } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Header from "@/components/ui/Header";
import { Button } from "@/components/ui/Button";
import { SignaturePad } from "@/components/ui/SignaturePad";
import {
  ChevronLeft,
  CircleX,
  CirclePlus,
} from "lucide-react-native";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProjectStore } from "@/store/projects/useProjectStore";
import MenuIcon from "@/components/menuIcon";

const SignatureScreen = () => {
  const router = useRouter();
  const colorTheme = useThemeColors();
  const insets = useSafeAreaInsets();
  const { selectedTicket } = useProjectStore();

  // ---------- Local State ----------
  const [monitorSignature, setMonitorSignature] = useState<string | null>(null);
  const [driverSignature, setDriverSignature] = useState<string | null>(null);

  // ---------- Callbacks ----------
  const handleMonitorSave = useCallback((sig: string) => {
    setMonitorSignature(sig);
  }, []);

  const handleDriverSave = useCallback((sig: string) => {
    setDriverSignature(sig);
  }, []);

  const onCreateTicket = async () => {
    try {
      router.push("/truckcert/ticket");
    } catch (error) {

    }
  };

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
          <Text className="text-[22px] font-semibold text-white">
            {selectedTicket?.label}
          </Text>
        }
        headerRight={<MenuIcon/>}
      />

      {/* Sub-header */}
      <View className="bg-background-primary px-6 py-4 border-b border-border-primary">
        <Text className="text-xl font-semibold text-accent-primary text-center">
          {selectedTicket?.label} - Signatures
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between" }}
        contentContainerClassName="p-6"
      >
        <View className="flex-1">
          <SignaturePad
            label="Monitor Signature"
            required
            value={monitorSignature}
            onSave={handleMonitorSave}
            onClear={() => setMonitorSignature(null)}
            className="mb-8"
          />

          <SignaturePad
            label="Driver Signature"
            required
            value={driverSignature}
            onSave={handleDriverSave}
            onClear={() => setDriverSignature(null)}
          />

          <View className="flex-row items-center justify-center gap-2 mt-8">
            {/* BACK Button */}
            <Button
              className="flex-1 border border-accent-primary bg-background-primary py-4 rounded-2xl gap-3"
              onPress={() => router.back()}
            >
              <Text className="text-accent-primary font-base font-open-sans-bold">
                Cancel
              </Text>
              <CircleX size={20} color={colorTheme["accentPrimary"]} />
            </Button>

            {/* NEXT Button */}
            <Button
              className="bg-accent-primary flex-1 py-4 rounded-2xl gap-2"
              onPress={onCreateTicket}
            >
              <Text className="text-white font-base font-open-sans-bold">
                Create
              </Text>
              <CirclePlus size={20} color={colorTheme["backgroundPrimary"]} />
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

export default SignatureScreen;
