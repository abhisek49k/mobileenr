// components/Button.tsx
import React from "react";
import {
  Text as RNText,
  Pressable,
  GestureResponderEvent,
  ActivityIndicator,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { cn } from "@/lib/utils"; // Your className joining utility

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  onPress?: (e?: GestureResponderEvent) => void;
  pressedScale?: number;
  unpressedScale?: number;
};

// Combine Pressable and Animated into a single, more efficient component
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  disabled = false,
  loading = false,
  onPress,
  pressedScale = 0.96,
  unpressedScale = 1,
}) => {
  const scale = useSharedValue(unpressedScale);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  }, []);

  const handlePressIn = () => {
    scale.value = withSpring(pressedScale, {
      damping: 14,
      stiffness: 180,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(unpressedScale, {
      damping: 14,
      stiffness: 180,
    });
  };

  const handlePress = (e?: GestureResponderEvent) => {
    if (disabled || loading) return;
    if (onPress) onPress(e);
  };

  // The className prop now applies to the root element,
  // allowing layout classes like w-full, m-4, etc., to work correctly.
  const finalClassName = cn(
    "flex-row items-center justify-center rounded-2xl px-4 py-3",
    "bg-accent-primary",
    (disabled || loading) && "opacity-50",
    className // User-provided classes are applied last to allow overrides
  );

  return (
    <AnimatedPressable
      key={loading.toString()}
      style={animatedStyle}
      className={finalClassName}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
    >
      {loading ? (
        // Use an ActivityIndicator for a more standard loading state
        <ActivityIndicator color="white" />
      ) : (
        // Render children as before
        children
      )}
    </AnimatedPressable>
  );
};

export default Button;