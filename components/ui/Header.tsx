import React from "react";
import { View, Text, ViewStyle } from "react-native";
import { cn } from "@/lib/utils";

type HeaderProps = {
  headerLeft?: React.ReactNode;
  headerCenter?: React.ReactNode;
  headerRight?: React.ReactNode;
  headerStyle?: ViewStyle;
  className?: string;
  showBorder?: boolean;
};

export const Header: React.FC<HeaderProps> = ({
  headerLeft,
  headerCenter,
  headerRight,
  headerStyle,
  className,
  showBorder = true,
}) => {
  return (
    <View
      style={headerStyle}
      className={cn(
        "flex-row items-end justify-between h-32 px-4 bg-accent-primary pb-6",
        showBorder && "border-b border-border-primary",
        className
      )}
    >
      {/* Left */}
      <View className="flex-1">{headerLeft || ''}</View>

      {/* Center */}
      <View className="flex-1 items-center">
        {headerCenter || ''}
      </View>

      {/* Right */}
      <View className="flex-1 items-end">{headerRight || ''}</View>
    </View>
  );
};

export default Header;
