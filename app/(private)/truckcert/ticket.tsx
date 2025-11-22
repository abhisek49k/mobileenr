// app/(private)/truck-cert/signatures.tsx

import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Skeleton } from "moti/skeleton";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import Header from "@/components/ui/Header";
import { Button } from "@/components/ui/Button";
import {
  Building2,
  CalendarCheck,
  CheckCircle,
  ChevronLeft,
  Package,
  Tag,
  Truck,
  Users,
  XCircle,
  Layers, // Using Layers for Sub-Activity/Event
} from "lucide-react-native";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import QRCodeStyled from "react-native-qrcode-styled";
import { useProjectStore } from "@/store/projects/useProjectStore";
import { useTruckFormStore } from "@/store/truck-certification/useTruckStore";
import { compressTruckCert } from "@/utils/truck";

// ----------------------------------------------------------------
// --- START: TICKET INFO COMPONENTS (IMPROVED) ---
// ----------------------------------------------------------------

// Improved component for better alignment and scannability
const TicketInfoRow: React.FC<{
  Icon: React.ElementType; // Lucide icon component
  label: string;
  value: string | number | boolean | null | undefined;
  isBold?: boolean;
}> = ({ Icon, label, value, isBold = false }) => {
  const colorTheme = useThemeColors();

  let displayValue: React.ReactNode;
  if (typeof value === "boolean") {
    displayValue = value ? (
      <Text>Yes</Text>
    ) : (
      <Text>No</Text>
    );
  } else {
    displayValue = (
      <Text
        className={
          isBold
            ? "text-[15px] font-bold text-gray-800 text-right flex-shrink"
            : "text-sm text-gray-700 text-right flex-shrink"
        }
        numberOfLines={1}
      >
        {value ?? "N/A"}
      </Text>
    );
  }

  return (
    <View className="flex-col py-1 border-b border-gray-100 last:border-b-0">
      {/* Label and Icon */}
      <View className="w-full flex-row items-center flex-grow gap-2">
        <Icon size={18} color="#0A7EA4" />
        <Text
          className={
            isBold
              ? "font-extrabold text-[15px] text-gray-800"
              : "font-semibold text-gray-600"
          }
        >
          {label}
        </Text>
      </View>

      {/* Value Part (Text or Icon) */}
      <View className="flex-row flex-shrink-0 pl-7">
        {displayValue}
      </View>
    </View>
  );
};

const TicketReceiptInfo: React.FC<{
  truckCertNumber?: string;
  offlineUUID?: string;
  generateQRMutation: { isError: boolean };
  totalCY?: string; // Total Calculated Volume
}> = ({ truckCertNumber, offlineUUID, generateQRMutation, totalCY }) => {
  const { selectedProject, selectedPrime, selectedSub } = useProjectStore();
  const truckData = useTruckFormStore((state) => state.values);

  // Map the main project/contractor data
  const projectInfo = useMemo(
    () => [
      { icon: Building2, label: "Project Name", value: selectedProject?.name },
      { icon: Users, label: "Prime Contractor", value: selectedPrime?.label },
      { icon: Layers, label: "Sub-Activity", value: truckData.sub_activity }, // Changed icon to Layers
      { icon: Users, label: "Sub-Contractor", value: selectedSub?.label },
    ],
    [selectedProject, selectedPrime, selectedSub, truckData.sub_activity]
  );

  // Map the vehicle/date/tag data
  const vehicleInfo = useMemo(
    () => [
      { icon: Truck, label: "Truck No", value: truckData.truck_number },
      { icon: Package, label: "Total CY", value: totalCY }, // Highlighted Total CY
      {
        icon: CalendarCheck,
        label: "Date Certified",
        value: truckData.date
          ? format(new Date(truckData.date), "yyyy-MM-dd")
          : "N/A",
      },
      { icon: Tag, label: "Tag #", value: truckData.tag_number },
      {
        icon: Truck,
        label: "Truck Type",
        value:
          truckData.truck_type_selector
            ?.replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()) ||
          truckData.truck_type_selector, // Fallback to raw value
      },
      {
        icon: CheckCircle,
        label: "Has Hand Loader",
        value: truckData.has_hand_loader,
      },
    ],
    [truckData, totalCY]
  );

  return (
    <View className="space-y-4 p-1.5 w-[290px]">
      {/* Truck Certification ID Row - Enhanced */}

      {/* Info Section Card 1: Project Details - Enhanced Card Look */}
      <View className="bg-white rounded-xl p-4 space-y-2 border border-gray-200 shadow-sm">
        <Text className="text-base font-bold text-gray-800 border-b border-gray-200 pb-2 mb-1">
          Project Details
        </Text>
        {projectInfo.map((item, idx) => (
          <TicketInfoRow
            key={idx}
            Icon={item.icon}
            label={item.label}
            value={item.value}
          />
        ))}
      </View>

      {/* Info Section Card 2: Vehicle Details - Enhanced Card Look */}
      <View className="bg-white rounded-xl p-4 space-y-2 border border-gray-200 shadow-sm">
        <Text className="text-base font-bold text-gray-800 border-b border-gray-200 pb-2 mb-1">
          Vehicle & Volume
        </Text>
        {vehicleInfo.map((item, idx) => (
          <TicketInfoRow
            key={idx}
            Icon={item.icon}
            label={item.label}
            value={item.value}
            isBold={item.isBold}
          />
        ))}
      </View>
    </View>
  );
};

// --------------------------------------------------------------
// --- END: TICKET INFO COMPONENTS ---
// --------------------------------------------------------------

// Add a simple style for the dashed line to ensure better rendering
const styles = StyleSheet.create({
  dashedLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB", // gray-300
    borderStyle: "dashed",
  },
});

const SignatureScreen = () => {
  const router = useRouter();
  const colorTheme = useThemeColors();
  const insets = useSafeAreaInsets();

  const { selectedProject, selectedPrime, selectedSub } = useProjectStore();
  const truckData = useTruckFormStore((state) => state.values);
  const [qrData, setQrData] = useState<string>("");

  // --- MOCK/PLACEHOLDER DATA for TicketReceiptInfo props ---
  // Use a more realistic mock for a complete example
  const MOCK_TOTAL_CY = "4.5 CY";
  const MOCK_TRUCK_CERT_ID = undefined; // Undefined to simulate a pending/offline status
  const MOCK_OFFLINE_UUID = "UUID-12345-ABCDE";
  const MOCK_IS_ERROR = false;
  // --- END MOCK DATA ---

  const runWhenIdle = (cb: () => void) => {
    if (typeof (global as any).requestIdleCallback === "function") {
      return (global as any).requestIdleCallback(cb);
    }
    // Fallback
    return setTimeout(cb, 1);
  };

  const generateQRDataIdle = (callback: (data: string) => void) => {
    runWhenIdle(() => {
      const compressData = compressTruckCert(truckData);
      const payload = {
        ...compressData,
        // Use the actual certificate ID if available, otherwise use the offline UUID
        id: MOCK_TRUCK_CERT_ID || MOCK_OFFLINE_UUID,
        pj: selectedProject?.id,
        pc: selectedPrime?.value,
        sc: selectedSub?.value,
        ts: Date.now(),
      };
      callback(JSON.stringify(payload));
    });
  };

  useEffect(() => {
    // This generates the QR code payload
    generateQRDataIdle((data) => setQrData(data));
  }, [truckData, selectedProject, selectedPrime, selectedSub]);

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
          <Text className="text-xl font-semibold text-white">
            Truck Certification
          </Text>
        }
      />

      {/* Sub-header */}
      <View className="bg-background-primary px-6 py-4 border-b border-border-primary">
        <Text className="text-xl font-semibold text-accent-primary text-center">
          Truck Certification - Created Successfully
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "space-between",
          gap: 20,
        }}
        contentContainerClassName="p-6"
      >
        <View
          className={`flex-row justify-center items-center space-x-2 py-2 px-3 rounded-xl shadow-sm ${
            false
              ? "bg-cyan-100/70"
              : "bg-yellow-100/70 border border-yellow-300"
          }`}
        >
          <Text
            className={`text-[15px] font-extrabold ${
              false ? "text-gray-800" : "text-yellow-800"
            }`}
          >
            {false ? "Online Ticket:" : "Offline Ticket"}
          </Text>
        </View>
        <View className="border border-gray-300 rounded-xl bg-white shadow-md mt-5">
          {/* Header (Date/Time) */}
          <View className="bg-background-icon p-4 rounded-t-xl shadow-md">
            <Text className="text-base text-text-primary">
              {format(new Date(), "MMMM d, yyyy, h:mm a")}
            </Text>
          </View>

          {/* Dashed Tear Line */}
          <View style={styles.dashedLine} className="mx-4 my-2" />

          {/* CUT-OUT CIRCLES (positioned for the tear line) */}
          <View className="absolute left-[-10px] top-[54px] h-6 w-6 rounded-full bg-background-secondary z-10" />
          <View className="absolute right-[-10px] top-[54px] h-6 w-6 rounded-full bg-background-secondary z-10" />
          {qrData ? (
            // --- SUCCESS VIEW (QR Code and Ticket Info) ---
            <View className="items-center justify-center pt-10">
              <QRCodeStyled
                data={qrData}
                size={250}
                pieceScale={1.03}
                padding={4}
                pieceCornerType="rounded"
                color="#000"
                isPiecesGlued
              />

              {/* TICKET RECEIPT INFO */}
              <View className="py-10">
                <TicketReceiptInfo
                  truckCertNumber={MOCK_TRUCK_CERT_ID}
                  offlineUUID={MOCK_OFFLINE_UUID}
                  generateQRMutation={{ isError: MOCK_IS_ERROR }}
                  totalCY={MOCK_TOTAL_CY}
                />
              </View>
            </View>
          ) : (
            // --- LOADING SKELETON VIEW ---
            <>
              {/* QR Code Placeholder Section */}
              <View className="p-5 items-center justify-center">
                <Skeleton
                  colorMode={"light"}
                  width={250} // Matches your original QR code size
                  height={250}
                  radius={8}
                />
              </View>

              {/* Separator Line */}
              <View className="h-px w-full bg-gray-300" />

              {/* Details Section */}
              <View className="p-5">
                <Skeleton colorMode={"light"} width={"80%"} height={20} />
                <View className="h-2" />
                <Skeleton colorMode={"light"} width={"65%"} height={15} />
                <View className="h-1.5" />
                <Skeleton colorMode={"light"} width={"40%"} height={15} />
              </View>

              <View className="h-px w-full bg-gray-300" />

              {/* Footer Section */}
              <View className="p-5">
                <View className="flex-row justify-between w-3/5">
                  <Skeleton colorMode={"light"} width={60} height={15} />
                  <Skeleton colorMode={"light"} width={60} height={15} />
                </View>
                <View className="h-2" />
                <Skeleton colorMode={"light"} width={"50%"} height={15} />
              </View>
            </>
          )}
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
