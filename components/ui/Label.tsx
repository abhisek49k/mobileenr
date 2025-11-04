import React from "react";
import { Text } from "react-native";

interface LabelProps {
  htmlFor?: string; // for compatibility with web-like API
  children: React.ReactNode;
  className?: string;
}

export const Label: React.FC<LabelProps> = ({ htmlFor, children, className }) => {
  return (
    <Text
      nativeID={htmlFor}
      className={`text-base font-medium text-text-primary ${className || ""}`}
    >
      {children}
    </Text>
  );
};
