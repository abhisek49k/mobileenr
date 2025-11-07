import React, { useEffect, useState } from "react";
import { View, Text, ViewStyle } from "react-native";
import { cn } from "@/lib/utils";
import { useNetworkStore } from "@/store/network";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Info, CircleCheck } from "lucide-react-native"; // ✅ added icons

type HeaderProps = {
  headerLeft?: React.ReactNode;
  headerCenter?: React.ReactNode;
  headerRight?: React.ReactNode;
  headerStyle?: ViewStyle;
  className?: string;
};

export const Header: React.FC<HeaderProps> = ({
  headerLeft,
  headerCenter,
  headerRight,
  headerStyle,
  className,
}) => {
  const colorTheme = useThemeColors();
  const isOnline = useNetworkStore((state) => state.isOnline);
  const [prevOnline, setPrevOnline] = useState(isOnline);

  const bannerHeight = useSharedValue(0);
  const bannerText = useSharedValue("");
  const bannerColor = useSharedValue(colorTheme["backgroundIndicator"]);
  const bannerIcon = useSharedValue<"offline" | "online" | "">("");

  const animatedBannerStyle = useAnimatedStyle(() => ({
    height: bannerHeight.value,
    opacity: bannerHeight.value > 0 ? 1 : 0,
    backgroundColor: bannerColor.value,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row", // ✅ icon + text in a row
    gap: 6,
  }));

  useEffect(() => {
    if (prevOnline !== isOnline) {
      if (!isOnline) {
        bannerText.value = "You are offline!";
        bannerColor.value = colorTheme["backgroundIndicator"];
        bannerIcon.value = "offline";
        bannerHeight.value = withTiming(32, { duration: 400 });
      } else if (prevOnline === false && isOnline === true) {
        bannerText.value = "Back to Online";
        bannerColor.value = colorTheme["accentSecondary"];
        bannerIcon.value = "online";
        bannerHeight.value = withTiming(32, { duration: 400 });
        setTimeout(() => {
          bannerHeight.value = withTiming(0, { duration: 400 });
        }, 3000);
      }
      setPrevOnline(isOnline);
    }
  }, [isOnline, prevOnline]);

  return (
    <View style={{ margin: 0, padding: 0 }}>
      <View
        style={headerStyle}
        className={cn(
          "flex-row items-end justify-between h-32 px-4 bg-accent-primary pt-8 items-center",
          className
        )}
      >
        {/* Left */}
        <View className="flex-1 items-start">{headerLeft || ""}</View>

        {/* Center */}
        <View className="items-center">{headerCenter || ""}</View>

        {/* Right */}
        <View className="flex-1 items-end">{headerRight || ""}</View>
      </View>

      {/* Animated Banner */}
      <Animated.View style={[animatedBannerStyle, { marginTop: 0, padding: 0 }]}>
        {bannerIcon.value === "offline" && (
          <Info size={18} color="white" style={{ marginRight: 6 }} />
        )}
        {bannerIcon.value === "online" && (
          <CircleCheck size={18} color="white" style={{ marginRight: 6 }} />
        )}
        <Text className="text-sm font-open-sans text-text-icon">
          {bannerText.value}
        </Text>
      </Animated.View>
    </View>
  );
};

export default Header;
