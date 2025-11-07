// components/ui/ScreenIndicator.tsx

import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { cn } from '@/lib/utils';

interface ScreenIndicatorProps {
  /** The total number of steps in the flow. */
  maxSteps: number;
  /** The current active step (1-based index). */
  currentStep: number;
  /** Optional className for the container. */
  className?: string;
  /** Optional color for the filled part of the bar (e.g., '#007AFF'). Overrides theme color. */
  fillColor?: string;
  /** Optional color for the empty part of the bar (e.g., '#E5E7EB'). Overrides theme color. */
  barColor?: string;
}

export const ScreenIndicator: React.FC<ScreenIndicatorProps> = ({
  maxSteps,
  currentStep,
  className,
  fillColor,
  barColor,
}) => {
  const progress = useSharedValue(0);

  // Animate the progress whenever the currentStep changes.
  useEffect(() => {
    // Ensure currentStep is within bounds [1, maxSteps]
    const sanitizedCurrentStep = Math.max(1, Math.min(currentStep, maxSteps));
    const newProgress = (sanitizedCurrentStep / maxSteps) * 100;
    progress.value = withTiming(newProgress, { duration: 350 });
  }, [currentStep, maxSteps, progress]);

  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value}%`,
    };
  });

  // Create dynamic style objects for the optional color props
  const barStyle = barColor ? { backgroundColor: barColor } : {};
  const fillStyle = fillColor ? { backgroundColor: fillColor } : {};

  return (
    <View className={cn("w-full px-6 py-4", className)}>
      {/* Progress Bar Track */}
      <View
        style={barStyle}
        // Default color is applied via className, can be overridden by barColor prop
        className="h-2 w-full bg-border-primary/50 rounded-full overflow-hidden"
      >
        {/* Animated Progress Bar Fill */}
        <Animated.View
          // Combine animated styles with dynamic prop styles
          style={[animatedProgressStyle, fillStyle]}
          // Default color is applied via className, can be overridden by fillColor prop
          className="h-full bg-accent-primary rounded-full"
        />
      </View>
    </View>
  );
};