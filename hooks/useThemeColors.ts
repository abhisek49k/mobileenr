// theme/useThemeColors.ts
import { useColorScheme } from "react-native";
import { lightColors, darkColors } from "../constants/colors";

export function useThemeColors() {
  const scheme = useColorScheme(); // "light" | "dark" | null

  const activeScheme = scheme ?? "light";

  return activeScheme === "dark" ? darkColors : lightColors;
}
