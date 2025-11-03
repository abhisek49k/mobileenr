import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import './global.css';
import { OpenSans_400Regular, OpenSans_600SemiBold, OpenSans_700Bold, useFonts } from '@expo-google-fonts/open-sans'
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();
const isLoggedIn = false;

export default function RootLayout() {

  const [loaded, error] = useFonts({
    OpenSans_400Regular,
    OpenSans_600SemiBold,
    OpenSans_700Bold
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }
  
  return (
    <>
      <Stack>
        { /* These screens are only available when *not* logged in */ }
        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen 
            name="(public)"  
            options={{ headerShown: false }}
          />
        </Stack.Protected>

        { /* These screens are only available when logged in */ }
        <Stack.Protected guard={isLoggedIn}>
          <Stack.Screen 
            name="(private)" 
            options={{ headerShown: false }} 
          />
        </Stack.Protected>

        <Stack.Screen name="components" options={{ headerShown: false }}  />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
