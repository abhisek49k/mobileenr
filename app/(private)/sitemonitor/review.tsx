import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  useWindowDimensions,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import Header from "@/components/ui/Header";
import { Button } from "@/components/ui/Button";
import {
  ChevronLeft,
  Truck,
  FileText,
  CheckCircle,
  XCircle,
  ClipboardCheck,
  CircleX,
  ArrowRight,
  MapPin, 
  Leaf, // New icon for Vegetative/Debris Type
  DollarSign, // Icon for Tipping Fee
  Scan, // Icon for Truck Number Scan
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { Dialog } from "@/components/ui/Dialog";
import { Separator } from "@/components/ui/Separator";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "@/hooks/useThemeColors";

// --- Custom Imports for Site Monitor Store and Schema (Placeholder) ---
// NOTE: Ensure these paths and types match your actual store implementation.
import { useSiteMonitorStore } from "@/store/site-monitor/useSiteMonitorStore";
import { useSiteMonitorSchemaStore } from "@/store/site-monitor/useSiteMonitorSchemaStore";
import MenuIcon from "@/components/menuIcon";

// --- TYPE DEFINITIONS (Based on previous conversation's schema) ---
type FieldType = 'text' | 'scan' | 'dropdown' | 'number' | 'imageUpload' | 'textarea' | 'toggle';

interface FieldSchema {
    id: string;
    name: string;
    label: string;
    type: FieldType;
    required: boolean;
    editable?: boolean;
}

interface TypeSchema {
    label: string;
    fields: FieldSchema[];
}

interface SiteMonitorSchema {
    formId: string;
    title: string;
    version: number;
    createdAt: string;
    updatedAt: string;
    types: {
        [key: string]: TypeSchema;
    };
}

interface SiteMonitorData {
    // This key must match a key in schema.types (e.g., 'Vegetative', 'CD', 'Mixed')
    debrisTypeKey: keyof SiteMonitorSchema['types'] | undefined; 
    [key: string]: any; // Collected field values
}

interface ReviewField {
    label: string;
    value: string | JSX.Element;
    required: boolean;
    type: FieldType;
}

// --- UTILITY FUNCTIONS ---

/**
 * Formats the raw value for display on the review screen based on field type.
 */
const formatDisplayValue = (field: FieldSchema, value: any, colorTheme: ReturnType<typeof useThemeColors>): string | JSX.Element => {
    if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        return <Text style={{ color: colorTheme.textSecondary + '80' }} className="font-semibold italic">N/A</Text>;
    }

    switch (field.type) {
        case 'number':
            if (field.name === 'tipping_fee_usd' && typeof value === 'number') {
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                }).format(value);
            }
            return String(value);

        case 'toggle':
            // Boolean values like ROE Required
            return value ? (
                <CheckCircle size={20} color={colorTheme["successPrimary"]} />
            ) : (
                <XCircle size={20} color={colorTheme["errorPrimary"]} />
            );

        case 'imageUpload':
            // Assuming 'value' is an array of file objects/URIs
            const files = Array.isArray(value) ? value : (value ? [value] : []);
            const count = files.length;
            
            if (count > 0) {
                return (
                    <Text className="text-blue-600 font-medium underline">
                        View {count} Photo{count !== 1 ? 's' : ''}
                    </Text>
                );
            }
            return <Text style={{ color: colorTheme.textSecondary + '80' }} className="italic">No Photos</Text>;

        case 'textarea':
            // Display multiline text
            return <Text className="text-base text-text-primary text-right" numberOfLines={10}>{String(value)}</Text>;

        default:
            return String(value);
    }
};

/**
 * Maps field data to schema fields for the review list.
 */
const getReviewFields = (
    fieldData: SiteMonitorData,
    schemaFieldMap: SiteMonitorSchema,
    colorTheme: ReturnType<typeof useThemeColors>
): { debrisTypeLabel: string; fields: ReviewField[] } | null => {
    const debrisTypeKey = fieldData.debrisTypeKey;

    if (!debrisTypeKey || !schemaFieldMap.types[debrisTypeKey]) {
        return null;
    }

    const typeSchema = schemaFieldMap.types[debrisTypeKey];
    const fields: ReviewField[] = [];

    for (const field of typeSchema.fields) {
        const value = fieldData[field.name];

        fields.push({
            label: field.label,
            value: formatDisplayValue(field, value, colorTheme),
            required: field.required,
            type: field.type,
        });
    }

    return {
        debrisTypeLabel: typeSchema.label,
        fields,
    };
};

// --- UI COMPONENTS ---

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

const SectionCard = ({ icon, title, children }: {icon: JSX.Element, title: string, children: JSX.Element | JSX.Element[]}) => (
  <View className="bg-background-primary rounded-2xl shadow-md border border-border-primary/50 p-4 mb-6">
    <View className="flex-row items-center">
      <View className="bg-accent-secondary/10 p-2 rounded-full">{icon}</View>
      <Text className="text-lg font-bold text-text-primary ml-3">{title}</Text>
    </View>
    <Separator className="my-3" />
    <View className="px-1">{children}</View>
  </View>
);

const ReviewInfoRow: React.FC<ReviewField> = ({ label, value, required, type }) => {
    const colorTheme = useThemeColors();
    
    // Custom handling for photo fields that have their own gallery
    if (type === 'imageUpload') {
        const imageUris = Array.isArray(value) ? value.map((uri: string) => ({ uri })) : (value ? [{ uri: value }] : []);
        
        // This leverages the ImagePreviewRow to handle the photo display separately
        if (imageUris.length > 0) {
            return (
                <ImagePreviewRow 
                    label={label} 
                    images={imageUris} 
                    // NOTE: The main screen component must handle the `onImagePress` logic
                    // For simplicity here, we pass a dummy function or expect the parent to override
                    onImagePress={() => console.log('Image press handled by parent.')} 
                />
            );
        }
    }
    
    // Normal Info Row
    return (
        <View className="flex-row justify-between items-center py-2.5">
            <Text className="text-base text-text-secondary w-[45%]" numberOfLines={2}>
                {label}
                {required && <Text className="text-red-500 ml-1 font-bold">*</Text>}
            </Text>
            <View className="w-[55%] items-end">
                {typeof value === 'string' ? (
                    <Text
                        className="text-base font-semibold text-text-primary text-right"
                        numberOfLines={3}
                    >
                        {value}
                    </Text>
                ) : (
                    // Renders CheckCircle, XCircle, or custom JSX from formatDisplayValue
                    value
                )}
            </View>
        </View>
    );
};

const DebrisDetailsSection: React.FC<{ fields: ReviewField[] }> = ({ fields }) => {
    // Separate ImageUpload fields for a custom display group
    const displayFields = fields.filter(f => f.type !== 'imageUpload');
    const imageFields = fields.filter(f => f.type === 'imageUpload');

    return (
        <SectionCard
            icon={<Leaf size={22} className="text-accent-primary" />}
            title="Debris & Load Details"
        >
            {displayFields.map((field, index) => (
                <ReviewInfoRow key={index} {...field} />
            ))}

            <Separator className="my-3" />
            
            <Text className="text-lg font-bold text-text-primary mt-2 mb-1">Uploaded Media</Text>
            {imageFields.map((field, index) => {
                const imageUris = Array.isArray(field.value) ? field.value.map((uri: string) => ({ uri })) : (field.value && typeof field.value === 'string' ? [{ uri: field.value }] : []);
                
                // If the value is a string (e.g., 'View 3 Photos'), we need to pass the URIs from fieldData directly
                const actualImageValue = field.type === 'imageUpload' ? (field.name === 'tipping_ticket_photo' ? field.value : field.value) : undefined;
                
                // NOTE: This is a simplified approach. In a real app, you would need to access
                // the raw URIs from the parent component's state (fieldData) and pass them here.
                return (
                    <ImagePreviewRow
                        key={index}
                        label={field.label}
                        // For this dynamic screen, we'll try to use the raw array from fieldData if available
                        images={Array.isArray(field.value) ? field.value : undefined} 
                        onImagePress={(uri) => console.log(`Open Image: ${uri}`)} // Placeholder
                    />
                );
            })}
             {/* Fallback for no images */}
             {imageFields.length === 0 && <Text className="text-base text-text-secondary/60 italic">No Media Fields Found for this Type.</Text>}
        </SectionCard>
    );
};

// --- MAIN SITE MONITOR REVIEW SCREEN ---
const SiteMonitorReviewScreen = () => {
    const colorTheme = useThemeColors();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    
    // Hooking up to the Site Monitor stores
    const { values: fieldData } = useSiteMonitorStore();
    const { fieldMap: schemaFieldMap } = useSiteMonitorSchemaStore();

    const { width } = useWindowDimensions();

    const [isImageDialogOpen, setIsImageDialogOpen] = useState<boolean>(false);
    const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

    // Dynamic data mapping
    const reviewData = fieldData?.debrisTypeKey && schemaFieldMap ? getReviewFields(fieldData, schemaFieldMap, colorTheme) : null;
    
    // Consolidate all image URIs from the fields for the preview dialog
    const allImageFields = reviewData?.fields.filter(f => f.type === 'imageUpload') || [];
    const allImageUris = allImageFields.flatMap(field => fieldData[field.name] || []).filter(uri => typeof uri === 'string').map(uri => ({ uri }));

    const handleImagePress = (uri: string) => {
        setSelectedImageUri(uri);
        setIsImageDialogOpen(true);
    };
    
    // Function to render ImagePreviewRow from the dynamic fields
    const renderImagePreviews = () => {
        return allImageFields.map((field, index) => {
            const images = fieldData[field.name];
            const imageArray = Array.isArray(images) ? images : (images ? [images] : []);

            return (
                <ImagePreviewRow
                    key={field.name}
                    label={field.label}
                    images={imageArray.map(uri => ({ uri }))}
                    onImagePress={handleImagePress}
                />
            );
        });
    };
    
    // Separate the fields into two main groups for better readability
    const generalDetails = reviewData?.fields.filter(f => !['tipping_ticket_number', 'tipping_fee_usd', 'photos', 'tipping_ticket_photo', 'load_call_photo'].includes(f.name)) || [];
    const financialAndTipping = reviewData?.fields.filter(f => ['tipping_ticket_number', 'tipping_fee_usd'].includes(f.name)) || [];
    const notesField = reviewData?.fields.find(f => f.name.includes('_notes'));
    
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
                        Site Monitor Review
                    </Text>
                }
                headerRight={<MenuIcon/>}
            />

            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                
                {/* --- PREMIUM SECONDARY HEADER --- */}
                <View className="bg-background-primary px-6 py-4 flex-row items-center border-b border-border-primary mb-4">
                    <ClipboardCheck size={22} className="text-accent-primary" />
                    <Text className="text-xl font-semibold text-text-primary ml-3">
                        Review: Disposal Ticket
                    </Text>
                </View>

                <View className="flex-1 p-4">

                    {/* 1. CORE DEBRIS AND LOAD DETAILS SECTION */}
                    <SectionCard
                        icon={<Leaf size={22} className="text-accent-primary" />}
                        title={`Ticket Details`}
                    >
                        {generalDetails.map((field, index) => (
                            <ReviewInfoRow 
                                key={index} 
                                {...field} 
                                // Pass the handleImagePress prop down specifically for image fields
                                // This is a bit complex in a highly dynamic loop; a simpler approach is below.
                            />
                        ))}
                    </SectionCard>

                    {/* 2. TIPPING & FINANCIAL SECTION */}
                    {financialAndTipping.length > 0 && (
                        <SectionCard
                            icon={<DollarSign size={22} className="text-accent-primary" />}
                            title="Tipping & Financial"
                        >
                            {financialAndTipping.map((field, index) => (
                                <ReviewInfoRow key={index} {...field} />
                            ))}
                        </SectionCard>
                    )}
                    
                    {/* 3. UPLOADED PHOTOS SECTION */}
                    <SectionCard
                        icon={<FileText size={22} className="text-accent-primary" />}
                        title="Uploaded Photos"
                    >
                        {renderImagePreviews()}
                        {allImageUris.length === 0 && <Text className="text-base text-text-secondary/60 italic">No images were uploaded for this load type.</Text>}
                    </SectionCard>
                    
                    {/* 4. NOTES SECTION */}
                    {notesField && (
                        <SectionCard
                            icon={<ClipboardCheck size={22} className="text-accent-primary" />}
                            title="Monitor Notes"
                        >
                            <Text className="text-base text-text-secondary/80 mt-2">
                                {notesField.value || 'No notes recorded.'}
                            </Text>
                        </SectionCard>
                    )}


                    <Separator className="mt-0" />

                    {/* ACTION BUTTONS */}
                    <View className="flex-row items-center justify-center gap-2 mt-8">
                        {/* CANCEL Button */}
                        <Button
                            className="flex-1 border border-accent-primary bg-background-primary py-4 rounded-2xl gap-3"
                            onPress={() => router.dismissTo("/projects")} // Changed from truck-cert logic
                        >
                            <Text className="text-accent-primary font-base font-open-sans-bold">
                                Cancel
                            </Text>
                            <CircleX size={20} color={colorTheme["accentPrimary"]} />
                        </Button>

                        {/* CONTINUE/FINALIZE Button */}
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

                    {/* Footer Text */}
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

export default SiteMonitorReviewScreen;