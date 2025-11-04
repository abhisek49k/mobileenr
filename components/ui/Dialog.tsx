// components/Dialog.tsx

import React, { createContext, useContext, useState, useEffect } from "react";
import { View, Text, Pressable, Platform, StyleSheet } from "react-native";
import { BlurView, ExperimentalBlurMethod } from 'expo-blur'; // Import the type
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
    Extrapolation,
} from "react-native-reanimated";
import { X } from "lucide-react-native";
import { useThemeColors } from "@/hooks/useThemeColors";

// --- 1. CONTEXT SETUP (Updated) ---
interface DialogContextType {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  enableAndroidBlur: boolean; // New property to control Android blur
}
const DialogContext = createContext<DialogContextType | null>(null);
const useDialogContext = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog components must be used within a Dialog.Root");
  }
  return context;
};

// --- 2. DIALOG PIECES ---

// ROOT (Updated)
interface DialogRootProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  enableAndroidBlur?: boolean; // New prop, defaults to false
}
const Root: React.FC<DialogRootProps> = ({ children, open, onOpenChange, enableAndroidBlur = false }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const handleOpenChange = onOpenChange || setInternalOpen;
  return (
    <DialogContext.Provider value={{ isOpen, onOpenChange: handleOpenChange, enableAndroidBlur }}>
      {children}
    </DialogContext.Provider>
  );
};

const Trigger: React.FC<{ children: React.ReactElement<{ onPress?: () => void }> }> = ({ children }) => {
  const { onOpenChange } = useDialogContext();
  return React.cloneElement(children, {
    onPress: () => onOpenChange(true),
  });
};

// DIALOG UI (Updated)
const DialogUI: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Consume the new context value
  const { isOpen, onOpenChange, enableAndroidBlur } = useDialogContext();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(isOpen ? 1 : 0, { duration: 250 });
  }, [isOpen]);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.95, 1]) }],
    opacity: progress.value,
  }));

  return (
    <>
      <Pressable onPress={() => onOpenChange(false)} style={StyleSheet.absoluteFill}>
        <Animated.View style={[StyleSheet.absoluteFill, backdropAnimatedStyle]}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
          ) : enableAndroidBlur ? (
            // ✅ Experimental native blur for Android when enabled
            <BlurView
              experimentalBlurMethod="dimezisBlurView"
              intensity={4} // Android often needs higher intensity
              style={StyleSheet.absoluteFill}
            />
          ) : (
            // ✅ Default fallback dim overlay for Android
            <View className="bg-black/50" style={StyleSheet.absoluteFill} />
          )}
        </Animated.View>
      </Pressable>

      <View className="flex-1 items-center justify-center" pointerEvents="box-none">
        <Animated.View style={contentAnimatedStyle} pointerEvents="auto" className="w-full items-center">
          {children}
        </Animated.View>
      </View>
    </>
  );
};

const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isOpen } = useDialogContext();
    if (!isOpen) return null;
    return (
        <View className="absolute inset-0 z-50">
            <DialogUI>{children}</DialogUI>
        </View>
    );
};

// --- CONTENT & OTHER COMPONENTS (No changes needed) ---
interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}
const Content: React.FC<DialogContentProps> = ({ children, className, showCloseButton = true }) => (
  <View className={`w-[90%] max-w-md bg-background-primary rounded-xl shadow-xl overflow-hidden border border-border-primary ${className}`}>
    {children}
    {showCloseButton && <Close />}
  </View>
);

const Header: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <View className={`p-6 border-b border-border-primary ${className}`}>{children}</View>
);

const Footer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <View className={`p-6 pt-4 flex-row justify-end space-x-3 ${className}`}>{children}</View>
);

const Title: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <Text className={`text-xl font-bold text-text-primary ${className}`}>{children}</Text>
);

const Description: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <Text className={`text-base text-text-secondary mt-2 ${className}`}>{children}</Text>
);

const Close: React.FC<{ children?: React.ReactElement<{ onPress?: () => void }> }> = ({ children }) => {
    const colorTheme = useThemeColors();
    const { onOpenChange } = useDialogContext();
    const defaultButton = (
        <Pressable onPress={() => onOpenChange(false)} className="absolute top-4 right-4 p-2 rounded-full" hitSlop={20}>
            <X size={20} color={colorTheme['accentPrimary']} />
        </Pressable>
    );
    return children ? React.cloneElement(children, { onPress: () => onOpenChange(false) }) : defaultButton;
}

// --- EXPORT ---
export const Dialog = {
  Root, Trigger, Portal, Content, Header, Footer, Title, Description, Close,
};