// app/(private)/truck-cert/review.tsx

import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import React, { useState, useMemo } from "react";
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
  Box,
  ChevronsUpDown,
  CircleX,
  ArrowRight,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { Dialog } from "@/components/ui/Dialog";
import { Separator } from "@/components/ui/Separator";
import { CalculatedView } from "@/components/ui/CalculatedView";
import { useTruckFormStore } from "@/store/truck-certification/useTruckStore";
import { useTruckSchemaStore } from "@/store/truck-certification/useTruckSchemaStore";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProjectStore } from "@/store/projects/useProjectStore";
import MenuIcon from "@/components/menuIcon";

// --- Helper Components ---
const SectionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <View className="bg-background-primary rounded-2xl shadow-md border border-border-primary/50 p-4 mb-6">
    <View className="flex-row items-center">
      <View className="bg-accent-secondary/10 p-2 rounded-full">{icon}</View>
      <Text className="text-lg font-bold text-text-primary ml-3">{title}</Text>
    </View>
    <Separator className="my-3" />
    <View className="px-1">{children}</View>
  </View>
);

const InfoRow: React.FC<{
  label: string;
  value?: string | number | boolean | null;
}> = ({ label, value }) => {
  const colorTheme = useThemeColors();
  let displayValue: React.ReactNode = (
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

// --- Helper Functions ---
const formatDate = (date: any) =>
  date ? format(new Date(date), "MM/dd/yyyy") : null;
const findLabel = (
  options?: { label: string; value: string }[],
  value?: any
): string => {
  if (!value) return "N/A";
  // ensure options is always an array
  const list = Array.isArray(options) ? options : [];
  const found = list.find((o) => o.value === value);
  return found ? found.label : String(value);
};

const formatString = (str?: string) => {
  if (!str) return null;
  return str.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatVehicleType = (type?: string) => {
  if (!type) return "N/A";
  return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

// --- Helper to map state codes if needed ---
const getStateLabel = (value: string, options?: any[]) => {
  if (!options || !value) return value;
  const found = options.find((opt) => opt.value === value);
  return found ? found.label : value;
};

export const VehicleDetailsSection = ({
  truckData,
  schemaFieldMap,
  handleImagePress,
}: any) => {
  // 1. Determine Context
  const type = truckData.vehicle_type_selector; // "truck" | "equipment" | "roll_off"
  const isTruck = type === "truck";

  // 2. Normalize "Sub-Type" Logic
  // We calculate the specific label and value here to keep JSX clean
  let specificTypeLabel = null;
  let specificTypeValueRaw = null;

  switch (type) {
    case "truck":
      specificTypeLabel = "Truck Type";
      specificTypeValueRaw = truckData.truck_type_selector;
      break;
    case "equipment":
      specificTypeLabel = "Equipment Type";
      specificTypeValueRaw = truckData.equipment_type_selector;
      break;
    case "roll_off":
      specificTypeLabel = "Roll Off Type";
      // Assuming you have a field like 'rolloff_type_selector',
      // if not, replace with the correct field key
      specificTypeValueRaw = truckData.rolloff_type_selector;
      break;
  }

  const specificTypeValue = formatString(specificTypeValueRaw);

  // 3. Normalize Common Data
  const displayMake =
    truckData.truck_make || truckData.equipment_make || truckData.rolloff_make;
  const displayModel =
    truckData.truck_model ||
    truckData.equipment_model ||
    truckData.rolloff_model;
  const displayColor =
    truckData.truck_color ||
    truckData.equipment_color ||
    truckData.rolloff_color;
  const displayComments =
    truckData.comments ||
    truckData.equipment_comments ||
    truckData.rolloff_comments;

  // 4. Aggregate Images
  const frontImages =
    truckData.truck_front_view_upload ||
    truckData.equipment_front_view_upload ||
    truckData.rolloff_front_view_upload;
  const sideImages =
    truckData.truck_side_view_upload ||
    truckData.equipment_side_view_upload ||
    truckData.rolloff_side_view_upload;
  const backImages =
    truckData.truck_back_view_upload ||
    truckData.equipment_back_view_upload ||
    truckData.rolloff_back_view_upload;
  const plateImages =
    truckData.truck_numberplate_view_upload ||
    truckData.equipment_numberplate_view_upload ||
    truckData.rolloff_numberplate_view_upload;

  return (
    <SectionCard
      icon={<Truck size={22} className="text-accent-primary" />}
      title="Vehicle Details"
    >
      {/* General Category */}
      <InfoRow label="Vehicle Category" value={formatString(type)} />

      {/* --- NEW: Specific Type (Truck Type / Equipment Type etc) --- */}
      {/* Only renders if we found a valid value for the specific type */}
      {specificTypeValue && (
        <InfoRow label={specificTypeLabel} value={specificTypeValue} />
      )}

      {/* Common Fields */}
      {displayMake && <InfoRow label="Make" value={displayMake} />}
      {displayModel && <InfoRow label="Model" value={displayModel} />}
      {displayColor && <InfoRow label="Color" value={displayColor} />}

      {/* Truck Specifics */}
      {isTruck && (
        <>
          {truckData.truck_year && (
            <InfoRow label="Year" value={formatDate(truckData.truck_year)} />
          )}
          {truckData.tag_number && (
            <InfoRow label="Tag #" value={truckData.tag_number} />
          )}
          {truckData.tag_state && (
            <InfoRow
              label="Tag State"
              value={getStateLabel(
                truckData.tag_state,
                schemaFieldMap?.tag_state?.options?.data
              )}
            />
          )}
          {truckData.tag_expiration_date && (
            <InfoRow
              label="Tag Expiration"
              value={formatDate(truckData.tag_expiration_date)}
            />
          )}
          {truckData.has_sideboards !== undefined && (
            <InfoRow
              label="Has Sideboards"
              value={truckData.has_sideboards ? "Yes" : "No"}
            />
          )}
          {truckData.has_open_back_mesh !== undefined && (
            <InfoRow
              label="Back/Soft Mesh"
              value={truckData.has_open_back_mesh ? "Yes" : "No"}
            />
          )}
          {truckData.has_hand_loader !== undefined && (
            <InfoRow
              label="Hand Loader"
              value={truckData.has_hand_loader ? "Yes" : "No"}
            />
          )}
        </>
      )}

      {/* Comments */}
      {displayComments && <InfoRow label="Comments" value={displayComments} />}

      {/* Images */}
      <View className="mt-2">
        {frontImages && frontImages.length > 0 && (
          <ImagePreviewRow
            label="Front View"
            images={frontImages}
            onImagePress={handleImagePress}
          />
        )}
        {sideImages && sideImages.length > 0 && (
          <ImagePreviewRow
            label="Side View"
            images={sideImages}
            onImagePress={handleImagePress}
          />
        )}
        {backImages && backImages.length > 0 && (
          <ImagePreviewRow
            label="Back View"
            images={backImages}
            onImagePress={handleImagePress}
          />
        )}
        {plateImages && plateImages.length > 0 && (
          <ImagePreviewRow
            label="Number Plate View"
            images={plateImages}
            onImagePress={handleImagePress}
          />
        )}
      </View>
    </SectionCard>
  );
};

// --- Main Review Screen ---
const ReviewScreen = () => {
  const colorTheme = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const truckData = useTruckFormStore((state) => state.values);
  const schemaFieldMap = useTruckSchemaStore((state) => state.fieldMap);
  const { width } = useWindowDimensions();
  const { selectedProject, selectedPrime, selectedSub } = useProjectStore();

  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  const handleImagePress = (uri: string) => {
    setSelectedImageUri(uri);
    setIsImageDialogOpen(true);
  };

  // Early loading check
  if (!schemaFieldMap) {
    return (
      <View className="flex-1 items-center justify-center bg-background-secondary">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const hasAttachment =
    truckData.vin_number_upload ||
    truckData.driving_license_upload ||
    truckData.insurance_card_upload;
  const hasOptionalArea =
    truckData.has_over_cab_section ||
    truckData.has_sloped_section ||
    truckData.has_shortened_tailgate ||
    truckData.has_shortened_frontgate;

  const isTruck = truckData.vehicle_type_selector === "truck";

  const add_deduct_length =
    truckData.add_deduct_rectangle_length_in ||
    truckData.add_deduct_sloped_length_in ||
    truckData.add_deduct_other_add_length_in;
  const add_deduct_width =
    truckData.add_deduct_rectangle_width_in ||
    truckData.add_deduct_sloped_width_in ||
    truckData.add_deduct_other_add_width_in;
  const add_deduct_height =
    truckData.add_deduct_rectangle_height_in ||
    truckData.add_deduct_sloped_height_in ||
    truckData.add_deduct_other_add_height_in;

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

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between" }}
      >
        {/* --- 2. PREMIUM SECONDARY HEADER ADDED HERE --- */}
        <View className="bg-background-primary px-6 py-4 flex-row items-center border-b border-border-primary mb-4">
          <ClipboardCheck size={22} className="text-accent-primary" />
          <Text className="text-xl font-semibold text-text-primary ml-3">
            Review & Continue
          </Text>
        </View>
        <View className="flex-1 p-4">
          {/* Project Details */}
          <SectionCard
            icon={<ClipboardList size={22} className="text-accent-primary" />}
            title="Project Details"
          >
            <InfoRow label="Project Name" value={selectedProject?.name} />
            <InfoRow
              label="Prime Contractor"
              value={selectedPrime?.label || "N/A"}
            />
            <InfoRow
              label="Sub Contractor"
              value={selectedSub?.label || "N/A"}
            />
          </SectionCard>

          {/* Driver Details */}
          {isTruck && (
            <SectionCard
              icon={<User size={22} className="text-accent-primary" />}
              title="Driver Details"
            >
              <InfoRow
                label="Full Name"
                value={`${truckData.driver_first_name || ""} ${truckData.driver_last_name || ""}`}
              />
              <InfoRow label="Company" value={truckData.driver_company_name} />
              <InfoRow label="Email" value={truckData.driver_email} />
              <InfoRow label="Phone" value={truckData.driver_phone} />
              <InfoRow
                label="License State"
                value={findLabel(
                  schemaFieldMap?.tag_state?.options?.data,
                  truckData.license_state
                )}
              />
              <InfoRow
                label="License Expiration"
                value={formatDate(truckData.license_expiration_date)}
              />
              <InfoRow
                label="Is Driver Owner?"
                value={truckData.is_driver_owner}
              />
            </SectionCard>
          )}

          {/* Vehicle Details */}
          <VehicleDetailsSection
            truckData={truckData}
            schemaFieldMap={schemaFieldMap}
            handleImagePress={handleImagePress}
          />

          {truckData.container_bottom_shape && (
            <SectionCard
              icon={<Box size={22} className="text-accent-primary" />}
              title="Container & Volume"
            >
              <InfoRow
                label="Container Shape"
                value={findLabel(
                  schemaFieldMap.container_bottom_shape?.options,
                  truckData.container_bottom_shape
                )}
              />
              {truckData.container_bottom_shape === "round_bottom" ? (
                <>
                  <InfoRow
                    label="RB Style"
                    value={findLabel(
                      schemaFieldMap.round_bottom_style,
                      truckData.round_bottom_style
                    )}
                  />
                  <InfoRow
                    label="RB Operation"
                    value={findLabel(
                      schemaFieldMap.round_bottom_op_type,
                      truckData.round_bottom_op_type
                    )}
                  />
                  {truckData.round_bottom_style === "flat_sides" ? (
                    <>
                      <InfoRow
                        label="H Flat Length"
                        value={
                          truckData.rb_flat_h_flat_in
                            ? `${truckData.rb_flat_h_flat_in} in`
                            : null
                        }
                      />
                      <InfoRow
                        label="Flat Width"
                        value={
                          truckData.rb_flat_width_in
                            ? `${truckData.rb_flat_width_in} in`
                            : null
                        }
                      />
                      <InfoRow
                        label="Flat Height"
                        value={
                          truckData.rb_flat_height_in
                            ? `${truckData.rb_flat_height_in} in`
                            : null
                        }
                      />
                    </>
                  ) : (
                    <>
                      <InfoRow
                        label="Curved Length"
                        value={
                          truckData.rb_curved_length_in
                            ? `${truckData.rb_curved_length_in} in`
                            : null
                        }
                      />
                      <InfoRow
                        label="Curved Width"
                        value={
                          truckData.rb_curved_width_in
                            ? `${truckData.rb_curved_width_in} in`
                            : null
                        }
                      />
                      <InfoRow
                        label="Curved Height"
                        value={
                          truckData.rb_curved_height_in
                            ? `${truckData.rb_curved_height_in} in`
                            : null
                        }
                      />
                    </>
                  )}
                  <Separator className="my-3" />
                  <CalculatedView
                    label="Main Volume:"
                    formula="(l*w*h)/46656"
                    dependencies={
                      truckData.round_bottom_style === "flat_sides"
                        ? [
                            truckData.rb_flat_h_flat_in,
                            truckData.rb_flat_width_in,
                            truckData.rb_flat_height_in,
                          ]
                        : [
                            truckData.rb_curved_length_in,
                            truckData.rb_curved_width_in,
                            truckData.rb_curved_height_in,
                          ]
                    }
                    unit="CY"
                    className="shadow-none border-0 bg-transparent h-auto px-0"
                  />
                </>
              ) : (
                <>
                  <InfoRow
                    label="Main Area Length"
                    value={
                      truckData.length_in ? `${truckData.length_in} in` : null
                    }
                  />
                  <InfoRow
                    label="Main Area Width"
                    value={
                      truckData.width_in ? `${truckData.width_in} in` : null
                    }
                  />
                  <InfoRow
                    label="Main Area Height"
                    value={
                      truckData.height_in ? `${truckData.height_in} in` : null
                    }
                  />
                  <Separator className="my-2" />
                  <CalculatedView
                    label="Volume:"
                    formula="(0.5 * slope * height * width) / 46656"
                    dependencies={[
                      truckData.length_in,
                      truckData.height_in,
                      truckData.width_in,
                    ]}
                    unit="CY"
                    className="shadow-none border-0 bg-transparent h-auto px-0"
                  />
                </>
              )}
            </SectionCard>
          )}

          {isTruck && hasOptionalArea && (
            <SectionCard
              icon={
                <ChevronsUpDown size={22} className="text-accent-primary" />
              }
              title="Optional Area"
            >
              {truckData.has_over_cab_section && (
                <>
                  <Text className="text-base font-semibold text-text-primary mb-2 mt-4">
                    Over-Cab Section
                  </Text>
                  <InfoRow
                    label="Length"
                    value={
                      truckData.over_cab_length_in
                        ? `${truckData.over_cab_length_in} in`
                        : null
                    }
                  />
                  <InfoRow
                    label="Width"
                    value={
                      truckData.over_cab_width_in
                        ? `${truckData.over_cab_width_in} in`
                        : null
                    }
                  />
                  <InfoRow
                    label="Height"
                    value={
                      truckData.over_cab_height_in
                        ? `${truckData.over_cab_height_in} in`
                        : null
                    }
                  />
                  <Separator className="my-2" />
                  <CalculatedView
                    label="Volume:"
                    formula="(length * width * height) / 46656"
                    dependencies={[
                      truckData.over_cab_length_in,
                      truckData.over_cab_width_in,
                      truckData.over_cab_height_in,
                    ]}
                    unit="CY"
                    className="shadow-none border-0 bg-transparent h-auto px-0"
                  />
                </>
              )}
              {truckData.has_sloped_section && (
                <>
                  <Text className="text-base font-semibold text-text-primary mb-2 mt-4">
                    Sloped Section
                  </Text>
                  <InfoRow
                    label="Length"
                    value={
                      truckData.sloped_length_in
                        ? `${truckData.sloped_length_in} in`
                        : null
                    }
                  />
                  <InfoRow
                    label="Height"
                    value={
                      truckData.sloped_height_in
                        ? `${truckData.sloped_height_in} in`
                        : null
                    }
                  />
                  {/* Assuming a sloped section would also have a width for volume calculation */}
                  {truckData.sloped_width_in && (
                    <InfoRow
                      label="Width"
                      value={`${truckData.sloped_width_in} in`}
                    />
                  )}
                  <Separator className="my-2" />
                  <CalculatedView
                    label="Volume:"
                    formula="(0.5 * length * height * width) / 46656"
                    dependencies={[
                      truckData.sloped_length_in,
                      truckData.sloped_height_in,
                      truckData.sloped_width_in,
                    ]}
                    unit="CY"
                    className="shadow-none border-0 bg-transparent h-auto px-0"
                  />
                </>
              )}
              {truckData.has_shortened_tailgate && (
                <>
                  <Text className="text-base font-semibold text-text-primary mb-2">
                    Shortened Tailgate
                  </Text>
                  <InfoRow
                    label="Height"
                    value={
                      truckData.tailgate_height_in
                        ? `${truckData.tailgate_height_in} in`
                        : null
                    }
                  />
                  <InfoRow
                    label="Width"
                    value={
                      truckData.tailgate_width_in
                        ? `${truckData.tailgate_width_in} in`
                        : null
                    }
                  />
                  <InfoRow
                    label="Slope X"
                    value={
                      truckData.tailgate_slope_x_in
                        ? `${truckData.tailgate_slope_x_in} in`
                        : null
                    }
                  />
                  <Separator className="my-2" />
                  <CalculatedView
                    label="Volume:"
                    formula="(0.5 * slope * height * width) / 46656"
                    dependencies={[
                      truckData.tailgate_slope_x_in,
                      truckData.tailgate_height_in,
                      truckData.tailgate_width_in,
                    ]}
                    unit="CY"
                    className="shadow-none border-0 bg-transparent h-auto px-0"
                  />
                </>
              )}
              {truckData.has_shortened_frontgate && (
                <>
                  <Text className="text-base font-semibold text-text-primary mb-2 mt-4">
                    Shortened Frontgate
                  </Text>
                  <InfoRow
                    label="Height"
                    value={
                      truckData.frontgate_height_in
                        ? `${truckData.frontgate_height_in} in`
                        : null
                    }
                  />
                  <InfoRow
                    label="Width"
                    value={
                      truckData.frontgate_width_in
                        ? `${truckData.frontgate_width_in} in`
                        : null
                    }
                  />
                  <InfoRow
                    label="Slope X"
                    value={
                      truckData.frontgate_slope_x_in
                        ? `${truckData.frontgate_slope_x_in} in`
                        : null
                    }
                  />
                  <Separator className="my-2" />
                  <CalculatedView
                    label="Volume:"
                    formula="(0.5 * slope * height * width) / 46656"
                    dependencies={[
                      truckData.frontgate_slope_x_in,
                      truckData.frontgate_height_in,
                      truckData.frontgate_width_in,
                    ]}
                    unit="CY"
                    className="shadow-none border-0 bg-transparent h-auto px-0"
                  />
                </>
              )}
            </SectionCard>
          )}

          {truckData.add_deduct_shape && truckData.add_deduct_type && (
            <SectionCard
              icon={
                <ChevronsUpDown size={22} className="text-accent-primary" />
              }
              title="Addition OR Deduction"
            >
              <InfoRow label="Shape" value={truckData.add_deduct_shape} />
              <InfoRow label="Type" value={truckData.add_deduct_type} />
              <InfoRow
                label="Length"
                value={add_deduct_length ? `${add_deduct_length} in` : null}
              />
              <InfoRow
                label="Width"
                value={add_deduct_width ? `${add_deduct_width} in` : null}
              />
              <InfoRow
                label="Height"
                value={add_deduct_height ? `${add_deduct_height} in` : null}
              />
              <Separator className="my-2" />
              <CalculatedView
                label="Volume:"
                formula="(0.5 * slope * height * width) / 46656"
                dependencies={[
                  add_deduct_length,
                  add_deduct_height,
                  add_deduct_width,
                ]}
                unit="CY"
                className="shadow-none border-0 bg-transparent h-auto px-0"
              />
            </SectionCard>
          )}

          {/* Attachments */}
          {hasAttachment && (
            <SectionCard
              icon={<FileText size={22} className="text-accent-primary" />}
              title="Attachments"
            >
              <ImagePreviewRow
                label="VIN Number"
                images={truckData.vin_number_upload}
                onImagePress={handleImagePress}
              />
              <ImagePreviewRow
                label="Driving License"
                images={truckData.driving_license_upload}
                onImagePress={handleImagePress}
              />
              <ImagePreviewRow
                label="Insurance Card"
                images={truckData.insurance_card_upload}
                onImagePress={handleImagePress}
              />
            </SectionCard>
          )}

          <Separator className="mt-0" />

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

export default ReviewScreen;
