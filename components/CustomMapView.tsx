import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
// Import the File class from the next API
import { File } from 'expo-file-system/next'; 

type MapSource = 'street-view' | 'satellite-view';

interface CustomMapViewProps {
  mapCenterPosition: { lat: number; lng: number };
  currentLocationMarker?: boolean;
  zoom?: number;
  zoomControl?: boolean;
  source: MapSource;
  onMapReady?: () => void;
}

export const CustomMapView: React.FC<CustomMapViewProps> = ({
  mapCenterPosition,
  currentLocationMarker = true,
  zoom = 15,
  source,
  onMapReady
}) => {
  const webViewRef = useRef<WebView>(null);
  const [htmlSource, setHtmlSource] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Load HTML File using expo-file-system/next
  useEffect(() => {
    const loadHtml = async () => {
      try {
        // Point to your local HTML file
        // Ensure assets/index.html exists
        const htmlAsset = Asset.fromModule(require('../assets/map/index.html'));
        
        // Ensure asset is downloaded/available in local cache
        await htmlAsset.downloadAsync();

        if (htmlAsset.localUri) {
          // --- NEW API IMPLEMENTATION ---
          // Create a File object from the local URI
          const file = new File(htmlAsset.localUri);
          
          // Read the file contents as text
          const htmlContent = await file.text();
          
          setHtmlSource(htmlContent);
        }
      } catch (error) {
        console.error("Failed to load map HTML using File System Next:", error);
      }
    };

    loadHtml();
  }, []);

  // 2. Bridge: Send Props to HTML
  useEffect(() => {
    if (!isMapReady || !webViewRef.current) return;

    const payload = {
      lat: mapCenterPosition.lat,
      lng: mapCenterPosition.lng,
      zoom,
      showMarker: currentLocationMarker,
      source
    };

    const jsCode = `
      window.handleRNMessage('${JSON.stringify(payload)}');
      true;
    `;
    
    webViewRef.current.injectJavaScript(jsCode);
  }, [mapCenterPosition, zoom, currentLocationMarker, source, isMapReady]);

  // 3. Bridge: Handle Messages from HTML
  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MAP_READY') {
        setIsMapReady(true);
        if (onMapReady) onMapReady();
      }
    } catch (e) {
      // Ignore non-JSON messages
    }
  };

  if (!htmlSource) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View className="flex-1 w-full relative">
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlSource, baseUrl: '' }}
        onMessage={onMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        className="flex-1"
        containerStyle={{ flex: 1 }}
        scrollEnabled={false}
      />

      {!isMapReady && (
        <View className="absolute inset-0 bg-white justify-center items-center z-10">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      )}
    </View>
  );
};