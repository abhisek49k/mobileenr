import React, { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, Pressable, Image, Modal, StatusBar } from "react-native";
import Signature, { SignatureViewRef } from "react-native-signature-canvas";
import { Edit3, X, Trash2 } from "lucide-react-native";
import { cn } from "@/lib/utils";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "@/hooks/useThemeColors";

interface SignaturePadProps {
  label: string;
  required?: boolean;
  value: string | null;
  onSave: (signature: string) => void;
  onClear: () => void;
  className?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  label,
  required = false,
  value,
  onSave,
  onClear,
  className,
}) => {
  const insets = useSafeAreaInsets();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const sigRef = useRef<SignatureViewRef>(null);
  const colorTheme = useThemeColors();

  const handleOK = useCallback(
    (signature: string) => {
      if (signature) {
        onSave(signature.replace(/\n|\r/g, ""));
      }
      setIsModalOpen(false);
    },
    [onSave]
  );

  const webStyle = `
    .m-signature-pad { box-shadow: none; border: none; height: 100%; }
    .m-signature-pad--body { height: 100%; border: none; }
    .m-signature-pad--footer { display: none; }
    body, html { height: 100%; }
  `;

  useEffect(() => {
  if (isModalOpen) {
    StatusBar.setBarStyle("dark-content", true); // dark text/icons for white background
    StatusBar.setBackgroundColor("#000000"); // black background on Android
  } else {
    StatusBar.setBarStyle("light-content", true); // revert to light
    StatusBar.setBackgroundColor("#111827"); // your default color
  }
}, [isModalOpen]);

  return (
    <View className={cn("w-full", className)}>
      <Text className="text-base font-medium text-text-primary mb-2">
        {label}
        {required && <Text className="text-error-primary"> *</Text>}
      </Text>

      {/* Tap Box */}
      <Pressable onPress={() => setIsModalOpen(true)}>
        <View className="h-40 w-full items-center justify-center p-2 rounded-xl border bg-background-primary shadow-sm border-border-primary">
          {value ? (
            <Image
              source={{ uri: value }}
              className="w-full h-full"
              resizeMode="contain"
            />
          ) : (
            <View className="items-center opacity-50">
              <Edit3 size={24} className="text-text-secondary" />
              <Text className="text-text-secondary mt-2">Tap to Sign</Text>
            </View>
          )}
        </View>
      </Pressable>

      {value && (
        <Pressable
          onPress={onClear}
          className="self-end mt-2 flex-row items-center p-1"
        >
          <Trash2 size={14} color={colorTheme['errorPrimary']}  />
          <Text className="text-sm text-error-primary ml-1">Clear</Text>
        </Pressable>
      )}

      {/* Modal */}
      <Modal visible={isModalOpen} animationType="slide">
        {/* Wrapper View with SafeAreaInsets */}
        <View
          style={{
            flex: 1,
            paddingTop: insets.top + 10,
            paddingBottom: insets.bottom + 10,
            backgroundColor: "#fff", // make sure background is set
          }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-border-primary">
            <Pressable onPress={() => setIsModalOpen(false)}>
              <X size={24} />
            </Pressable>
            <Text className="text-lg font-semibold">{label}</Text>
            <Pressable onPress={() => sigRef.current?.clearSignature()}>
              <Trash2 size={24} />
            </Pressable>
          </View>

          {/* Signature Canvas */}
          <Signature
            ref={sigRef}
            onOK={handleOK}
            webStyle={webStyle}
            backgroundColor="#FFF"
            penColor="#111827"
            autoClear={false}
            imageType="image/png"
          />

          {/* Footer */}
          <View className="p-4 border-t border-border-primary">
            <Pressable
              onPress={() => sigRef.current?.readSignature()}
              className="bg-accent-primary py-4 rounded-2xl items-center"
            >
              <Text className="text-lg font-semibold text-white">
                Confirm Signature
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};
