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

export default function Step1DebrisType() {
  const [debrisType, setDebrisType] = useState('');
  const router = useRouter();
  const colorTheme = useThemeColors();

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

        <View className='mt-10'>
          <Text className="text-2xl font-bold text-accent-primary text-center leading-8">
            Hurricane Ian COJ Debris
          </Text>
          <Text className="text-2xl font-bold text-accent-primary text-center leading-8 mb-12">
            Monitoring Services
          </Text>
        </View>

        <View className='flex-1 justify-between'>
          <View>
            <Label required className="pb-2">Debris Type</Label>
            <DropdownMenu value={debrisType} onValueChange={setDebrisType}>
              <DropdownMenuTrigger placeholder="Select Debris Type" className="w-full" />
              <DropdownMenuContent width={320}>
                <DropdownMenuLabel>Select a Debris Type</DropdownMenuLabel>
                <DropdownMenuCheckboxItem label="Vegetative Debris" value="vegetative" />
                <DropdownMenuCheckboxItem label="Construction & Demolition" value="c&d" />
                <DropdownMenuCheckboxItem label="White Goods" value="white_goods" />
                <DropdownMenuCheckboxItem label="Soil" value="soil" />
                <DropdownMenuCheckboxItem label="Hazardous Waste" value="hazardous" />
              </DropdownMenuContent>
            </DropdownMenu>
          </View>

          <Button
            className={`w-full py-4 mb-24 gap-2 ${!debrisType ? 'opacity-50' : ''}`}
            onPress={() => router.push('/fieldmonitor/sub-activity')}
            disabled={!debrisType}
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
