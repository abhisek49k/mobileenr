// components/Toggle.tsx
import React, { useState, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

interface ToggleOption {
  label: string;
  value: string | number;
}

interface ToggleProps {
  options: ToggleOption[];
  value?: string | number;
  defaultValue?: string | number;
  onValueChange?: (value: string | number) => void;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  options,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue ?? options[0].value);
  const selectedValue = value !== undefined ? value : internalValue;
  const selectedIndex = options.findIndex((o) => o.value === selectedValue);

  const progress = useSharedValue(selectedIndex);

  useEffect(() => {
    progress.value = withTiming(selectedIndex, { duration: 250 });
  }, [selectedIndex]);

  const handleChange = (val: string | number) => {
    if (disabled) return;
    if (onValueChange) onValueChange(val);
    else setInternalValue(val);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: `${progress.value * 100}%`,
      },
    ],
  }), []);

  return (
    <View
      className={`relative flex-row border border-border-secondary rounded-[14px] bg-background-primary p-[4px] ${
        disabled ? "opacity-50" : ""
      }`}
    >
      {/* Animated Blue Background */}
      <Animated.View
        style={animatedStyle}
        className="absolute top-[4px] bottom-[4px] left-[4px] w-1/2 bg-accent-primary rounded-xl"
      />

      {/* Options */}
      {options.map((opt) => {
        const isSelected = selectedValue === opt.value;
        return (
          <Pressable
            key={opt.value}
            className="flex-1 h-12 items-center justify-center"
            onPress={() => handleChange(opt.value)}
          >
            <Text
              className={`text-base font-semibold ${
                isSelected ? "text-text-icon" : "text-accent-primary"
              }`}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
