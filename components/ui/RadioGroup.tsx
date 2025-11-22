// components/ui/RadioGroup.tsx

import React,
{
    createContext,
    useContext,
    useState,
    useEffect
} from "react";
import {
    View,
    Text,
    Pressable,
    Image,
    ImageSourcePropType,
    useWindowDimensions
} from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Dialog } from "./Dialog";
import { cn } from "@/lib/utils";
import { X } from "lucide-react-native";

// --- 1. CONTEXT SETUP ---
interface RadioGroupContextType {
    selectedValue: string | null;
    setSelectedValue: (value: string) => void;
    openImagePreview: (info: { source: ImageSourcePropType; title: string }) => void;
}

const RadioGroupContext = createContext<RadioGroupContextType | null>(null);

const useRadioGroupContext = () => {
    const context = useContext(RadioGroupContext);
    if (!context) {
        throw new Error("RadioGroup components must be used within a RadioGroup.Root");
    }
    return context;
};

// --- 2. COMPOUND COMPONENTS ---

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// IMAGE: An optional image for the right side of the item.
interface RadioGroupImageProps {
    source: ImageSourcePropType;
    title: string; // Title is now required for the dialog header
    className?: string;
}
const ImageComponent: React.FC<RadioGroupImageProps> = ({ source, title, className }) => {
    const { openImagePreview } = useRadioGroupContext();
    return (
        <Pressable onPress={() => openImagePreview({ source, title })} hitSlop={10}>
            <Image
                source={source}
                style={{ width: 90, height: 42 }}
                resizeMode="contain"
            />
        </Pressable>
    );
};

// LABEL: The text label for the radio item.
interface RadioGroupLabelProps {
    children: React.ReactNode;
    className?: string;
}
const Label: React.FC<RadioGroupLabelProps> = ({ children, className }) => {
    return (
        <Text className={cn("text-base font-semibold text-text-primary", className)}>
            {children}
        </Text>
    );
};

// INDICATOR (Internal): The visual radio button circle.
const RadioIndicator: React.FC<{ isSelected: boolean }> = ({ isSelected }) => {
    const scale = useSharedValue(0);

    useEffect(() => {
        scale.value = withSpring(isSelected ? 1 : 0, { damping: 15, stiffness: 400 });
    }, [isSelected]);

    const innerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <View className={cn(
            "h-6 w-6 rounded-full border-2 items-center justify-center",
            isSelected ? "border-text-primary" : "border-text-secondary/50"
        )}>
            <Animated.View
                style={innerStyle}
                className="h-3.5 w-3.5 rounded-full bg-text-primary"
            />
        </View>
    );
};


// ITEM: The main pressable row for each option.
interface RadioGroupItemProps {
    children: React.ReactNode;
    value: string;
    className?: string;
}
const Item: React.FC<RadioGroupItemProps> = ({ children, value, className }) => {
    const { selectedValue, setSelectedValue } = useRadioGroupContext();
    const isSelected = selectedValue === value;
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => { scale.value = withSpring(0.98); };
    const handlePressOut = () => { scale.value = withSpring(1); };

    return (
        <AnimatedPressable
            style={animatedStyle}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => setSelectedValue(value)}
            className={cn(
                "w-full flex-row items-center p-4 rounded-2xl border mb-3",
                isSelected
                    ? "bg-background-blue-light border-accent-primary" // Selected state from design
                    : "bg-background-primary border-border-primary",  // Unselected state
                className
            )}
        >
            <RadioIndicator isSelected={isSelected} />
            <View className="flex-1 flex-row justify-between items-center ml-4">
                {children}
            </View>
        </AnimatedPressable>
    );
};

// ROOT: The main container that manages the state.
interface RadioGroupRootProps {
    children: React.ReactNode;
    className?: string;
    value?: string | null;
    onValueChange?: (value: string) => void;
    defaultValue?: string;
}
const Root: React.FC<RadioGroupRootProps> = ({
    children,
    className,
    value,
    onValueChange,
    defaultValue,
}) => {
    const [internalValue, setInternalValue] = useState<string | null>(defaultValue || null);
    const selectedValue = value !== undefined ? value : internalValue;
    const setSelectedValue = onValueChange || setInternalValue;


    const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
    const [selectedImageInfo, setSelectedImageInfo] = useState<{ source: ImageSourcePropType; title: string } | null>(null);

    const openImagePreview = (info: { source: ImageSourcePropType; title: string }) => {
        setSelectedImageInfo(info);
        setIsImagePreviewOpen(true);
    };

    return (
        <RadioGroupContext.Provider value={{ selectedValue, setSelectedValue, openImagePreview }}>
            <View className={cn("w-full", className)}>{children}</View>

            {/* --- The Dialog is now styled to match the new design --- */}
            <Dialog.Root open={isImagePreviewOpen} onOpenChange={setIsImagePreviewOpen} enableAndroidBlur={true}>
                <Dialog.Portal>
                    {/* We use showCloseButton={false} because we will place our own 'X' in the header */}
                    <Dialog.Content showCloseButton={false} className="p-0">
                        <Dialog.Header className="flex-row items-center justify-between">
                            <Dialog.Title>{selectedImageInfo?.title}</Dialog.Title>
                            {/* Use the flexible version of Dialog.Close to get the 'onPress' functionality */}
                            <Dialog.Close>
                                <Pressable className="p-1" hitSlop={10}>
                                    <X size={20} className="text-text-secondary" />
                                </Pressable>
                            </Dialog.Close>
                        </Dialog.Header>

                        {/* Container for the image with padding */}
                        <View className="p-6 pt-4">
                            {selectedImageInfo && (
                                <Image
                                    source={selectedImageInfo.source}
                                    className="w-full h-40 rounded-lg" // Adjust height as needed
                                    resizeMode="contain"
                                />
                            )}
                        </View>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </RadioGroupContext.Provider>
    );
};

// --- 3. EXPORT AS COMPOUND COMPONENT ---
export const RadioGroup = {
    Root,
    Item,
    Label,
    Image: ImageComponent,
};