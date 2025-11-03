// components/ImageUploader.tsx

import React from "react";
import { View, Text, Image, Pressable, FlatList, ListRenderItem, Alert } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    FadeIn,
    FadeOut,
    LinearTransition,
} from "react-native-reanimated";
import { Upload, X } from "lucide-react-native";
import * as ImagePicker from 'expo-image-picker';
import { useThemeColors } from "@/hooks/useThemeColors";

// --- Type Definitions ---
export interface ImageAsset {
    id: string;
    uri: string;
}

interface ImagePreviewProps {
    asset: ImageAsset;
    onRemove: (id: string) => void;
}

interface ImageUploaderProps {
    images: ImageAsset[];
    onImagesChanged: (images: ImageAsset[]) => void;
}

// --- Animated Components ---
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// --- Sub-components (No changes here) ---
const ImagePreviewItem: React.FC<ImagePreviewProps> = ({ asset, onRemove }) => {
    const isPressed = useSharedValue(false);
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
            <Image
                source={{ uri: asset.uri }}
                className="w-24 h-24 rounded-xl"
            />
            <AnimatedPressable
                onPress={() => onRemove(asset.id)}
                onPressIn={() => (isPressed.value = true)}
                onPressOut={() => (isPressed.value = false)}
                style={animatedStyle}
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

    const colorTheme = useThemeColors();
    const isUploadPressed = useSharedValue(false);
    const [permission, requestPermission] = ImagePicker.useMediaLibraryPermissions();

    const handleAddImage = async () => {
        if (permission?.status !== ImagePicker.PermissionStatus.GRANTED) {
            const { status } = await requestPermission();
            if (status !== ImagePicker.PermissionStatus.GRANTED) {
                Alert.alert('Permission Required', 'Please grant permission to access your photo library.');
                return;
            }
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsMultipleSelection: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled && result.assets) {
            const newImages: ImageAsset[] = result.assets.map((asset) => ({
                id: asset.assetId || asset.uri,
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
        <ImagePreviewItem asset={item} onRemove={handleRemoveImage} />
    );

    return (
        <View className="p-4 w-full">
            <View className="flex-row items-center mb-4">
                <View className="flex-1 h-14 justify-center px-4 bg-background-secondary rounded-xl border border-[#CCCCCC]">
                    <Text className="text-text-secondary text-base font-medium">
                        {images.length > 0
                            ? `${images.length} image${images.length > 1 ? "s" : ""} selected`
                            : "Select images"}
                    </Text>
                </View>

                <AnimatedPressable
                    onPress={handleAddImage}
                    onPressIn={() => (isUploadPressed.value = true)}
                    onPressOut={() => (isUploadPressed.value = false)}
                    style={animatedUploadButtonStyle}
                    className="w-14 h-14 ml-3 bg-accent-primary rounded-xl items-center justify-center"
                >
                    <Upload size={24} color={colorTheme['textIcon']} />
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
    );
};

export default ImageUploader;