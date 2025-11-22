// components/ImageUploader.tsx

import React, { useState } from "react";
import { View, Text, Image, Pressable, FlatList, ListRenderItem, Alert, useWindowDimensions } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    FadeIn,
    FadeOut,
    LinearTransition,
} from "react-native-reanimated";
import { Camera, X } from "lucide-react-native"; // Changed Upload to Camera
import * as ImagePicker from 'expo-image-picker';
import { useThemeColors } from "@/hooks/useThemeColors";
import { Dialog } from "./Dialog";

// --- Type Definitions ---
export interface ImageAsset {
    id: string;
    uri: string;
}

interface ImagePreviewProps {
    asset: ImageAsset;
    onRemove: (id: string) => void;
    onPress: (asset: ImageAsset) => void;
}

interface ImageUploaderProps {
    images: ImageAsset[];
    onImagesChanged: (images: ImageAsset[]) => void;
}

// --- Animated Components ---
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// --- Sub-components (No changes here) ---
const ImagePreviewItem: React.FC<ImagePreviewProps> = ({ asset, onRemove, onPress }) => {
    const isPressed = useSharedValue(false);
    const isRemovePressed = useSharedValue(false);
    const isPreviewPressed = useSharedValue(false);

    const removeBtnAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(isRemovePressed.value ? 0.95 : 1) }],
    }));

    const previewAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(isPreviewPressed.value ? 0.95 : 1) }],
    }));

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(isPressed.value ? 0.95 : 1) }],
    }));

    return (
        <Animated.View
            layout={LinearTransition.duration(200)}
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(200)}
            className="relative mr-3"
        >
            <Pressable
                onPress={() => onPress(asset)}
                onPressIn={() => isPreviewPressed.value = true}
                onPressOut={() => isPreviewPressed.value = false}
            >
                <Animated.View style={previewAnimatedStyle}>
                    <Image source={{ uri: asset.uri }} className="w-24 h-24 rounded-xl" />
                </Animated.View>
            </Pressable>
            <AnimatedPressable
                onPress={() => onRemove(asset.id)}
                onPressIn={() => (isPressed.value = true)}
                onPressOut={() => (isPressed.value = false)}
                style={removeBtnAnimatedStyle}
                className="absolute -top-1.5 -right-1.5 bg-background-primary rounded-full p-0.5 shadow-md"
                hitSlop={10}
            >
                <X size={16} className="text-error-primary" />
            </AnimatedPressable>
        </Animated.View>
    );
};

// --- Main Smart Component ---
const ImageUploader: React.FC<ImageUploaderProps> = ({
    images,
    onImagesChanged,
}) => {

    const { width } = useWindowDimensions();
    const colorTheme = useThemeColors();
    const isUploadPressed = useSharedValue(false);
    
    // CHANGED: Request Camera Permissions instead of Media Library
    const [permission, requestPermission] = ImagePicker.useCameraPermissions();

    // --- Internal state for the Dialog ---
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<ImageAsset | null>(null);

    // --- Internal handler for opening the preview ---
    const handleImagePreview = (image: ImageAsset) => {
        setSelectedImage(image);
        setIsPreviewOpen(true);
    };

    const handleCaptureImage = async () => {
        // CHANGED: Check for Camera Permission
        if (permission?.status !== ImagePicker.PermissionStatus.GRANTED) {
            const { status } = await requestPermission();
            if (status !== ImagePicker.PermissionStatus.GRANTED) {
                Alert.alert('Permission Required', 'Please grant permission to access your camera.');
                return;
            }
        }

        // CHANGED: Use launchCameraAsync
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            // NOTE: Camera does not support "allowsMultipleSelection". 
            // User must take one photo at a time.
            allowsEditing: true, // Added: allows user to crop to the aspect ratio below
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled && result.assets) {
            const newImages: ImageAsset[] = result.assets.map((asset) => ({
                id: asset.assetId || asset.uri, // assetId might be null for camera, uri is fallback
                uri: asset.uri,
            }));
            onImagesChanged([...images, ...newImages]);
        }
    };

    const handleRemoveImage = (idToRemove: string) => {
        const updatedImages = images.filter((image) => image.id !== idToRemove);
        onImagesChanged(updatedImages);
    };

    const animatedUploadButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(isUploadPressed.value ? 0.9 : 1) }],
    }));

    const renderItem: ListRenderItem<ImageAsset> = ({ item }) => (
        <ImagePreviewItem
            asset={item}
            onRemove={handleRemoveImage}
            onPress={handleImagePreview} 
        />
    );

    return (
        <>
            <View className="w-full">
                <View className="flex-row items-center mb-4">
                    <View className="flex-1 h-14 justify-center px-4 bg-[#E6E6E6] rounded-xl border border-[#CCCCCC]">
                        <Text className="text-[#3A3A3A] text-base font-medium">
                            {images.length > 0
                                ? `${images.length} image${images.length > 1 ? "s" : ""} captured`
                                : "Capture images"} 
                        </Text>
                    </View>

                    <AnimatedPressable
                        onPress={handleCaptureImage}
                        onPressIn={() => (isUploadPressed.value = true)}
                        onPressOut={() => (isUploadPressed.value = false)}
                        style={animatedUploadButtonStyle}
                        className="w-14 h-14 ml-3 bg-accent-primary rounded-xl items-center justify-center"
                    >
                        {/* CHANGED: Swapped Upload icon for Camera icon */}
                        <Camera size={24} color={colorTheme['textIcon']} />
                    </AnimatedPressable>
                </View>

                <FlatList
                    data={images}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingVertical: 8 }}
                />
            </View>
            
            <Dialog.Root open={isPreviewOpen} onOpenChange={setIsPreviewOpen} enableAndroidBlur={true}>
                <Dialog.Portal>
                    <Dialog.Content showCloseButton={true} className="p-0 shadow-none" >
                        {selectedImage && (
                            <Image
                                source={{ uri: selectedImage.uri }}
                                style={{ width: width * 0.9, height: width * 0.9 }}
                                resizeMode="contain"
                                className="rounded-xl"
                            />
                        )}
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    );
};

export default ImageUploader;