import { Pressable } from 'react-native'
import React from 'react'
import { useThemeColors } from '@/hooks/useThemeColors';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const MenuIcon = () => {
    const colorTheme = useThemeColors();
    const router = useRouter();
    return (
        <Pressable
            android_ripple={{
                color: 'rgba(30,106,180,0.25)',
                borderless: false,
                foreground: true,
            }}
            className="bg-background-primary rounded-full p-2"
            onPress={() => router.push('/user')}
        >
            <MaterialIcons name="menu" size={24} color={colorTheme['textPrimary']} />
        </Pressable>
    )
}

export default MenuIcon