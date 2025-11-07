import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState } from 'react';
import Header from '@/components/ui/Header';
import { ScreenIndicator } from '@/components/ui/ScreenIndicator';
import { MAX_STEPS } from '@/constants';
import { Label } from '@/components/ui/Label';
import { TextField } from '@/components/ui/TextField';
import { Separator } from '@/components/ui/Separator';
import ImageUploader, { ImageAsset } from '@/components/ui/ImageUploader';


export default function DriverOwnerScreen() {

    const [driverFirstName, setDriverFirstName] = useState("");
    const [driverLastName, setDriverLastName] = useState("");
    const [images, setImages] = useState<ImageAsset[]>([]);

    const handleImagesChanged = (updatedImages: ImageAsset[]) => {
        setImages(updatedImages);
    };

    return (
        <View className="flex-1 bg-background-secondary">
            {/* The header is kept as requested, without changes */}
            <Header
                headerLeft={<Text className="text-2xl font-semibold text-white font-open-sans-bold">EZ Debris</Text>}
            />

            <View className='pb-4'>
                <ScreenIndicator
                    maxSteps={MAX_STEPS}
                    currentStep={2}
                />
                <Text className="text-xl font-semibold text-accent-primary text-center -mt-2">
                    Driver & Owner Details
                </Text>
            </View>

            <Separator />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, margin: 0, padding: 0 }}
                    className="p-8 m-0"
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="mb-6">
                        <Label required>Driver First Name</Label>
                        <TextField.Root
                            placeholder="Enter First Name"
                            accessibilityLabel="firstname"
                            value={driverFirstName}
                            onChangeText={setDriverFirstName}
                            className="mt-2"
                        />
                    </View>
                    <View className="mb-6">
                        <Label required>Driver Last Name</Label>
                        <TextField.Root
                            placeholder="Enter Last Name"
                            accessibilityLabel="lastname"
                            value={driverLastName}
                            onChangeText={setDriverLastName}
                            className="mt-2"
                        />
                    </View>

                    <View className="mb-6">
                        <Label required className='mb-2'>Driving License</Label>
                        <ImageUploader
                            images={images}
                            onImagesChanged={handleImagesChanged}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    )
}