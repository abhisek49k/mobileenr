// screens/LoginScreen.tsx

import React, { useState, useRef } from "react";
import {
    View,
    Text,
    Pressable,
    Image,
    ScrollView,
    TextInput as RNTextInput, // Import the type for our ref
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import Header from "@/components/ui/Header";
import { TextField } from "@/components/ui/TextField"; // Assuming components are in `components/ui`
import { Label } from "@/components/ui/Label";
import { Eye, EyeOff } from "lucide-react-native";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginScreen() {
    const route = useRouter();

    // --- State Management for the Form ---
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login }  =  useAuthStore()

    // --- Refs for focusing inputs when labels are pressed ---
    const usernameInputRef = useRef<RNTextInput>(null);
    const passwordInputRef = useRef<RNTextInput>(null);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(prevState => !prevState);
    };

    const onLogin = () => {
        setIsLoading(true);
        try {
            setTimeout(() => {
                setIsLoading(false)
                login();
            }, 2000)
        } catch (error) {
            
        }
    }

    return (
        <View className="flex-1 bg-background-secondary">
            {/* The header is kept as requested, without changes */}
            <Header
                headerLeft={<Text className="text-2xl font-semibold text-white font-open-sans-bold">EZ Debris</Text>}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
            >

                {/* Use ScrollView for responsiveness on smaller screens */}
                <ScrollView
                    // className="bg-accent-secondary"
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', margin: 0, padding: 0 }}
                    className="p-0 m-0"
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="p-8 flex-1">
                        {/* --- Logo and Header Text --- */}
                        <Image
                            source={require('@/assets/Icons/app-icon.png')}
                            className="w-[90px] h-[90px] self-center"
                            resizeMode="contain"
                        />

                        <Text className="text-xl font-bold text-text-primary mt-8 font-open-sans-bold">
                            EZ Debris Management System
                        </Text>
                        <Text className="text-xl font-bold text-text-primary font-open-sans-bold">
                            brought to you by Eisman & Russo, Inc.
                        </Text>

                        <Text className="text-base text-text-subheading mt-2 mb-10 font-open-sans-semibold">
                            Welcome <Text className="font-opens-sans-bold">Disaster Masters</Text>! Login below and have a Safe Day.
                        </Text>


                        {/* --- Username Field --- */}
                        <View className="mb-6">
                            <Pressable onPress={() => usernameInputRef.current?.focus()}>
                                <Label className="font-semibold text-text-primary mb-2">Username</Label>
                            </Pressable>
                            <TextField.Root
                                ref={usernameInputRef}
                                placeholder="Enter your username"
                                value={username}
                                onChangeText={setUsername}
                                accessibilityLabel="Username"
                            />
                        </View>

                        {/* --- Password Field --- */}
                        <View className="mb-6">
                            <Pressable onPress={() => passwordInputRef.current?.focus()}>
                                <Label className="font-semibold text-text-primary mb-2">Password</Label>
                            </Pressable>
                            <TextField.Root
                                ref={passwordInputRef}
                                placeholder="Enter your password"
                                value={password}
                                onChangeText={setPassword}
                                accessibilityLabel="Password"
                                secureTextEntry={!isPasswordVisible}
                            >
                                <TextField.RightIcon>
                                    <Pressable onPress={togglePasswordVisibility} hitSlop={10}>
                                        {isPasswordVisible
                                            ? <EyeOff size={20} className="text-text-secondary" />
                                            : <Eye size={20} className="text-text-secondary" />
                                        }
                                    </Pressable>
                                </TextField.RightIcon>
                            </TextField.Root>
                        </View>

                        {/* --- Login Button --- */}
                        <Button
                            className="w-full py-4 rounded-[14px] mt-2" 
                            loading={isLoading}
                            disabled={isLoading}
                            onPress={onLogin}
                        >
                            <Text className="text-lg font-semibold text-white">Login</Text>
                        </Button>

                        {/* --- Forgot Password Link --- */}
                        <Pressable className="mt-6" onPress={() => route.push('/forgot-password')}>
                            <Text className="text-base text-text-subheading text-center font-open-sans-semibold">
                                Forgot your password?
                            </Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* --- Footer Text --- */}
            <View className="absolute bottom-10 w-full">
                <Text className="text-sm text-text-primary text-center font-open-sans">
                    Developed by <Text className="text-accent-primary font-open-sans">GISKernel</Text>
                </Text>
            </View>
        </View>
    );
}