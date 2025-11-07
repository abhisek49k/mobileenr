import { View, Text, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import Header from '@/components/ui/Header';
import Button from '@/components/ui/Button';
import { ArrowRight, ChevronDown, ChevronLeft, CircleX } from 'lucide-react-native';
import { ScreenIndicator } from '@/components/ui/ScreenIndicator';
import { Separator } from '@/components/ui/Separator';
import { useProjectStore } from '@/store/projects/useProjectStore';
import { Label } from '@/components/ui/Label';
import { TextField } from '@/components/ui/TextField';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/Dropdown';
import { MAX_STEPS, PRIME_CONTRACTORS, SUB_CONTRACTORS } from '@/constants';

const index = () => {

  const router = useRouter();
  const colorTheme = useThemeColors();

  // --- Get Project Name from the Global Store ---
  const projectName = useProjectStore((state) => state.projectName);

  // --- Form State ---
  const [primeContractor, setPrimeContractor] = useState<string | undefined>(undefined);
  const [subContractor, setSubContractor] = useState<string | undefined>(undefined);

  const getSelectedLabel = (options: { label: string, value: string }[], selectedValue: string | undefined) => {
    return options.find(opt => opt.value === selectedValue)?.label || 'select';
  };

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
        headerCenter={<Text className="text-[22px] font-semibold text-white font-open-sans-bold">Truck Certification</Text>}
      />

      <View className='pb-4'>
        <ScreenIndicator
          maxSteps={MAX_STEPS}
          currentStep={1}
        />
        <Text className="text-xl font-semibold text-accent-primary text-center -mt-2">
          Assign to Project
        </Text>
      </View>

      <Separator />

      <ScrollView className="flex-1 bg-background-primary" contentContainerStyle={{ padding: 24 }}>
        <View className="mb-6">
          <Label required>Project</Label>
          <TextField.Root
            value={projectName || 'No project selected'}
            disabled={true}
            className="mt-2"
          />
        </View>

        <View className="mb-6">
          <Label required className='mb-2'>Prime Contractor</Label>
          <DropdownMenu value={primeContractor} onValueChange={setPrimeContractor}>
            <DropdownMenuTrigger className="w-full">
              <View className="mt-2 flex-row items-center justify-between h-14 w-full px-4 rounded-xl border bg-background-primary shadow-sm border-border-primary">
                <Text className={`text-base ${primeContractor ? 'text-text-primary' : 'text-text-secondary/60'}`}>
                  {getSelectedLabel(PRIME_CONTRACTORS, primeContractor)}
                </Text>
                <ChevronDown size={20} className="text-text-secondary/60" />
              </View>
            </DropdownMenuTrigger>
            <DropdownMenuContent width={320}>
              <DropdownMenuLabel>Select a Prime Contractor</DropdownMenuLabel>
              {PRIME_CONTRACTORS.map(item => (
                <DropdownMenuCheckboxItem key={item.value} label={item.label} value={item.value} />
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </View>

        <View>
          <Label className='mb-2'>Sub Contractor</Label>
          <DropdownMenu value={subContractor} onValueChange={setSubContractor}>
            <DropdownMenuTrigger className="w-full">
              <View className="mt-2 flex-row items-center justify-between h-14 w-full px-4 rounded-xl border bg-background-primary shadow-sm border-border-primary">
                <Text className={`text-base ${subContractor ? 'text-text-primary' : 'text-text-secondary/60'}`}>
                  {getSelectedLabel(SUB_CONTRACTORS, subContractor)}
                </Text>
                <ChevronDown size={20} className="text-text-secondary/60" />
              </View>
            </DropdownMenuTrigger>
            <DropdownMenuContent width={320}>
              <DropdownMenuLabel>Select a Sub Contractor</DropdownMenuLabel>
              {SUB_CONTRACTORS.map(item => (
                <DropdownMenuCheckboxItem key={item.value} label={item.label} value={item.value} />
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </View>

        <View className="flex-row items-center justify-center gap-2 mt-8">
          <Button
            className="flex-1 border border-accent-primary bg-background-primary py-4 rounded-2xl gap-3"
            onPress={() => router.back()}
          >
            <Text className="text-accent-primary font-base font-open-sans-bold">Cancel</Text>
            <CircleX size={20} color={colorTheme['accentPrimary']} />
          </Button>
          <Button
            className="bg-accent-primary flex-1 py-4 rounded-2xl gap-2"
            onPress={() => router.push('/truckcert/driver-owner')}
          >
            <Text className="text-white font-base font-open-sans-bold">Next</Text>
            <ArrowRight size={20} color={colorTheme['backgroundPrimary']} />
          </Button>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="absolute bottom-10 w-full">
        <Text className="text-sm text-text-primary text-center font-open-sans">
          Developed by <Text className="text-accent-primary font-open-sans">GISKernel</Text>
        </Text>
      </View>
    </View>
  )
}

export default index