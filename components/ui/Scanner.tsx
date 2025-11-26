// components/ui/Scanner.tsx

import React, { useState, useEffect, createContext, useContext } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, ScanLine, X } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

// --- 1. CONTEXT SETUP ---
interface ScannerContextType {
  value: string | null;
  scannedData: Record<string, any> | null;
  openScanner: () => void;
}
const ScannerContext = createContext<ScannerContextType | null>(null);
const useScannerContext = () => {
  const context = useContext(ScannerContext);
  if (!context) throw new Error("Scanner components must be used within a Scanner.Root");
  return context;
};

// --- 2. COMPOUND COMPONENTS ---

// CAMERA MODAL (New): The self-contained camera UI.
interface ScannerCameraModalProps {
  isVisible: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

const CameraModal: React.FC<ScannerCameraModalProps> = ({ isVisible, onClose, onScan }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (isVisible && !permission?.granted) {
      requestPermission();
    }
    // Reset the scanned state when the modal opens
    if (isVisible) {
      setScanned(false);
    }
  }, [isVisible, permission]);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    onScan(data);
    onClose();
  };

  return (
    <Modal visible={isVisible} onRequestClose={onClose} animationType="slide">
      {permission?.granted ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        >
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>Center QR Code to Scan</Text>
            <View style={styles.scanBox} />
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
        </CameraView>
      ) : (
        <View style={styles.permissionDeniedView}>
          <Text style={styles.permissionDeniedText}>Camera permission is required.</Text>
          <Pressable onPress={requestPermission} className="bg-accent-primary py-2 px-4 rounded-lg mb-4">
            <Text className="text-white">Grant Permission</Text>
          </Pressable>
          <Pressable onPress={onClose}>
            <Text className="text-text-secondary">Cancel</Text>
          </Pressable>
        </View>
      )}
    </Modal>
  );
};

// TRIGGER: Now uses context to open the modal.
interface ScannerTriggerProps { children: React.ReactNode; }
const Trigger: React.FC<ScannerTriggerProps> = ({ children }) => {
  const { openScanner } = useScannerContext();
  return <Pressable onPress={openScanner}>{children}</Pressable>;
};

// INPUT & BUTTON (No changes)
const Input: React.FC<{ placeholder: string }> = ({ placeholder }) => { const { value } = useScannerContext(); return (<View className="flex-1 h-14 justify-center px-4 rounded-l-xl bg-background-secondary border border-r-0 border-border-primary"><Text className={`text-base ${value ? 'text-text-primary' : 'text-text-secondary/60'}`}>{value || placeholder}</Text></View>); };
const ScanButton: React.FC = () => {
  const colorTheme = useThemeColors();
  return (
    <View className="h-14 w-14 items-center justify-center rounded-r-xl bg-accent-primary"><ScanLine size={24} color={colorTheme['textIcon']} /></View>)
};

// STATUS & DETAILS (No changes)
const Status: React.FC<{ validText?: string, invalidText?: string }> = ({ validText = "Truck Verified", invalidText = "Invalid QR Code" }) => { const { scannedData } = useScannerContext(); if (scannedData === null) return null; const isValid = scannedData && Object.keys(scannedData).length > 0; return (<View className={cn("flex-row items-center self-center my-4 py-2 px-3 rounded-full border", isValid ? "bg-success-primary/10 border-success-primary" : "bg-error-primary/10 border-error-primary")}><Text className={cn("text-sm font-semibold ml-2", isValid ? "text-success-primary" : "text-error-primary")}>{isValid ? validText : invalidText}</Text></View>); };
const Details: React.FC<{ children: React.ReactNode }> = ({ children }) => { const { scannedData } = useScannerContext(); if (!scannedData || Object.keys(scannedData).length === 0) return null; return <View className="w-full">{children}</View>; };
const DetailRow: React.FC<{ label: string, value: any, isColor?: boolean }> = ({ label, value, isColor = false }) => (<View className="flex-row items-center justify-between p-4 rounded-xl border border-border-primary bg-background-primary mb-2"><Text className="text-base text-text-primary">{label}</Text>{isColor ? <View style={{ backgroundColor: value }} className="w-16 h-6 rounded-md border border-border-primary" /> : <Text className="text-base font-semibold text-text-primary">{value || 'N/A'}</Text>}</View>);


// ROOT: Now manages the modal state and renders the CameraModal.
interface ScannerRootProps {
  children: React.ReactNode;
  onValueChange: (value: string) => void;
  onDataScanned: (data: Record<string, any> | null) => void;
}
const Root: React.FC<ScannerRootProps> = ({
  children,
  onValueChange,
  onDataScanned,
}) => {
  const [value, setValue] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<Record<string, any> | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleScan = (scannedInfo: string) => {
    try {
      const data = JSON.parse(scannedInfo);
      const mainIdentifier = data.truck_number || data.tag_number || 'Unknown';
      setValue(mainIdentifier);
      setScannedData(data);
      onValueChange(mainIdentifier);
      onDataScanned(data);
    } catch (e) {
      console.error("Failed to parse scanned info:", e);
      setValue("Invalid QR");
      setScannedData({});
      onValueChange("Invalid QR");
      onDataScanned({});
    }
  };

  return (
    <ScannerContext.Provider value={{ value, scannedData, openScanner: () => setIsModalVisible(true) }}>
      <View className="w-full">
        {children}
      </View>
      <CameraModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onScan={handleScan}
      />
    </ScannerContext.Provider>
  );
};

export const Scanner = {
  Root, Trigger, Input, ScanButton, Status, Details, DetailRow,
};

// --- Styles for the Modal ---
const { height } = Dimensions.get('window');
const styles = StyleSheet.create({
  permissionDeniedView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20, },
  permissionDeniedText: { color: '#111827', fontSize: 18, textAlign: 'center', marginBottom: 20 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  overlayText: { color: '#fff', fontSize: 18, fontWeight: 'bold', position: 'absolute', top: height * 0.25 },
  scanBox: { width: 250, height: 250, borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)', borderRadius: 10 },
  closeButton: { position: 'absolute', top: 60, right: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20, },
});