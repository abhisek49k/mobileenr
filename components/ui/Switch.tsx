// components/Switch.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useThemeColors";

// Context setup
interface SwitchContextType {
  isChecked: boolean;
  isDisabled: boolean;
}
const SwitchContext = createContext<SwitchContextType | null>(null);
const useSwitchContext = () => {
  const context = useContext(SwitchContext);
  if (!context) throw new Error("Switch.Thumb must be used within a Switch.Root");
  return context;
};

// --- THUMB ---
interface SwitchThumbProps {
  className?: string;
}
const Thumb: React.FC<SwitchThumbProps> = ({ className }) => {
  const { isChecked } = useSwitchContext();
  const colorTheme = useThemeColors();
  const progress = useSharedValue(isChecked ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isChecked ? 1 : 0, { duration: 220 });
  }, [isChecked]);

  const animatedStyle = useAnimatedStyle(() => {
    /**
     * Layout logic:
     * Track width: 56px (w-14)
     * Padding: 4px each side (p-1)
     * Thumb width: 24px (w-6)
     * Total available travel: 56 - 24 - 8 = 24px
     * Reduce slightly (~4px) to maintain equal visual gap on both sides.
     */
    const translateX = progress.value * 20; // ✅ perfect even gap both sides

    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [colorTheme['accentPrimary'], colorTheme["backgroundPrimary"]]
    );

    return {
      transform: [{ translateX }],
      backgroundColor,
    };
  });

  return (
    <Animated.View
      style={animatedStyle}
      className={cn("h-6 w-6 rounded-full shadow-sm", className)}
    />
  );
};

// --- ROOT ---
interface SwitchRootProps {
  children: React.ReactNode;
  className?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  defaultChecked?: boolean;
  disabled?: boolean;
}
const Root: React.FC<SwitchRootProps> = ({
  children,
  className,
  checked,
  onCheckedChange,
  defaultChecked = false,
  disabled = false,
}) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isChecked = checked !== undefined ? checked : internalChecked;
  const handleCheckedChange = onCheckedChange || setInternalChecked;
  const progress = useSharedValue(isChecked ? 1 : 0);
  const colorTheme = useThemeColors();

  useEffect(() => {
    progress.value = withTiming(isChecked ? 1 : 0, { duration: 220 });
  }, [isChecked]);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [colorTheme["backgroundPrimary"], colorTheme["accentPrimary"]]
    );
    const borderColor = interpolateColor(
      progress.value,
      [0, 1],
      [colorTheme["accentPrimary"], colorTheme["accentPrimary"]]
    );
    return {
      backgroundColor,
      borderColor,
    };
  });

  return (
    <SwitchContext.Provider value={{ isChecked, isDisabled: disabled }}>
      <Pressable
        onPress={() => handleCheckedChange(!isChecked)}
        disabled={disabled}
      >
        <Animated.View
          style={animatedStyle}
          className={cn(
            "h-8 w-14 justify-center rounded-full border p-1",
            disabled && "opacity-50",
            className
          )}
        >
          {children}
        </Animated.View>
      </Pressable>
    </SwitchContext.Provider>
  );
};

// --- EXPORT ---
export const Switch = { Root, Thumb };
