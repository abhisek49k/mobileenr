// components/TextField.tsx

import React, { createContext, useRef, useState, forwardRef } from "react";
import {
  View,
  TextInput as RNTextInput,
  Pressable,
  TextInputProps,
  GestureResponderEvent,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useThemeColors";

// --- CONTEXT ---
interface TextFieldContextType {
  isDisabled: boolean;
}
const TextFieldContext = createContext<TextFieldContextType | null>(null);

// --- ICON SUBCOMPONENTS ---
interface IconProps {
  children: React.ReactNode;
  className?: string;
}

const LeftIcon: React.FC<IconProps> = ({ children, className }) => (
  // Add pointerEvents="box-none" to allow touches to pass through to the TextInput
  <View
    className={cn("absolute left-0 top-0 bottom-0 justify-center pl-3", className)}
    pointerEvents="box-none" 
  >
    {children}
  </View>
);
LeftIcon.displayName = "LeftIcon";

const RightIcon: React.FC<IconProps> = ({ children, className }) => (
  // Add pointerEvents="box-none" here as well
  <View
    className={cn("absolute right-0 top-0 bottom-0 justify-center pr-3", className)}
    pointerEvents="box-none"
  >
    {children}
  </View>
);
RightIcon.displayName = "RightIcon";

// --- ROOT COMPONENT ---
type TextFieldRootProps = Omit<TextInputProps, "editable"> & {
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onPress?: (e?: GestureResponderEvent) => void;
  rippleColor?: string;
  type?: "text" | "email" | "password" | "number";
};

const Root = forwardRef<RNTextInput, TextFieldRootProps>(
  (
    {
      children,
      className,
      disabled = false,
      onPress,
      rippleColor,
      type = "text",
      value,
      ...props
    },
    ref
  ) => {
    const colorTheme = useThemeColors();
    const [isFocused, setIsFocused] = useState(false);
    const internalRef = useRef<RNTextInput>(null);
    const focusProgress = useSharedValue(0);
    React.useImperativeHandle(ref, () => internalRef.current as RNTextInput);
    const handleFocus = () => {
      setIsFocused(true);
      focusProgress.value = withTiming(1, { duration: 200 });
    };
    const handleBlur = () => {
      setIsFocused(false);
      focusProgress.value = withTiming(0, { duration: 200 });
    };
    const animatedContainerStyle = useAnimatedStyle(() => {
      const borderColor = interpolateColor(
        focusProgress.value, [0, 1], [colorTheme['borderSecondary'], colorTheme['accentPrimary']]
      );
      return { borderColor };
    });
    let hasLeftIcon = false, hasRightIcon = false;
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        if ((child.type as any).displayName === "LeftIcon") hasLeftIcon = true;
        if ((child.type as any).displayName === "RightIcon") hasRightIcon = true;
      }
    });
    const keyboardType = type === "email" ? "email-address" : type === "number" ? "numeric" : "default";

    return (
      <TextFieldContext.Provider value={{ isDisabled: disabled }}>
        {/*
          THE KEY FIX: Add pointerEvents="box-none" to the root Pressable.
          This makes the Pressable's container non-interactive, but crucially,
          allows its children (like the RightIcon's Pressable) to receive touches.
        */}
        <Pressable
          onPress={(e) => {
            internalRef.current?.focus();
            onPress?.(e);
          }}
          android_ripple={{ color: rippleColor || "rgba(0,0,0,0.1)" }}
          pointerEvents="box-none" 
        >
          <Animated.View
            style={animatedContainerStyle}
            className={cn(
              "relative h-14 w-full justify-center rounded-xl border",
              disabled ? "bg-[#E6E6E6]" : "bg-background-primary shadow-sm",
              props.multiline && "h-auto min-h-[56px]",
              className
            )}
            // Add pointerEvents here to ensure the text input below can be focused
            pointerEvents="box-none"
          >
            {children}
            <RNTextInput
              ref={internalRef}
              placeholderTextColor="rgb(156 163 175)"
              onFocus={handleFocus}
              onBlur={handleBlur}
              editable={!disabled}
              value={value}
              keyboardType={keyboardType}
              {...props}
              className={cn(
                "h-full px-4 text-base text-text-primary",
                hasLeftIcon && "pl-11",
                hasRightIcon && "pr-11",
                props.multiline && "py-3 h-24",
                hasLeftIcon || hasRightIcon ? "w-80" : "w-full",
              )}
            />
          </Animated.View>
        </Pressable>
      </TextFieldContext.Provider>
    );
  }
);

Root.displayName = "TextFieldRoot";

// --- EXPORT ---
export const TextField = {
  Root,
  LeftIcon,
  RightIcon,
};