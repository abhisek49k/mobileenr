import { View, Text } from 'react-native';
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import Header from '@/components/ui/Header';
import { ChevronLeft, ArrowRight, TreePine, CirclePlus, Eye } from 'lucide-react-native';
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
import { Card } from '@/components/ui/Card';
import { useProjectStore } from '@/store/projects/useProjectStore';

export default function FieldMonitorAction() {

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
            />

            <View className="flex-1 px-8">
                {/* <View className="w-full flex-row justify-center items-center">
                    <View className="w-48 bg-[#96c5f2] flex-row justify-center items-center gap-2 p-2">
                        <TreePine size={22} color={colorTheme['textSecondary']} />
                        <Text className="text-text-secondary font-open-sans-bold">Field Monitor</Text>
                    </View>
                </View> */}

                <View className="items-center justify-center p-4 mb-8">
                    <Text className="text-2xl font-bold text-center text-text-secondary">
                        {selectedProject?.name}
                    </Text>
                </View>

                <View className='flex-1 justify-between'>
                    <View className="flex-row gap-2">
                        <Card.Root className="w-[158px] h-[132px]" onPress={() => router.push('/fieldmonitor/debris-type')} >
                            <Card.Content>
                                <CirclePlus size={48} color={colorTheme['textSecondary']} />
                                <Text className="text-base font-semibold text-text-secondary mt-4 text-center"> Create Ticket </Text>
                            </Card.Content>
                        </Card.Root>
                        <Card.Root className="w-[158px] h-[132px]" onPress={() => router.push('/fieldmonitor/view-ticket')} >
                            <Card.Content>
                                <Eye size={48} color={colorTheme['textSecondary']} />
                                <Text className="text-base font-semibold text-text-secondary mt-4 text-center"> View Ticket </Text>
                            </Card.Content>
                        </Card.Root>
                    </View>
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
