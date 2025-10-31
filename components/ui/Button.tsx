// components/Button.tsx
import React from "react";
import {
  View,
  Text as RNText,
  Pressable,
  GestureResponderEvent,
  ViewStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { cn } from "@/lib/utils"; // simple className joiner (string helper)

type ButtonProps = {
  asChild?: boolean; // wrap child, but still handle press
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle | ViewStyle[];
  disabled?: boolean;
  loading?: boolean;
  onPress?: (e?: GestureResponderEvent) => void;
  pressedScale?: number;
  unpressedScale?: number;
};

const AnimatedView = Animated.createAnimatedComponent(View);

export const Button: React.FC<ButtonProps> = ({
  asChild = false,
  children,
  className,
  style,
  disabled = false,
  loading = false,
  onPress,
  pressedScale = 0.96,
  unpressedScale = 1,
}) => {
  // Shared value for scale
  const scale = useSharedValue(unpressedScale);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  }, []);

  const handlePressIn = () => {
    // animate to pressed scale
    scale.value = withSpring(pressedScale, {
      damping: 14,
      stiffness: 180,
    });
  };

  const handlePressOut = () => {
    // animate back
    scale.value = withSpring(unpressedScale, {
      damping: 14,
      stiffness: 180,
    });
  };

  const handlePress = (e?: GestureResponderEvent) => {
    if (disabled || loading) return;
    if (onPress) onPress(e as any);
  };

  const baseClasses = cn(
    "flex-row items-center justify-center rounded-2xl px-4 py-3",
    "bg-accent-primary",
    disabled && "opacity-50",
    className
  );

  // We wrap the pressable behavior around an AnimatedView that uses nativewind's className
  // Pressable -> AnimatedView -> children
  // asChild simply means we render children directly inside, but still handle Pressable events

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      style={style as any}
    >
      <AnimatedView style={[animatedStyle]} className={baseClasses}>
        {loading ? (
          // simple loading indicator using text or you can replace with ActivityIndicator
          <RNText className="text-white">Loading...</RNText>
        ) : (
          // Render children unchanged — works with Text, Icon + Text, Link (asChild)
          children
        )}
      </AnimatedView>
    </Pressable>
  );
};

export default Button;
