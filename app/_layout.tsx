import "react-native-gesture-handler";
import 'react-native-reanimated'
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";
import {
  OpenSans_400Regular,
  OpenSans_600SemiBold,
  OpenSans_700Bold,
  useFonts,
} from "@expo-google-fonts/open-sans";
import { useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import { useNetworkStore } from "@/store/network";
import { Pressable, Text, View } from "react-native";
import { useTruckSchemaStore } from "@/store/truck-certification/useTruckSchemaStore";

SplashScreen.preventAutoHideAsync();
const isLoggedIn = true;

export default function RootLayout() {
  const setOnline = useNetworkStore((state) => state.setOnline);
  const router = useRouter();
  const { schema, loading, syncSchema } = useTruckSchemaStore();

  // console.log("🚀 remoteData", schema, loading);

  useEffect(() => {
    syncSchema(); // run only once
  }, []);

  const [loaded, error] = useFonts({
    OpenSans_400Regular,
    OpenSans_600SemiBold,
    OpenSans_700Bold,
  });

  useEffect(() => {
    if (loaded || error || loading) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOnline(!!state.isConnected);
    });
    return () => unsubscribe();
  }, [setOnline]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack>
          {/* These screens are only available when *not* logged in */}
          <Stack.Protected guard={!isLoggedIn}>
            <Stack.Screen name="(public)" options={{ headerShown: false }} />
          </Stack.Protected>

          {/* These screens are only available when logged in */}
          <Stack.Protected guard={isLoggedIn}>
            <Stack.Screen name="(private)" options={{ headerShown: false }} />
          </Stack.Protected>

          <Stack.Screen name="components" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="light" />
        {/* Floating button visible only in DEV mode */}
        {__DEV__ && (
          <View
            style={{
              position: "absolute",
              bottom: 30,
              right: 30,
              backgroundColor: "#000",
              width: 48,
              height: 48,
              borderRadius: 24,
              alignItems: "center",
              justifyContent: "center",
              elevation: 5,
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowRadius: 3,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            <Pressable
              android_ripple={{ color: "#ffffff40", borderless: true }}
              onPress={() => router.push("/components")}
              style={{
                width: "100%",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ color: "white", fontWeight: "bold", fontSize: 18 }}
              >
                dev
              </Text>
            </Pressable>
          </View>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
