import { View, Text } from 'react-native';
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import Header from '@/components/ui/Header';
import { ChevronLeft, ArrowRight, TreePine } from 'lucide-react-native';
import { Label } from '@/components/ui/Label';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from '@/components/ui/Dropdown';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useProjectStore } from '@/store/projects/useProjectStore';
import MenuIcon from '@/components/menuIcon';

export default function Step2SubActivity() {
    const [subActivity, setSubActivity] = useState('');
    const router = useRouter();
    const colorTheme = useThemeColors();
    const { selectedProject } = useProjectStore();

    return (
        <View className="flex-1 bg-background-secondary">
            <Header
                headerLeft={
                    <Button
                        onPress={() => router.back()}
                        className="w-[40px] h-[40px] flex-row items-center bg-background-primary rounded-full"
                    >
                        <ChevronLeft size={24} color={colorTheme['textPrimary']} />
                    </Button>
                }
                headerCenter={<Text className="text-[22px] font-semibold text-white font-open-sans-bold">Field Monitor</Text>}
                headerRight={<MenuIcon/>}
            />

            <View className="flex-1 px-8">
                <View className="items-center justify-center p-4 mb-8">
                    <Text className="text-2xl font-bold text-center text-text-secondary">
                        {selectedProject?.name}
                    </Text>
                </View>

                <View className='flex-1 justify-between'>
                    <View>
                        <Label required>Sub-Activity</Label>
                        <DropdownMenu value={subActivity} onValueChange={setSubActivity}>
                            <DropdownMenuTrigger className="w-full" placeholder="Select Sub-Activity" />
                            <DropdownMenuContent width={320}>
                                <DropdownMenuLabel>Select Sub-Activity</DropdownMenuLabel>
                                <DropdownMenuCheckboxItem label="Loading" value="loading" />
                                <DropdownMenuCheckboxItem label="Transport" value="transport" />
                                <DropdownMenuCheckboxItem label="Unloading" value="unloading" />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </View>
                    <Button
                        className={`w-full py-4 mb-24 gap-2 ${!subActivity ? 'opacity-50' : ''}`}
                        onPress={() => router.push('/fieldmonitor/disposal-site')}
                        disabled={!subActivity}
                    >
                        <Text className="text-lg font-semibold text-white">Proceed</Text>
                        <ArrowRight size={20} color={colorTheme['textIcon']} />
                    </Button>
                </View>
            </View>

            {/* Footer */}
            <View className="absolute bottom-10 w-full">
                <Text className="text-sm text-text-primary text-center font-open-sans">
                    Developed by <Text className="text-accent-primary font-open-sans">GISKernel</Text>
                </Text>
            </View>
        </View>
    );
}
