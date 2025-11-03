import React, {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
  Children,
  isValidElement,
  cloneElement,
  ReactElement,
  ReactNode,
} from "react";
import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  LayoutRectangle,
  Dimensions,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// 💡 Import Reanimated components and hooks (V4 Style)
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

// --- MOCK CN UTILITY (Tailwind Class Merging) ---
const cn = (...args: (string | boolean | undefined)[]) => {
  return args.filter(Boolean).join(" ");
};

// --- 1. CONTEXT DEFINITION ---

interface DropdownContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  mode: "checkbox" | "radio" | null;
  setMode: React.Dispatch<React.SetStateAction<"checkbox" | "radio" | null>>;
  selected: string[];
  setSelected: (newSelection: string[]) => void;
  triggerLayout: LayoutRectangle | null;
  setTriggerLayout: React.Dispatch<React.SetStateAction<LayoutRectangle | null>>;
  itemLabels: Record<string, string>;
  registerItemLabel: (value: string, label: string) => void;
}

const DropdownContext = createContext<DropdownContextType | null>(null);

const useDropdownContext = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("Dropdown components must be used within a <DropdownMenu>");
  }
  return context;
};

// --- 2. ROOT COMPONENT ---

export const DropdownMenu = ({
  children,
  defaultClosed = true,
  closed: controlledClosed,
  onClose,
  defaultValue = [],
  value: controlledValue,
  onValueChange,
}: {
  children: React.ReactNode;
  defaultClosed?: boolean;
  closed?: boolean;
  onClose?: () => void;
  defaultValue?: string[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
}) => {
  const [uncontrolledClosed, setUncontrolledClosed] = useState(defaultClosed);
  const closed =
    controlledClosed !== undefined ? controlledClosed : uncontrolledClosed;
  const open = !closed;

  const setOpen = (newOpen: boolean) => {
    const newClosed = !newOpen;
    if (newClosed) {
      onClose?.();
    }
    if (controlledClosed === undefined) {
      setUncontrolledClosed(newClosed);
    }
  };

  const [uncontrolledSelected, setUncontrolledSelected] =
    useState(defaultValue);
  const selected =
    controlledValue !== undefined ? controlledValue : uncontrolledSelected;

  const setSelected = (newSelection: string[]) => {
    onValueChange?.(newSelection);
    if (controlledValue === undefined) {
      setUncontrolledSelected(newSelection);
    }
  };

  const [mode, setMode] = useState<"checkbox" | "radio" | null>(null);
  const [triggerLayout, setTriggerLayout] =
    useState<LayoutRectangle | null>(null);

  const [itemLabels, setItemLabels] = useState<Record<string, string>>({});

  const registerItemLabel = (value: string, label: string) => {
    setItemLabels((prev) => ({ ...prev, [value]: label }));
  };


  return (
    <DropdownContext.Provider
      value={{
        open,
        setOpen,
        mode,
        setMode,
        selected,
        setSelected,
        triggerLayout,
        setTriggerLayout,
        itemLabels,
        registerItemLabel,
      }}
    >
      {children}
    </DropdownContext.Provider>
  );
};

// --- 3. TRIGGER COMPONENT ---

export const DropdownMenuTrigger = ({
  asChild,
  children,
  placeholder = "Select option(s)",
  className,
}: {
  asChild?: boolean;
  children?: React.ReactNode;
  placeholder?: string;
  className?: string;
}) => {
  const { open, setOpen, setTriggerLayout, selected, itemLabels } =
    useDropdownContext();
  const ref = useRef<View>(null);

  // --- Dynamic Label Logic ---
  const selectedLabels = selected
    .map((value) => itemLabels[value])
    .filter(Boolean);

  let triggerLabel: string | ReactNode = placeholder;

  if (selectedLabels.length > 0) {
    const MAX_VISIBLE_ITEMS = 2;

    if (selectedLabels.length === 1) {
      triggerLabel = selectedLabels[0];
    }
    else if (selectedLabels.length <= MAX_VISIBLE_ITEMS) {
      triggerLabel = selectedLabels.join(", ");
    } else {
      const remainingCount = selectedLabels.length - MAX_VISIBLE_ITEMS;
      const visibleLabels = selectedLabels.slice(0, MAX_VISIBLE_ITEMS).join(", ");
      triggerLabel = `${visibleLabels} (+${remainingCount} others)`;
    }
  }


  const handlePress = () => {
    ref.current?.measure((fx, fy, width, height, px, py) => {
      setTriggerLayout({
        x: px,
        y: py,
        width,
        height,
      });
      setOpen(!open);
    });
  };

  // Logic for `asChild` usage
  if (asChild) {
    const child = Children.only(children) as ReactElement<any>;
    if (!isValidElement(child)) return null;

    const childContent = ((child.props as any).children === null || (child.props as any).children === undefined)
      ? <Text className={cn(selectedLabels.length === 0 ? "text-gray-500" : "text-black")}>{triggerLabel}</Text>
      : (child.props as any).children;


    return cloneElement(child, {
      ...(child.props as any),
      ref,
      onPress: (e: any) => {
        if (typeof (child.props as any).onPress === "function") {
          (child.props as any).onPress(e);
        }
        handlePress();
      },
      children: childContent,
    } as any);
  }

  // Default Trigger rendering
  return (
    <Pressable ref={ref} onPress={handlePress}>
      <View
        className={cn(
          "flex-row items-center justify-between px-3 py-4 border border-gray-300 rounded-[14px] bg-white",
          "w-64",
          className
        )}
      >
        <View style={{ flexShrink: 1, paddingRight: 8 }}>
          <Text
            className={cn(
              "text-base",
              selectedLabels.length === 0 ? "text-gray-500" : "text-black"
            )}
            numberOfLines={1}
          >
            {triggerLabel}
          </Text>
        </View>

        {/* Dropdown Icon (Chevron) */}
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={22}
          color="gray"
        />
      </View>
    </Pressable>
  );
};

// --- 4. CONTENT COMPONENT (With Reanimated V4, NO BACKDROP, HOOKS FIX) ---

export const DropdownMenuContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { open, setOpen, triggerLayout } = useDropdownContext();

  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  const preferredHeight = 200;
  const verticalGap = 4;
  const screenPadding = 10;
  const approximatedContentWidth = 256;

  const [modalVisible, setModalVisible] = useState(false);

  // --- Reanimated Shared Values (HOOKS MUST BE CALLED UNCONDITIONALLY) ---
  const contentScale = useSharedValue(0.9);
  const contentOpacity = useSharedValue(0);

  // --- Unconditional Positioning Calculations ---
  // Use default values if triggerLayout is null, positioning will correct on next render.
  const triggerX = triggerLayout?.x ?? 0;
  const triggerY = triggerLayout?.y ?? 0;
  const triggerHeight = triggerLayout?.height ?? 0;

  // 1. Vertical Positioning Logic
  const roomBelow = screenHeight - (triggerY + triggerHeight);
  const hasRoomBelow = roomBelow > preferredHeight + screenPadding;

  const topPosition = hasRoomBelow
    ? triggerY + triggerHeight + verticalGap
    : triggerY - preferredHeight - verticalGap;

  const finalTopPosition = Math.max(screenPadding, topPosition);

  // 2. HORIZONTAL POSITIONING LOGIC
  let leftPosition = triggerX;
  const rightEdge = leftPosition + approximatedContentWidth + screenPadding;
  if (rightEdge > screenWidth) {
    leftPosition = screenWidth - approximatedContentWidth - screenPadding;
  }
  leftPosition = Math.max(screenPadding, leftPosition);


  // --- Animation Logic (HOOKS MUST BE CALLED UNCONDITIONALLY) ---
  useEffect(() => {
    // Logic inside useEffect is conditional based on prop/state changes
    if (open && triggerLayout) {
      setModalVisible(true);
      
      // Content Expand/Fade In (Bouncy, Collapsible feel)
      contentScale.value = withSpring(1, { 
        damping: 15, 
        stiffness: 120, 
        mass: 0.8 
      });
      contentOpacity.value = withTiming(1, { duration: 150 });
    } else {
      // Content Fade Out
      contentScale.value = withTiming(0.9, { duration: 150 });
      
      // Fade out, then hide modal immediately after completion
      contentOpacity.value = withTiming(0, { duration: 150 }, (finished) => {
        if (finished) {
          // Safely call React state setter from the UI thread
          runOnJS(setModalVisible)(false);
        }
      });
    }
  }, [open, triggerLayout, contentOpacity, contentScale]);


  // --- Animated Styles (HOOKS MUST BE CALLED UNCONDITIONALLY) ---
  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      // These values are calculated unconditionally above
      top: finalTopPosition,
      left: leftPosition,
      
      // Apply the expanding animation
      transform: [
        { scale: contentScale.value },
      ],
      opacity: contentOpacity.value,
    };
  }, [finalTopPosition, leftPosition]);
  
  
  // --- FINAL RENDER CHECK (SAFE EARLY RETURN) ---
  if (!modalVisible) return null;


  return (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="none"
      onRequestClose={() => setOpen(false)}
    >
      <View
        className="absolute inset-0"
        style={{ zIndex: 9999 }}
      >
        {/* Full-screen Pressable to handle dismiss on tap-outside */}
        <Pressable
            className="absolute inset-0"
            // Setting the background to 'transparent' is usually necessary for this Pressable to register touches correctly
            style={{ backgroundColor: 'transparent' }} 
            onPress={() => setOpen(false)}
        />
        
        {/* Animated Content */}
        <Animated.View
          // pointerEvents="box-none" allows touches outside the content area 
          // to reach the full-screen Pressable above
          pointerEvents="box-none" 
          className={cn(
            "absolute bg-white border border-gray-300 rounded-xl shadow-lg py-2",
            "w-64",
            className
          )}
          style={[
            { 
              maxHeight: preferredHeight,
            },
            animatedContentStyle,
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

// --- 5. SUB-COMPONENTS (Unchanged) ---

export const DropdownMenuLabel = ({ children }: { children: React.ReactNode; }) => (
  <Text className="px-3 py-1 text-gray-500 text-base uppercase">
    {children}
  </Text>
);

export const DropdownMenuItem = ({ children, onPress, }: { children: React.ReactNode; onPress?: () => void; }) => {
  const { setOpen } = useDropdownContext();
  return (
    <TouchableOpacity
      onPress={() => { onPress?.(); setOpen(false); }}
      className="px-3 py-2 flex-row items-center justify-between active:bg-gray-100"
    >
      <Text className="text-black text-base">{children}</Text>
    </TouchableOpacity>
  );
};

export const DropdownMenuCheckboxItem = ({ value, label, }: { value: string; label: string; }) => {
  const { mode, setMode, selected, setSelected, registerItemLabel } = useDropdownContext();

  useEffect(() => {
    registerItemLabel(value, label);
    if (mode && mode !== "checkbox") {
      console.error("❌ You cannot mix checkbox and radio items in the same dropdown.");
    } else if (mode === null) {
      setMode("checkbox");
    }
  }, [value, label, mode, setMode, registerItemLabel]);

  const isSelected = selected.includes(value);
  const toggle = () => {
    if (isSelected) setSelected(selected.filter((v) => v !== value));
    else setSelected([...selected, value]);
  };

  return (
    <TouchableOpacity
      onPress={toggle}
      className="px-3 py-2 flex-row items-center justify-between active:bg-gray-100"
    >
      <Text className="text-black text-base">{label}</Text>
      {isSelected && (
        <Ionicons name="checkmark" size={18} color="blue" />
      )}
    </TouchableOpacity>
  );
};

export const DropdownMenuRadioItem = ({ value, label, }: { value: string; label: string; }) => {
  const { mode, setMode, selected, setSelected, registerItemLabel } = useDropdownContext();

  useEffect(() => {
    registerItemLabel(value, label);

    if (mode && mode !== "radio") {
      console.error("❌ You cannot mix checkbox and radio items in the same dropdown.");
    } else if (mode === null) {
      setMode("radio");
    }
  }, [value, label, mode, setMode, registerItemLabel]);

  const isSelected = selected.includes(value);
  const select = () => setSelected([value]);

  return (
    <TouchableOpacity
      onPress={select}
      className="px-3 py-2 flex-row items-center justify-between active:bg-gray-100"
    >
      <Text className="text-black text-base">{label}</Text>
      <View
        className={cn(
          "w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center",
          isSelected && "border-blue-600"
        )}
      >
        {isSelected && (
          <View className="w-4 h-4 rounded-full bg-blue-600" />
        )}
      </View>
    </TouchableOpacity>
  );
};