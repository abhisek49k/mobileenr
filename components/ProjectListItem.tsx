import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { ChevronRight } from 'lucide-react-native';
import { cn } from '@/lib/utils'; // Assuming you have this utility

// Define the shape of our project data for type safety
export interface ContractorOption {
  label: string;
  value: string;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  primeContractors: ContractorOption[];
  subContractors: ContractorOption[];
}

interface ProjectListItemProps {
  project: Project;
  onPress: () => void;
  className?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ProjectListItem: React.FC<ProjectListItemProps> = ({ project, onPress, className }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      className={cn(
        // Layout and background
        "w-full flex-row items-center justify-between p-4 mb-4",
        "bg-background-primary rounded-2xl",
        // Border and Shadow to match the design
        "border border-border-primary/50 shadow-sm",
        className
      )}
    >
      <View className="flex-1 mr-4">
        {/* Title */}
        <Text className="text-lg font-semibold text-accent-primary leading-tight font-open-sans-bold">
          {project.name}
        </Text>
        {/* Subtitle */}
        <Text className="text-base text-text-primary mt-6 font-open-sans">
          {project.location}
        </Text>
      </View>
      {/* Chevron Icon */}
      <ChevronRight size={22} className="text-text-secondary/60" />
    </AnimatedPressable>
  );
};