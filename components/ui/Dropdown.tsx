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
} from "react";
import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  LayoutRectangle,
  Dimensions,
  Modal,
  FlatList,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { useThemeColors } from "@/hooks/useThemeColors";
import { scheduleOnRN } from "react-native-worklets";

const cn = (...args: (string | boolean | undefined)[]) => args.filter(Boolean).join(" ");

// --- CONTEXT ---
interface DropdownContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
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
  if (!context) throw new Error("Dropdown components must be used within <DropdownMenu>");
  return context;
};

// --- ROOT ---
export const DropdownMenu = ({
  children,
  defaultClosed = true,
  closed: controlledClosed,
  onClose,
  value,
  onValueChange,
}: {
  children: React.ReactNode;
  defaultClosed?: boolean;
  closed?: boolean;
  onClose?: () => void;
  value?: string;
  onValueChange?: (value: string) => void;
}) => {
  const [uncontrolledClosed, setUncontrolledClosed] = useState(defaultClosed);
  const closed = controlledClosed !== undefined ? controlledClosed : uncontrolledClosed;
  const open = !closed;

  const setOpen = (newOpen: boolean) => {
    const newClosed = !newOpen;
    if (newClosed) onClose?.();
    if (controlledClosed === undefined) setUncontrolledClosed(newClosed);
  };

  const [triggerLayout, setTriggerLayout] = useState<LayoutRectangle | null>(null);
  const [itemLabels, setItemLabels] = useState<Record<string, string>>({});

  const registerItemLabel = (value: string, label: string) => {
    setItemLabels((prev) => ({ ...prev, [value]: label }));
  };

  const selected = value ? [value] : [];
  const setSelected = (newSelection: string[]) => {
    onValueChange?.(newSelection[0]);
  };

  return (
    <DropdownContext.Provider
      value={{
        open,
        setOpen,
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

// --- TRIGGER ---
export const DropdownMenuTrigger = ({
  asChild,
  children,
  placeholder = "Select option",
  className,
}: {
  asChild?: boolean;
  children?: React.ReactNode;
  placeholder?: string;
  className?: string;
}) => {
  const { open, setOpen, setTriggerLayout, selected, itemLabels } = useDropdownContext();
  const ref = useRef<View>(null);
  const selectedLabel = selected.map((v) => itemLabels[v]).filter(Boolean).join(", ");

  const handlePress = () => {
    ref.current?.measure((fx, fy, width, height, px, py) => {
      setTriggerLayout({ x: px, y: py, width, height });
      setOpen(!open);
    });
  };

  if (asChild && children) {
    const child = Children.only(children) as ReactElement<any>;
    if (!isValidElement(child)) return null;
    return cloneElement(child, {
      ...child.props,
      ref,
      onPress: (e: any) => {
        child.props.onPress?.(e);
        handlePress();
      },
      children:
        child.props.children ?? (
          <Text className={cn("text-black")}>{selectedLabel || placeholder}</Text>
        ),
    } as any);
  }

  return (
    <Pressable
      ref={ref}
      onPress={handlePress}
      android_ripple={{
        color: "rgba(0,0,0,0.1)",
        borderless: false,
        foreground: Platform.OS === "android",
      }}
      style={{
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <View
        className={cn(
          "flex-row items-center justify-between px-3 py-4 border border-gray-300 rounded-[14px] bg-background-primary",
          "w-64",
          className
        )}
      >
        <Text className="flex-1 text-base text-black">{selectedLabel || placeholder}</Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={22} color="gray" />
      </View>
    </Pressable>
  );
};

// --- CONTENT ---
export const DropdownMenuContent = ({
  children,
  className,
  width = 256, // <-- Added prop for dynamic width
}: {
  children: React.ReactNode;
  className?: string;
  width?: number;
}) => {
  const { open, setOpen, triggerLayout } = useDropdownContext();
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  const preferredHeight = 240;
  const verticalGap = 4;
  const screenPadding = 10;

  const [modalVisible, setModalVisible] = useState(false);
  const contentScale = useSharedValue(0.9);
  const contentOpacity = useSharedValue(0);

  const triggerX = triggerLayout?.x ?? 0;
  const triggerY = triggerLayout?.y ?? 0;
  const triggerHeight = triggerLayout?.height ?? 0;

  const roomBelow = screenHeight - (triggerY + triggerHeight);
  const hasRoomBelow = roomBelow > preferredHeight + screenPadding;
  const topPosition = hasRoomBelow
    ? triggerY + triggerHeight + verticalGap
    : triggerY - preferredHeight - verticalGap;
  const finalTopPosition = Math.max(screenPadding, topPosition);

  let leftPosition = triggerX;
  const rightEdge = leftPosition + width + screenPadding;
  if (rightEdge > screenWidth) leftPosition = screenWidth - width - screenPadding;
  leftPosition = Math.max(screenPadding, leftPosition);

  useEffect(() => {
    if (open && triggerLayout) {
      setModalVisible(true);
      contentScale.value = withSpring(1, { damping: 15, stiffness: 120, mass: 0.8 });
      contentOpacity.value = withTiming(1, { duration: 150 });
    } else {
      contentScale.value = withTiming(0.9, { duration: 150 });
      contentOpacity.value = withTiming(0, { duration: 150 }, (finished) => {
        if (finished) scheduleOnRN(setModalVisible, false);
      });
    }
  }, [open, triggerLayout]);

  const animatedContentStyle = useAnimatedStyle(() => ({
    top: finalTopPosition,
    left: leftPosition,
    transform: [{ scale: contentScale.value }],
    opacity: contentOpacity.value,
  }));

  if (!modalVisible) return null;
  const items = React.Children.toArray(children);

  return (
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={() => setOpen(false)}>
      <View className="absolute inset-0" style={{ zIndex: 9999 }}>
        <Pressable className="absolute inset-0" style={{ backgroundColor: "transparent" }} onPress={() => setOpen(false)} />
        <Animated.View
          pointerEvents="box-none"
          className={cn(
            "absolute bg-background-primary border border-gray-300 rounded-xl shadow-lg",
            className
          )}
          style={[{ maxHeight: preferredHeight, width }, animatedContentStyle]} // <-- width dynamic here
        >
          <FlatList
            data={items as React.ReactElement[]}
            keyExtractor={(_, i) => `dropdown-item-${i}`}
            renderItem={({ item }) => item}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 4 }}
          />
        </Animated.View>
      </View>
    </Modal>
  );
};

// --- LABEL ---
export const DropdownMenuLabel = ({ children }: { children: React.ReactNode }) => (
  <Text className="px-3 py-1 text-gray-500 text-base uppercase">{children}</Text>
);

// --- ITEM ---
export const DropdownMenuItem = ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) => {
  const { setOpen } = useDropdownContext();

  const handlePress = () => {
    onPress?.();
    setOpen(false);
  };

  return (
    <TouchableOpacity onPress={handlePress} className="px-3 py-2 flex-row items-center justify-between active:bg-gray-100">
      <Text className="text-base text-black">{children}</Text>
    </TouchableOpacity>
  );
};

// --- CHECKBOX ITEM ---
export const DropdownMenuCheckboxItem = ({ value, label }: { value: string; label: string }) => {
  const colorTheme = useThemeColors();
  const { selected, setSelected, setOpen, registerItemLabel } = useDropdownContext();

  useEffect(() => {
    registerItemLabel(value, label);
  }, [value, label]);

  const isSelected = selected.includes(value);

  const handlePress = () => {
    setSelected([value]);
    setOpen(false);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={cn(
        "px-3 py-2.5 flex-row items-center justify-between",
        isSelected ? "bg-blue-50" : "active:bg-gray-100"
      )}
    >
      <Text className={cn("text-base", isSelected ? "text-blue-700 font-semibold" : "text-black")}>
        {label}
      </Text>
      {isSelected && <Ionicons name="checkmark" size={20} color={colorTheme["accentPrimary"]} />}
    </TouchableOpacity>
  );
};
