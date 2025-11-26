// components/Dialog.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  View,
  Text,
  Pressable,
  Platform,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  useWindowDimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { X } from "lucide-react-native";
import { useThemeColors } from "@/hooks/useThemeColors";

// ----------------------------------
// CONTEXT
// ----------------------------------

interface DialogContextType {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  enableAndroidBlur: boolean;
}

const DialogContext = createContext<DialogContextType | null>(null);

const useDialogContext = () => {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("Dialog components must be inside Dialog.Root");
  return ctx;
};

// ----------------------------------
// ROOT
// ----------------------------------

interface DialogRootProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  enableAndroidBlur?: boolean;
}

const Root: React.FC<DialogRootProps> = ({
  children,
  open,
  onOpenChange,
  enableAndroidBlur = false,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const handleOpenChange = useCallback(
    (val: boolean) => (onOpenChange ? onOpenChange(val) : setInternalOpen(val)),
    [onOpenChange]
  );

  return (
    <DialogContext.Provider
      value={{ isOpen, onOpenChange: handleOpenChange, enableAndroidBlur }}
    >
      {children}
    </DialogContext.Provider>
  );
};

// ----------------------------------
// TRIGGER
// ----------------------------------

const Trigger: React.FC<{
  children: React.ReactElement<{ onPress?: () => void }>;
}> = ({ children }) => {
  const { onOpenChange } = useDialogContext();
  return React.cloneElement(children, {
    onPress: () => onOpenChange(true),
  });
};

// ----------------------------------
// PORTAL (Modal + Blur + KeyboardAvoid)
// ----------------------------------

const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOpen, onOpenChange, enableAndroidBlur } = useDialogContext();
  const progress = useSharedValue(0);
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    progress.value = withTiming(isOpen ? 1 : 0, { duration: 250 });
  }, [isOpen]);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.95, 1]) }],
  }));

  return (
    <Modal
      visible={isOpen}
      animationType="none"
      transparent
      onRequestClose={() => onOpenChange(false)}
      statusBarTranslucent
    >
      {/* BACKDROP */}
      <Pressable
        style={[StyleSheet.absoluteFill, { width, height }]}
        onPress={() => onOpenChange(false)}
      >
        <Animated.View
          style={[StyleSheet.absoluteFill, backdropAnimatedStyle]}
        >
          {Platform.OS === "ios" ? (
            <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
          ) : enableAndroidBlur ? (
            <View style={StyleSheet.absoluteFill}>
              <BlurView
                intensity={15}
                tint="dark"
                experimentalBlurMethod="dimezisBlurView"
                style={StyleSheet.absoluteFill}
              />
            </View>
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: "rgba(0,0,0,0.5)" },
              ]}
            />
          )}
        </Animated.View>
      </Pressable>

      {/* CONTENT WITH KEYBOARD AVOID */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <View
          pointerEvents="box-none"
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Animated.View
            style={[contentAnimatedStyle, { width: "90%", maxWidth: 400 }]}
          >
            {children}
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ----------------------------------
// SUBCOMPONENTS
// ----------------------------------

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

const Content: React.FC<DialogContentProps> = ({
  children,
  className,
  showCloseButton = true,
}) => (
  <View
    className={`bg-background-primary rounded-xl shadow-xl overflow-hidden border border-border-primary ${className}`}
  >
    {showCloseButton && <Close />}
    {children}
  </View>
);

const Header: React.FC<{ title?: string; children?: React.ReactNode; className?: string }> = ({
  title,
  children,
  className,
}) => (
  <View className={`px-0 py-4 border-b border-border-primary ${className}`}>
    {title ? <Text className="text-xl font-bold text-text-secondary">{title}</Text> : children}
  </View>
);

const Footer: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <View className={`p-6 pt-4 flex-row justify-end space-x-3 ${className}`}>
    {children}
  </View>
);

const Title: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <Text className={`text-xl font-bold text-text-secondary ${className}`}>
    {children}
  </Text>
);

const Description: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <Text className={`text-base font-open-sans text-text-secondary mt-2 ${className}`}>
    {children}
  </Text>
);

const Close: React.FC<{ children?: React.ReactElement<{ onPress?: () => void }> }> = ({
  children,
}) => {
  const colorTheme = useThemeColors();
  const { onOpenChange } = useDialogContext();

  const defaultButton = (
    <Pressable
      onPress={() => onOpenChange(false)}
      hitSlop={20}
      // Added absolute positioning styles to override the normal flow:
      style={{
        position: 'absolute',
        top: 8, // Adjust as needed to pull button closer to the edge
        right: 8, // Adjust as needed to pull button closer to the edge
        zIndex: 10,
      }}
      className="bg-background-blue-light w-10 h-10 rounded-full overflow-hidden flex-row items-center justify-center"
      android_ripple={{
        color: 'rgba(30,106,180,0.25)',
        borderless: false,
        foreground: true,
      }}
    >
      <X size={20} color={colorTheme["accentPrimary"]} />
    </Pressable>
  );

  return children
    ? React.cloneElement(children, { onPress: () => onOpenChange(false) })
    : defaultButton;
};

// ----------------------------------
// EXPORT
// ----------------------------------

export const Dialog = {
  Root,
  Trigger,
  Portal,
  Content,
  Header,
  Footer,
  Title,
  Description,
  Close,
};
