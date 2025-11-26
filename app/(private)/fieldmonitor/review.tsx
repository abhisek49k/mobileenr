import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import Header from "@/components/ui/Header";
import { Button } from "@/components/ui/Button";
import {
  ChevronLeft,
  User,
  Truck,
  ClipboardList,
  FileText,
  CheckCircle,
  XCircle,
  ClipboardCheck,
  Box, // Reused for C&D/Waste container
  ChevronsUpDown, // Reused for optional/add/deduct areas
  CircleX,
  ArrowRight,
  MapPin, // New icon for Location/Site
  TreeDeciduous, // New icon for Vegetative
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { Dialog } from "@/components/ui/Dialog";
import { Separator } from "@/components/ui/Separator";
import { useFieldMonitorStore } from "@/store/field-monitor/useFieldMonitorStore"; // Changed store
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useFieldMonitorSchemaStore } from "@/store/field-monitor/fieldMonitorSchemaStore";


const ImagePreviewRow: React.FC<{
  label: string;
  images?: { uri: string }[];
  onImagePress: (uri: string) => void;
}> = ({ label, images, onImagePress }) => {
  if (!images || images.length === 0) return null;

  return (
    <View className="py-2.5">
      <Text className="text-base text-text-secondary mb-3">{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {images.map((image, index) => (
          <Pressable key={index} onPress={() => onImagePress(image.uri)}>
            <Image
              source={{ uri: image.uri }}
              className="w-24 h-24 rounded-lg mr-3 border border-border-primary"
            />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const SectionCard = ({ icon, title, children }: {icon: any, title: string, children: any}) => (
  <View className="bg-background-primary rounded-2xl shadow-md border border-border-primary/50 p-4 mb-6">
    <View className="flex-row items-center">
      <View className="bg-accent-secondary/10 p-2 rounded-full">{icon}</View>
      <Text className="text-lg font-bold text-text-primary ml-3">{title}</Text>
    </View>
    <Separator className="my-3" />
    <View className="px-1">{children}</View>
  </View>
);

const InfoRow = ({ label, value }: {label: String, value: String}) => {
  const colorTheme = useThemeColors();
  let displayValue = (
    <Text className="text-base font-semibold text-text-secondary/60">N/A</Text>
  );

  if (typeof value === "boolean") {
    displayValue = value ? (
      <CheckCircle size={20} color={colorTheme["successPrimary"]} />
    ) : (
      <XCircle size={20} color={colorTheme["errorPrimary"]} />
    );
  } else if (value) {
    displayValue = (
      <Text
        className="text-base font-semibold text-accent-primary text-right"
        numberOfLines={2}
      >
        {value}
      </Text>
    );
  }

  return (
    <View className="flex-row justify-between items-center py-2.5">
      <Text className="text-base text-text-secondary w-[45%]" numberOfLines={1}>
        {label}
      </Text>
      <View className="w-[55%] items-end">{displayValue}</View>
    </View>
  );
};

// ImagePreviewRow is used as-is from your truck-cert code.

// --- Helper Functions (Replicated) ---
const formatDate = (date: Date) =>
  date ? format(new Date(date), "MM/dd/yyyy") : null;
const findLabel = (options: any, value: string) => {
  if (!value) return null;
  const list = Array.isArray(options) ? options : [];
  const found = list.find((o) => o.value === value);
  return found ? found.label : String(value);
};

const formatString = (str: string) => {
  if (!str) return null;
  return str.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

// --- FIELD MONITOR SPECIFIC SECTIONS ---

// Replicating the logic to determine which fields to display
const SiteAndVehicleDetailsSection = ({ fieldData, handleImagePress }: {fieldData: any, handleImagePress: () => void}) => {
  // Assuming 'type' (e.g., 'CD', 'Vegetative') is the primary identifier
  const type = fieldData?.type;
  const isTruckLoad = ['CD', 'Demo', 'Mixed', 'HHW', 'EWaste'].includes(type);
  const isVegetative = ['Leaners', 'Hangers', 'StumpExtraction'].includes(type);

  // Dynamic field mapping (adjust keys based on your store's structure)
  const frontImages = fieldData?.data?.photos_front_view;
  const loadImages = fieldData?.data?.photos_load_view;
  const debrisImages = fieldData?.data?.photos_debris_view; // Vegetative/Stump

  return (
    <SectionCard
      icon={<MapPin size={22} className="text-accent-primary" />}
      title="Site & Vehicle Details"
    >
      {/* Location Details */}
      <InfoRow label="Latitude / Longitude" value={fieldData?.data?.lat_long} />
      <InfoRow label="Address" value={fieldData?.data?.address} />
      <InfoRow label="Site Directed To" value={fieldData?.data?.site_directed_to} />

      <Separator className="my-3" />

      {/* Vehicle Details */}
      <InfoRow label="Vehicle ID" value={fieldData?.data?.truck_number} />
      <InfoRow label="Monitor Name" value={fieldData?.data?.field_monitor_name} />
      <InfoRow label="Monitor ID" value={fieldData?.data?.field_monitor_id} />

      <Separator className="my-3" />

      {/* Images */}
      <View className="mt-2">
        {frontImages && frontImages.length > 0 && (
          <ImagePreviewRow
            label="Front View"
            images={frontImages}
            onImagePress={handleImagePress}
          />
        )}
        {isTruckLoad && loadImages && loadImages.length > 0 && (
          <ImagePreviewRow
            label="Load View"
            images={loadImages}
            onImagePress={handleImagePress}
          />
        )}
        {isVegetative && debrisImages && debrisImages.length > 0 && (
          <ImagePreviewRow
            label="Debris View"
            images={debrisImages}
            onImagePress={handleImagePress}
          />
        )}
      </View>
    </SectionCard>
  );
};

const InspectionResultSection = ({ fieldData }: any) => {
  const isVegetative = ['Leaners', 'Hangers', 'StumpExtraction'].includes(fieldData?.type);

  // Determine the color for the Pass Status text
  const colorTheme = useThemeColors();
  const isPass = fieldData?.data?.pass_status === 'PASS';
  const statusColor = isPass ? colorTheme["successPrimary"] : colorTheme["errorPrimary"];

  const renderPassStatus = () => {
    if (!fieldData?.data?.pass_status) return null;

    return (
      <View className="flex-row justify-between items-center py-2.5">
        <Text className="text-lg font-bold text-text-secondary w-[45%]" numberOfLines={1}>
          Pass Status
        </Text>
        <Text
          className="text-xl font-extrabold text-right w-[55%]"
          style={{ color: statusColor }}
        >
          {fieldData.data.pass_status}
        </Text>
      </View>
    );
  };

  return (
    <SectionCard
      icon={<ClipboardCheck size={22} className="text-accent-primary" />}
      title="Inspection Result"
    >
      {renderPassStatus()}

      {/* Conditional fields for non-pass/rejection */}
      {!isPass && fieldData?.data?.reason_for_rejection && (
        <InfoRow label="Reason for Rejection" value={fieldData.data.reason_for_rejection} />
      )}

      <Separator className="my-3" />

      {/* Vegetative Specific Fields */}
      {isVegetative && (
        <>
          <Text className="text-base font-semibold text-text-primary mb-2 mt-2">
            Tree Assessment
          </Text>
          <InfoRow label="Type" value={formatString(fieldData.type)} />
          <InfoRow label="Diameter (in)" value={fieldData.data.diameter} />
          <InfoRow label="Stump Extraction" value={fieldData.data.stump_extraction_required} />
          <InfoRow label="ROE Required" value={fieldData.data.roe_required} />
          <InfoRow label="ROE Reason" value={fieldData.data.roe_reason} />
        </>
      )}

      {/* Notes/Comments */}
      <Text className="text-base font-semibold text-text-primary mb-2 mt-4">
        Monitor Notes
      </Text>
      <Text className="text-base text-text-secondary/80">
        {fieldData?.data?.field_monitor_notes || 'No notes recorded.'}
      </Text>
    </SectionCard>
  );
};


// --- MAIN FIELD MONITOR REVIEW SCREEN ---
const FieldMonitorReviewScreen = () => {
  const colorTheme = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { values: fieldData } = useFieldMonitorStore(); // Using the Field Monitor store
  const { fieldMap: schemaFieldMap } = useFieldMonitorSchemaStore(); // Using the Field Monitor schema store
  const { width } = useWindowDimensions();

  const [isImageDialogOpen, setIsImageDialogOpen] = useState<boolean>(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  const handleImagePress = (uri: string) => {
    setSelectedImageUri(uri);
    setIsImageDialogOpen(true);
  };

  // Early loading check
  if (!fieldData || !schemaFieldMap) {
    return (
      <View className="flex-1 items-center justify-center bg-background-secondary">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const inspectionTypeLabel = fieldData?.type ? formatString(fieldData.type) : 'Unknown Inspection';

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
          <Text className="text-[22px] font-semibold text-white">
            Field Monitor Review
          </Text>
        }
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between" }}
      >
        {/* --- PREMIUM SECONDARY HEADER (Matching Truck Cert) --- */}
        <View className="bg-background-primary px-6 py-4 flex-row items-center border-b border-border-primary mb-4">
          <ClipboardCheck size={22} className="text-accent-primary" />
          <Text className="text-xl font-semibold text-text-primary ml-3">
            Review & Finalize: Load Ticket
          </Text>
        </View>

        <View className="flex-1 p-4">

          {/* 1. SITE AND VEHICLE DETAILS */}
          <SiteAndVehicleDetailsSection
            fieldData={fieldData}
            handleImagePress={handleImagePress}
          />

          {/* 2. INSPECTION RESULT (PASS/FAIL, REASON, NOTES) */}
          <InspectionResultSection fieldData={fieldData} />

          {/* 3. ADDITIONAL FORM SPECIFIC DATA (e.g., Manifests, Permits, if applicable) */}
          {/* Placeholder for future sections if the Field Monitor data requires it */}
          {/* Example: truckData.manifest_uploaded && (
                        <SectionCard 
                            icon={<FileText size={22} className="text-accent-primary" />}
                            title="Manifests & Permits"
                        >
                            ...
                        </SectionCard>
                    )*/}

          <Separator className="mt-0" />

          {/* ACTION BUTTONS (Matching Truck Cert Review Layout) */}
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
              onPress={() => router.push("/signature")}
            >
              <Text className="text-white font-base font-open-sans-bold">
                Continue
              </Text>
              <ArrowRight size={20} color={colorTheme["backgroundPrimary"]} />
            </Button>
          </View>

          {/* --- Footer Text --- */}
          <View className="w-full mt-4">
            <Text className="text-sm text-text-primary text-center font-open-sans">
              Developed by{" "}
              <Text className="text-accent-primary font-open-sans">
                GISKernel
              </Text>
            </Text>
          </View>
          </View>
      </ScrollView>

      {/* IMAGE DIALOG (Used as-is for previewing images) */}
      <Dialog.Root
        open={isImageDialogOpen}
        onOpenChange={setIsImageDialogOpen}
        enableAndroidBlur
      >
        <Dialog.Portal>
          <Dialog.Content
            showCloseButton={true}
            className="p-0 bg-transparent shadow-none border-0"
          >
            {selectedImageUri && (
              <Image
                source={{ uri: selectedImageUri }}
                style={{ width: width * 0.9, height: width * 0.9 }}
                resizeMode="contain"
                className="rounded-xl"
              />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </View>
  );
};

export default FieldMonitorReviewScreen;