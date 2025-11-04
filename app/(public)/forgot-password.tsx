// screens/Forgotpassword.tsx

import React, { useState, useRef } from 'react';
import { 
    View, 
    Text, 
    KeyboardAvoidingView, 
    Platform, 
    ScrollView, 
    Pressable, 
    TextInput as RNTextInput,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Header from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Label } from '@/components/ui/Label';
import { MailQuestion, ArrowLeft, AtSign, Mail } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

const Forgotpassword = () => {
  const router = useRouter();
  
  // --- State and Refs for the form ---
  const [identifier, setIdentifier] = useState('');
  const inputRef = useRef<RNTextInput>(null);
  const colorScheme = useThemeColors();

  const handleSubmit = () => {
    if (!identifier) {
        Alert.alert("Input Required", "Please enter your email or username.");
        return;
    }
    console.log("Password reset requested for:", identifier);
    Alert.alert("Check Your Email", `If an account exists for ${identifier}, you will receive a password reset link.`);
    router.back();
  }

  return (
    // Use background-primary for a clean, white screen as seen in the inspiration image
    <View className="flex-1 bg-background-primary">
      <Header
        headerLeft={<Text className="text-2xl font-semibold text-white">EZ Debris</Text>}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1}}
          keyboardShouldPersistTaps="handled"
        >
          <View className="p-8 ">

            {/* --- Icon Header --- */}
            <View className="self-center bg-background-secondary p-4 rounded-2xl border border-border-primary mb-8">
              <Mail size={32} className="text-accent-primary" />
            </View>

            {/* --- Title and Subheading --- */}
            <Text className="text-2xl font-bold text-text-primary text-center">
              Forgot Password
            </Text>
            <Text className="text-base text-text-subheading text-center mt-2 mb-10 font-open-sans-regular">
              You will get a reset password link in your email.
            </Text>
            
            {/* --- Email/Username Input Field --- */}
            <View className="mb-6">
              <Pressable onPress={() => inputRef.current?.focus()}>
                <Label className="font-semibold text-text-primary mb-2">Email or Username</Label>
              </Pressable>
              <TextField.Root
                  ref={inputRef}
                  placeholder="Enter your email or username"
                  value={identifier}
                  onChangeText={setIdentifier}
                  accessibilityLabel="Email or Username"
                  type="email"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
              >
                  <TextField.LeftIcon>
                      <AtSign size={18} className="text-text-secondary" />
                  </TextField.LeftIcon>
              </TextField.Root>
            </View>

            {/* --- Submit Button --- */}
            <Button
                className="w-full py-4  mt-2" // Fully rounded like the design
                onPress={handleSubmit}
            >
                <Text className="text-lg font-semibold text-white">Submit Now</Text>
            </Button>
            
            {/* --- Back to Login Link --- */}
            <Pressable
                onPress={() => router.back()}
                className="mt-8 self-center"
            >
                <View className="flex-row items-center gap-2">
                    <ArrowLeft size={16} color={colorScheme["textSecondary"]} />
                    <Text className="text-base text-text-secondary">
                        Back to login
                    </Text>
                </View>
            </Pressable>
            
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

export default Forgotpassword;