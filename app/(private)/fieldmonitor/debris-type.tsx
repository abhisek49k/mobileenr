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

export default function DebrisType() {
  const router = useRouter();
  const colorTheme = useThemeColors();
  const selectedDebris = useProjectStore((s) => s.selectedDebris);
  const setDebrisType = useProjectStore((s) => s.setDebrisType);
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

        <View className="items-center justify-center p-4 mb-8">
          <Text className="text-2xl font-bold text-center text-text-secondary">
            {selectedProject?.name}
          </Text>
        </View>

        <View className='flex-1 justify-between'>
          <View>
            <Label required className="pb-2">Debris Type</Label>
            <DropdownMenu
              value={selectedDebris?.value}
              onValueChange={(val) =>
                setDebrisType({ label: val, value: val })
              }
            >
              <DropdownMenuTrigger placeholder="Select Debris Type" className="w-full" />
              <DropdownMenuContent width={320}>
                <DropdownMenuLabel>Select a Debris Type</DropdownMenuLabel>
                <DropdownMenuCheckboxItem label="Vegetative Debris" value="Vegetative" />
                <DropdownMenuCheckboxItem label="Construction & Demolition" value="CD" />
                <DropdownMenuCheckboxItem label="Mixed" value="Mixed" />
                <DropdownMenuCheckboxItem label="Demolition" value="Demo" />
                <DropdownMenuCheckboxItem label="Leaners" value="Leaners" />
                <DropdownMenuCheckboxItem label="Hangers" value="Hangers" />
                <DropdownMenuCheckboxItem label="Stump Extraction" value="StumpExtraction" />
                <DropdownMenuCheckboxItem label="Stump Haul" value="StumpHaul" />
                <DropdownMenuCheckboxItem label="Haul Out" value="HaulOut" />
                <DropdownMenuCheckboxItem label="Vehicles" value="Vehicles" />
                <DropdownMenuCheckboxItem label="Vessels" value="Vessels" />
                <DropdownMenuCheckboxItem label="Household Hazardous Waste" value="HHW" />
                <DropdownMenuCheckboxItem label="Electronic Waste" value="EWaste" />
              </DropdownMenuContent>
            </DropdownMenu>
          </View>

          <Button
            className={`w-full py-4 mb-24 gap-2 ${!selectedDebris ? 'opacity-50' : ''}`}
            onPress={() => router.push('/fieldmonitor/sub-activity')}
            disabled={!selectedDebris}
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
