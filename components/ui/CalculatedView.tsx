// components/ui/CalculatedView.tsx

import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { cn } from '@/lib/utils';

interface CalculatedViewProps {
  label: string;
  /** A mathematical formula as a string (e.g., "length * width * height / 46656"). */
  formula: string;
  /** An array of values that the formula depends on. The order MUST match the order of variables in the formula. */
  dependencies: (string | number)[];
  unit: string;
  className?: string;
}

export const CalculatedView: React.FC<CalculatedViewProps> = ({
  label,
  formula,
  dependencies,
  unit,
  className,
}) => {
  const calculatedValue = useMemo(() => {
    try {
      // 1. Use a regular expression to find all variable names (words) in the formula.
      const variableRegex = /[a-zA-Z_][a-zA-Z0-9_]*/g;
      const foundVariables = formula.match(variableRegex) || [];
      // Get a unique list of variables in the order they appeared.
      const uniqueVariables = [...new Set(foundVariables)];

      // 2. Validate that the number of variables found matches the number of dependencies passed.
      if (uniqueVariables.length !== dependencies.length) {
        console.error(
          `CalculatedView Error: The number of unique variables in the formula (${uniqueVariables.length}) does not match the number of dependencies provided (${dependencies.length}).`
        );
        return 0;
      }

      // 3. Build the declaration string by mapping variables to dependency values by their index.
      const declarations = uniqueVariables.reduce((acc, variableName, index) => {
        // Get the corresponding value from the dependencies array.
        const value = parseFloat(String(dependencies[index])) || 0;
        return `${acc}const ${variableName} = ${value}; `;
      }, '');

      // 4. Combine declarations with the formula and evaluate.
      const codeToEvaluate = `${declarations} (${formula})`;
      return eval(codeToEvaluate);

    } catch (error) {
      console.error("Eval evaluation error:", error);
      return 0;
    }
  }, [formula, ...dependencies]); // Re-run when formula or any dependency value changes.

  const formattedValue = (calculatedValue || 0).toFixed(2);

  return (
    <View
      className={cn(
        "h-14 w-full flex-row items-center justify-between px-4",
        "rounded-xl border border-border-primary bg-background-primary shadow-sm",
        className
      )}
    >
      <Text className="text-base font-medium text-text-primary">
        {label}
      </Text>
      <Text className="text-base font-semibold text-accent-primary">
        {formattedValue} {unit}
      </Text>
    </View>
  );
};