import { View, Text, KeyboardAvoidingView, ScrollView, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight, ChevronLeft, CircleX, RefreshCcw } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Location from "expo-location";

import { useThemeColors } from '@/hooks/useThemeColors';
import { useSiteMonitorSchemaStore } from '@/store/site-monitor/useSiteMonitorSchemaStore';
import { Separator } from '@/components/ui/Separator';
import { SiteMonitorFormRenderer } from '@/components/sitemonitor/FormRenderer';
import { Switch } from '@/components/ui/Switch';
import MenuIcon from '@/components/menuIcon';
import MapViewWrapper from '@/components/MapViewWrapper';
import Header from '@/components/ui/Header';
import Button from '@/components/ui/Button';
import { useSiteMonitorStore } from '@/store/site-monitor/useSiteMonitorStore';

const Createticket = () => {

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorTheme = useThemeColors();

  const { schema, loading } = useSiteMonitorSchemaStore();
  const { setValue } = useSiteMonitorStore();
  const [hasLocationPermission, setHasLocationPermission] = useState<
    boolean | null
  >(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);
  const [mapSource, setMapSource] = useState<"street-view" | "satellite-view">(
    "street-view"
  );


  const refreshLocation = async () => {
    setIsRefreshingLocation(true);
    try {
      await requestLocation();
    } catch (error) {
      console.error("Error refreshing location:", error);
    } finally {
      setIsRefreshingLocation(false);
    }
  };

  const toggleMapSource = () => {
    setMapSource((prev) =>
      prev === "street-view" ? "satellite-view" : "street-view"
    );
  };

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setHasLocationPermission(false);
      return;
    }
    setHasLocationPermission(true);
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    });

    // Reverse Geocode
    const addresses = await Location.reverseGeocodeAsync({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });

    setValue("disposal_site", addresses[0]?.formattedAddress ?? "");

    setUserLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
  };

  useEffect(() => {
    requestLocation();
  }, []);


  return (
    <View
      className="flex-1 bg-background-secondary"
      style={{ paddingBottom: insets.bottom + 10 }}
    >
      <Header
        headerLeft={
          <Button
            onPress={() => router.back()}
            className="w-[40px] h-[40px] flex-row items-center bg-background-primary rounded-full"
          >
            <ChevronLeft size={24} color={colorTheme["textPrimary"]} />
          </Button>
        }
        headerCenter={
          <Text className="text-[22px] font-semibold text-white">
            EZ Debris
          </Text>
        }
        headerRight={<MenuIcon />}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}
          className=""
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1">
            <View className="h-96 w-full overflow-hidden">
              {" "}
              <MapViewWrapper
                hasLocationPermission={hasLocationPermission}
                userLocation={userLocation}
                requestLocation={requestLocation}
                source={mapSource}
              />{" "}
            </View>
            <View className='flex-1 pb-10'>
              <View className='flex-row gap-2 mt-2 p-4'>
                <Button
                  className="w-[50%] border border-border-secondary bg-background-primary px-6 py-4 rounded-2xl gap-2 flex-row items-center justify-between"
                  onPress={toggleMapSource}
                >
                  <Text className="text-accent-primary font-medium">
                    {mapSource === "street-view" ? "Street View" : "Satellite"}
                  </Text>
                  <View pointerEvents="none">
                    <Switch.Root checked={mapSource === "satellite-view"}>
                      <Switch.Thumb />
                    </Switch.Root>
                  </View>
                </Button>
                <Button
                  className="w-[50%] bg-accent-primary px-6 py-4 rounded-2xl gap-2"
                  onPress={refreshLocation}
                  disabled={isRefreshingLocation}
                >
                  <Text className="text-white font-medium">
                    {isRefreshingLocation ? "Refreshing..." : "Refresh"}
                  </Text>
                  <RefreshCcw
                    size={20}
                    color={colorTheme["backgroundPrimary"]}
                  />
                </Button>
              </View>
              <Separator className='h-[2px]' />
              <View className='flex-1 p-8'>
                <SiteMonitorFormRenderer schema={schema} />
              </View>
              <Separator />

              <View className="flex-row items-center justify-center gap-2 mt-8 px-8">
                {/* BACK Button */}
                <Button
                  className="flex-1 border border-accent-primary bg-background-primary py-4 rounded-2xl gap-3"
                  onPress={() => router.dismissTo("/projects")}
                >
                  <Text className="text-accent-primary font-base font-open-sans-bold">
                    Cancel Ticket
                  </Text>
                  <CircleX size={20} color={colorTheme["accentPrimary"]} />
                </Button>

                {/* NEXT Button */}
                <Button
                  className="bg-accent-primary flex-1 py-4 rounded-2xl gap-2"
                  onPress={() => router.push('/sitemonitor/review')}
                >
                  <Text className="text-white font-base font-open-sans-bold">
                    Preview Ticket
                  </Text>
                  <ArrowRight size={20} color={colorTheme["backgroundPrimary"]} />
                </Button>
              </View>
            </View>
          </View>
          <View className="w-full">
            <Text className="text-sm text-text-primary text-center font-open-sans">
              Developed by{" "}
              <Text className="text-accent-primary font-open-sans">
                GISKernel
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

export default Createticket