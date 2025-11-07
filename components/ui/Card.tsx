// components/ui/Card.tsx

import React from 'react';
import { View, Pressable, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { cn } from '@/lib/utils'; // Assuming you have this utility

// --- 1. COMPOUND COMPONENTS ---

// CONTENT: A flexible container for the card's content.
// By default, it centers its children, matching the common use-case.
interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

const Content: React.FC<CardContentProps> = ({ children, className }) => {
  return (
    <View className={cn("flex-1 items-center justify-center rounded-2xl", className)}>
      {children}
    </View>
  );
};

// ROOT: The main pressable container with styling and animation.
interface CardRootProps {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Root: React.FC<CardRootProps> = ({ children, className, onPress }) => {
  const scale = useSharedValue(1);

  // A subtle, springy animation for a premium feel
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <View className=' rounded-2xl overflow-hidden'>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        android_ripple={{
          color: 'rgba(30,106,180,0.25)',
          borderless: false, // ✅ must be false to respect rounded corners
          foreground: true, // ✅ critical: foreground ripples ignore overflow
        }}
        style={animatedStyle}
        className={cn(
          // Default styling to match the design
          "p-6 bg-background-primary rounded-2xl border border-border-primary/50 shadow-md",
          // The className prop is applied last for overrides and layout
          className
        )}
      >
        {children}
      </AnimatedPressable>
    </View>
  );
};

// --- 2. EXPORT AS COMPOUND COMPONENT ---
export const Card = {
  Root,
  Content,
};