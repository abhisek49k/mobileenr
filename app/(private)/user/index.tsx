import { View, Text, Alert } from 'react-native';
import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import { ChevronLeft, X } from 'lucide-react-native';
import Button from '@/components/ui/Button';
import Header from '@/components/ui/Header';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface User {
    name: string;
    email: string;
    memberSince: string;
    role: string;
}

// Define props for the DetailRow component
interface DetailRowProps {
    label: string;
    value: string | undefined; // Value can be undefined if user object is null
    isLast?: boolean;
}


const DetailRow: React.FC<DetailRowProps> = ({ label, value, isLast }) => (
    // Conditional class: border-b (border bottom) is added only if it's NOT the last item
    <View className={`flex-row justify-between py-3 border-gray-200 ${isLast ? '' : 'border-b'}`}>
        <Text className="text-base font-semibold text-gray-600">
            {label}
        </Text>
        <Text className="text-base text-gray-800">
            {/* Use a fallback value if the property is undefined/null */}
            {value || 'Not Available'}
        </Text>
    </View>
);


const UserProfile: React.FC = () => {
    // Select the necessary state and actions from the persistent store
    const user = useAuthStore((state) => state.user);
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const logout = useAuthStore((state) => state.logout);
    const colorTheme = useThemeColors();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    /**
     * Handles the logout action with a confirmation alert.
     */
    const handleLogout = () => {
        Alert.alert(
            "Confirm Logout",
            "Are you sure you want to log out of your account?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Log Out",
                    onPress: () => {
                        logout(); // Call the Zustand store action
                        console.log('User initiated logout.');
                        // Note: Navigation logic to the login screen would typically follow here
                    },
                    style: "destructive"
                }
            ]
        );
    };

    if (!user || !isLoggedIn) {
        return (
            <View className="flex-1 p-5 justify-center items-center bg-gray-50">
                <Text className="text-xl text-gray-800 font-semibold mb-3">
                    Session Expired or Not Logged In
                </Text>
                <Text className="text-base text-gray-600">
                    Please navigate to the login screen.
                </Text>
            </View>
        );
    }

    // Cast the user object to the User interface type for complete type safety
    const typedUser: User = user as User;

    return (
        // Container Styles: flex-1 for full screen, p-5 padding, light gray background
        <>
            <StatusBar style='dark' />
            <View
                className="flex-1 bg-background-secondary"
                style={{ paddingBottom: insets.bottom + 10 }}
            >
                <Header
                    className='bg-border-secondary'
                    headerCenter={
                        <Text className="text-2xl font-bold text-center text-text-primary">
                            My Profile
                        </Text>
                    }
                    headerRight={
                        <Button
                            onPress={() => router.back()}
                            className="w-[40px] h-[40px] flex-row items-center bg-background-primary rounded-full"
                        >
                            <X size={24} color={colorTheme["textPrimary"]} />
                        </Button>
                    }
                />

                <View className='flex-1 p-8 flex-col justify-between'>
                    <View className="bg-white p-4 rounded-lg shadow-md">
                        {/* Detail Rows - Using typedUser for guaranteed properties */}
                        <DetailRow label="Name:" value={typedUser.name} />
                        <DetailRow label="Email:" value={typedUser.email} />
                        <DetailRow label="Member Since:" value={typedUser.memberSince} />
                        {/* isLast prop removes the bottom border for the final item */}
                        <DetailRow label="User ID:" value={typedUser.role} isLast={true} />
                    </View>

                    {/* Logout Button */}
                    <View className="mt-8">
                        <Button
                            onPress={handleLogout}
                            className="flex-row items-center bg-error-primary/10 rounded-2xl py-6 gap-2"
                        >
                            <Text className="text-error-primary font-base font-open-sans-bold">
                                Log Out
                            </Text>
                            <MaterialIcons name="logout" size={24} color={colorTheme["errorPrimary"]} />
                        </Button>
                    </View>
                </View>
            </View>
        </>
    );
};

export default UserProfile;