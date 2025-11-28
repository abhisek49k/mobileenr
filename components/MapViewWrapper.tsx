import { Minus, Plus } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import { CustomMapView } from "./CustomMapView";
import Button from "./ui/Button";
import { useState } from "react";

const MapViewWrapper = ({
  hasLocationPermission,
  userLocation,
  requestLocation,
  source,
}: {
  hasLocationPermission: boolean | null;
  userLocation: any;
  requestLocation: () => void;
  source: "street-view" | "satellite-view";
}) => {
  // Manage zoom here to control the map via buttons
  const [currentZoom, setCurrentZoom] = useState(16);

  const handleZoomIn = () => setCurrentZoom((z) => Math.min(z + 1, 20));
  const handleZoomOut = () => setCurrentZoom((z) => Math.max(z - 1, 3));

  if (hasLocationPermission === false) {
    return (
      <View className="flex-1 items-center justify-center bg-background-secondary p-6">
        <Text className="text-white text-center text-lg mb-4">
          Location required
        </Text>
        <Button
          className="bg-accent-primary px-6 py-4 rounded-2xl"
          onPress={requestLocation}
        >
          <Text className="text-white text-base">Enable Location</Text>
        </Button>
      </View>
    );
  }

  if (hasLocationPermission === null || userLocation === null) {
    return (
      <View className="flex-1 items-center justify-center bg-background-secondary">
        <Text className="text-white text-base">Loading Location...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 relative">
      <CustomMapView
        mapCenterPosition={{
          lat: userLocation.latitude,
          lng: userLocation.longitude,
        }}
        currentLocationMarker={true}
        zoom={currentZoom}
        source={source}
      />

      {/* --- Bottom Right Zoom Controls --- */}
      <View className="absolute bottom-4 right-4 flex-col gap-2 z-10">
        <TouchableOpacity
          onPress={handleZoomIn}
          activeOpacity={0.8}
          className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full shadow-lg items-center justify-center border border-gray-200"
        >
          <Plus size={24} color="#1e293b" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleZoomOut}
          activeOpacity={0.8}
          className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full shadow-lg items-center justify-center border border-gray-200"
        >
          <Minus size={24} color="#1e293b" />
        </TouchableOpacity>
      </View>
    </View>
  );
};


export default MapViewWrapper;