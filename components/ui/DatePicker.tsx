// components/ui/DatePicker.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';
import { format } from 'date-fns';
import { CalendarDays } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { useThemeColors } from '@/hooks/useThemeColors';

interface DatePickerProps {
  /** The currently selected date. */
  value: Date | null;
  /** Callback when a date is selected. */
  onValueChange: (date: Date) => void;
  /** The minimum selectable date. */
  minimumDate?: Date;
  /** The maximum selectable date. */
  maximumDate?: Date;
  /** If true, the picker is disabled. */
  disabled?: boolean;
  /** Optional className for the container. */
  className?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onValueChange,
  minimumDate,
  maximumDate,
  disabled = false,
  className,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const focusProgress = useSharedValue(0);
  const colorTheme = useThemeColors();

  // Animate the border color when the picker is opened, mimicking a focus state.
  useEffect(() => {
    focusProgress.value = withTiming(showPicker ? 1 : 0, { duration: 200 });
  }, [showPicker]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusProgress.value,
      [0, 1],
      [colorTheme['borderSecondary'], colorTheme['accentPrimary']] // border-primary to accent-primary
    );
    return { borderColor };
  });

  const handlePress = () => {
    if (!disabled) {
      setShowPicker(true);
    }
  };

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // On Android, the picker must be dismissed manually.
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    // If a date was selected (i.e., not cancelled), call the onValueChange callback.
    if (selectedDate) {
      onValueChange(selectedDate);
    }
  };

  const displayText = value ? format(value, 'MM/dd/yyyy') : 'MM/DD/YYYY';

  return (
    <>
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        android_ripple={{
          color: "rgba(0,0,0,0.1)",
          borderless: false,
          foreground: true,
        }}
        className={cn("rounded-xl overflow-hidden", className)}
      >
        <Animated.View
          style={animatedContainerStyle}
          className={cn(
            "h-14 w-full flex-row items-center justify-between px-4 rounded-xl border",
            disabled 
              ? "bg-background-secondary opacity-70" 
              : "bg-background-primary shadow-sm",
          )}
        >
          <Text
            className={cn(
              "text-base",
              value ? "text-text-primary" : "text-icon-primary"
            )}
          >
            {displayText}
          </Text>
          <CalendarDays size={20} className="text-text-secondary/60" />
        </Animated.View>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={value || new Date()} // Default to today if no value is set
          mode="date"
          display="default"
          design='default'
          onChange={onChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          // On iOS, the picker needs to be manually dismissed if the user taps away.
          // This is a common pattern.
          {...(Platform.OS === 'ios' && { onTouchCancel: () => setShowPicker(false) })}
        />
      )}
    </>
  );
};