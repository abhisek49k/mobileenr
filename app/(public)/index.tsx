import { View, Text, TouchableOpacity, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import Header from "@/components/ui/Header";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/Dropdown";
import Entypo from '@expo/vector-icons/Entypo';


export default function LoginScreen() {
  const route = useRouter();

  return (
    <View className="flex-1">
      <Header
        headerLeft={<Text className="text-lg font-semibold text-white">EZ Debris</Text>}
      />
      <View className="flex-1 justify-center items-center">
        <Text className="text-2xl font-bold text-text-primary">
          Welcome to ENR Project
        </Text>
        <Text className="text-text-secondary mt-2">
          This is the Login Screen (Light Mode Test)
        </Text>

        <Button
          className="w-96 mt-6 bg-accent-primary px-6 py-4 rounded-2xl"
          onPress={() => route.push("/components")}
          asChild
        >
          <Text className="text-white font-medium">Login</Text>
        </Button>
      </View>

    </View>
  );
}
