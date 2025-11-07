// components/ui/Separator.tsx

import React from 'react';
import { View } from 'react-native';
import { cn } from '@/lib/utils'; // Assuming you have this utility

interface SeparatorProps {
  /**
   * The orientation of the separator.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Separator: React.FC<SeparatorProps> = ({
  orientation = 'horizontal',
  className,
}) => {
  return (
    <View
      className={cn(
        // Default base style: a subtle color from your theme.
        "bg-border-primary", 
        
        // Conditional styles based on orientation.
        orientation === 'horizontal' 
          ? 'h-[1px] w-full'   // A thin, full-width line
          : 'w-[1px] h-full',  // A thin, full-height line
          
        // User-provided classes are applied last for overrides.
        className 
      )}
    />
  );
};