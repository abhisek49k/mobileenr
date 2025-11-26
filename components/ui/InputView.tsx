// components/ui/InputView.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ImageSourcePropType,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { cn } from "@/lib/utils";
import { X, XCircle, PlusCircle } from "lucide-react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons'; // 1. Import MaterialIcons

// Import our reusable components
import { Dialog } from "./Dialog";
import { TextField } from "./TextField";
import { Button } from "./Button";
import { useThemeColors } from "@/hooks/useThemeColors";

interface InputViewProps {
  value: string;
  onSave: (newValue: string) => void;
  placeholder: string;
  dialogTitle: string;
  dialogImage: ImageSourcePropType;
  dialogInputPlaceholder: string;
  disabled?: boolean;
  className?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const InputView: React.FC<InputViewProps> = ({
  value,
  onSave,
  placeholder,
  dialogTitle,
  dialogImage,
  dialogInputPlaceholder,
  disabled = false,
  className,
}) => {
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(value);
  const colorTheme = useThemeColors();

  useEffect(() => {
    if (isDialogOpen) {
      setInternalValue(value);
    }
  }, [isDialogOpen, value]);

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => { scale.value = withSpring(0.99); };
  const handlePressOut = () => { scale.value = withSpring(1); };
  const handleSave = () => {
    onSave(internalValue);
    setIsDialogOpen(false);
  };
  const handleCancel = () => { setIsDialogOpen(false); };

  // --- 2. Create a helper boolean for clean conditional logic ---
  const hasValue = value && value.length > 0;

  return (
    <View className={cn("w-full", className)}>

      <AnimatedPressable
        onPress={() => setIsDialogOpen(true)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={animatedStyle}
        android_ripple={{
          color: "rgba(0,0,0,0.1)",
          borderless: false,
          foreground: Platform.OS === "android",
        }}
        className="rounded-xl overflow-hidden"
      >
        <View
          className={cn(
            "h-14 w-full flex-row items-center justify-between px-4 rounded-xl border",
            disabled
              ? "bg-background-secondary opacity-70"
              : "bg-background-primary shadow-sm border-border-primary"
          )}
        >
          {/* --- 3. Conditional Text Styling --- */}
          {hasValue ? (
            <Text className="text-base text-text-primary">
              <Text className="font-bold">{value}</Text>
              <Text> Inches</Text>
            </Text>
          ) : (
            <Text className="text-base text-text-primary/60">{placeholder}</Text>
          )}

          {/* --- 4. Conditional Icon --- */}
          {hasValue ? (
            <MaterialIcons name="check-circle" size={22} color={colorTheme["successPrimary"]} />
          ) : (
            // Using MaterialIcons 'visibility' for consistency, as it looks similar to Lucide's 'Eye'
            <MaterialIcons name="visibility" size={22} className="text-text-secondary/60" />
          )}
        </View>
      </AnimatedPressable>

      {/* --- Dialog (The rest of the component remains exactly as you provided) --- */}
      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        enableAndroidBlur
      >
        <Dialog.Portal>
          <Dialog.Content className="p-0">
            <Dialog.Header className="flex-row items-center justify-between pl-6">
              <Dialog.Title>{dialogTitle}</Dialog.Title>
            </Dialog.Header>

            <View className="p-6 pt-4">
              <Image
                source={{ uri: dialogImage }}
                className="w-full h-32 rounded-lg mb-4"
                resizeMode="contain"
              />
              <TextField.Root
                placeholder={dialogInputPlaceholder}
                keyboardType="numeric"
                value={internalValue}
                onChangeText={setInternalValue}
                autoFocus={true}
              />
            </View>

            <Dialog.Footer className="flex-row gap-2 items-center">
              <Button
                className="flex-1 border border-accent-primary bg-background-primary py-4 rounded-2xl gap-2"
                onPress={handleCancel}
              >
                <Text className="text-accent-primary font-base font-open-sans-bold">
                  Cancel
                </Text>
                <XCircle size={20} color={colorTheme["accentPrimary"]} />
              </Button>
              <Button
                className="flex-1 bg-accent-primary flex-1 py-4 rounded-2xl gap-2"
                onPress={handleSave}
              >
                <Text className="text-white font-base font-open-sans-bold">
                  Next
                </Text>
                <PlusCircle size={20} color={colorTheme["backgroundPrimary"]} />
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </View>
  );
};