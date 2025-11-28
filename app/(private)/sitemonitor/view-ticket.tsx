import { View, Text, KeyboardAvoidingView, ScrollView, Platform } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import Button from '@/components/ui/Button';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import MenuIcon from '@/components/menuIcon';

let debrisType = "Vegetative"

const ViewDisposalTickets = () => {

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorTheme = useThemeColors();

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
            Disposal Tickets
          </Text>
        }
        headerRight={<MenuIcon/>}
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
          <View className="flex-1 p-8">

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

export default ViewDisposalTickets;