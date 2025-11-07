// components/ui/Label.tsx

import React from "react";
import { Text } from "react-native";
import { cn } from "@/lib/utils"; // Assuming you have this utility

interface LabelProps {
  htmlFor?: string; // for compatibility with web-like API
  children: React.ReactNode;
  className?: string;
  required?: boolean; // The new prop
}

export const Label: React.FC<LabelProps> = ({
  htmlFor,
  children,
  className,
  required = false, // Default to false
}) => {
  return (
    // The outer Text component acts as a container for both the label and the asterisk.
    <Text
      nativeID={htmlFor}
      className={cn(
        "text-base font-medium text-text-primary", // Base styles
        className
      )}
    >
      {children}
      {/* 
        Conditionally render a nested Text component for the asterisk.
        This allows the asterisk to have its own color while staying in-line.
      */}
      {required && (
        <Text className="text-error-primary"> *</Text>
      )}
    </Text>
  );
};