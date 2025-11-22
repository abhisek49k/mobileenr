import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/Dropdown";
import { Entypo } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Button from "@/components/ui/Button";
import Header from "@/components/ui/Header";
import ImageUploader, { ImageAsset } from "@/components/ui/ImageUploader";
import { Dialog } from "@/components/ui/Dialog";
import {
  AtSign,
  CirclePlus,
  Eye,
  EyeOff,
  KeyRound,
  RefreshCcw,
  Search,
} from "lucide-react-native";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Switch } from "@/components/ui/Switch";
import { Toggle } from "@/components/ui/Toggle";
import { TextField } from "@/components/ui/TextField";
import { Label } from "@/components/ui/Label";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { InputView } from "@/components/ui/InputView";

// Mock image for the dialog
const lengthImage = require("@/assets/images/truck-icon.png");

const Components = () => {
  const router = useRouter();
  const colorTheme = useThemeColors();
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [selection, setSelection] = useState("yes");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [comment, setComment] = useState("");
  const [framework, setFramework] = useState("");
  const [vehicleType, setVehicleType] = useState<string | null>(null);
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  // Mock truck icon for local assets
  const truckIcon = require("@/assets/images/truck-icon.png");

  // The parent's only job is to update its state when the child says so.
  const handleImagesChanged = (updatedImages: ImageAsset[]) => {
    setImages(updatedImages);
  };

  // --- 1. State for password visibility ---
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // --- 2. Function to toggle the state ---
  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prevState) => !prevState);
  };

  return (
    <ScrollView
      className="bg-background-primary"
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <Header
        headerLeft={
          <Text className="text-lg font-semibold text-white">Components</Text>
        }
      />
      <View className="flex flex-row gap-2 p-2">
        <DropdownMenu value={framework} onValueChange={setFramework}>
          <DropdownMenuTrigger
            placeholder="Select Frameworks"
            className="w-80"
          />
          <DropdownMenuContent className="w-80">
            <DropdownMenuLabel>Technologies</DropdownMenuLabel>
            <DropdownMenuCheckboxItem label="React" value="react" />
            <DropdownMenuCheckboxItem label="Vue" value="vue" />
            <DropdownMenuCheckboxItem label="Angular" value="angular" />
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild placeholder="Open App Menu">
            <Pressable className="px-2 flex items-center justify-center bg-background-secondary rounded-xl">
              <Entypo name="dots-three-vertical" size={20} color="black" />
            </Pressable>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-64">
            <DropdownMenuLabel>Menu</DropdownMenuLabel>
            <DropdownMenuItem onPress={() => console.log("GitHub")}>
              GitHub
            </DropdownMenuItem>
            <DropdownMenuItem onPress={() => console.log("Support")}>
              Support
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </View>

      <InputView
        label="Length"
        required
        value={length} // The controlled value from your store
        onSave={setLength}
        placeholder="Enter length in Inches"
        dialogTitle="Enter Length"
        dialogImage={lengthImage}
        dialogInputPlaceholder="Enter Length in Inches"
      />

      <View className="p-8">
        <RadioGroup.Root value={vehicleType} onValueChange={setVehicleType}>
          <RadioGroup.Item value="knuckle_boom">
            <RadioGroup.Label>Knuckle Boom Truck</RadioGroup.Label>
            <RadioGroup.Image source={truckIcon} title="Knuckle Boom Truck" />
          </RadioGroup.Item>

          <RadioGroup.Item value="tandem_trailer">
            <RadioGroup.Label>Tandem Trailer</RadioGroup.Label>
            <RadioGroup.Image source={truckIcon} title="Knuckle Boom Truck" />
          </RadioGroup.Item>

          <RadioGroup.Item value="front_loader">
            <RadioGroup.Label>Front Loader</RadioGroup.Label>
            Example without an image
          </RadioGroup.Item>
        </RadioGroup.Root>
      </View>

      <ImageUploader images={images} onImagesChanged={handleImagesChanged} />

      <Dialog.Root
        open={isOpen}
        onOpenChange={setIsOpen}
        enableAndroidBlur={true}
      >
        <Dialog.Trigger>
          <Pressable
            className={`w-32 flex justify-center px-4 py-2.5 rounded-lg bg-accent-primary`}
          >
            <Text className={`font-semibold text-text-icon`}>Open Dialog</Text>
          </Pressable>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Dialog Title</Dialog.Title>
              <Dialog.Description>
                This is a description for the dialog. You can put any content
                you want here.
              </Dialog.Description>
            </Dialog.Header>

            <View className="p-6">
              <Text className="text-text-secondary">
                This is the main body content of the dialog.
              </Text>
            </View>

            <Dialog.Footer className="flex gap-2">
              <Dialog.Close>
                <Pressable
                  className={`px-4 py-2.5 rounded-lg bg-background-icon`}
                >
                  <Text className={`font-semibold text-text-primary`}>
                    Close
                  </Text>
                </Pressable>
              </Dialog.Close>
              <Pressable
                className={`px-4 py-2.5 rounded-lg bg-accent-primary`}
                onPress={() => {
                  console.log("Confirmed!");
                  setIsOpen(false);
                }}
              >
                <Text className={`font-semibold text-text-icon`}>Confirm</Text>
              </Pressable>
            </Dialog.Footer>

            {/* You can also use the default X button */}
            <Dialog.Close />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Button
        className="w-96 mt-6 bg-accent-primary px-6 py-4 rounded-2xl"
        onPress={() => router.push("/")}
      >
        <Text className="text-white font-medium">Login</Text>
      </Button>

      <View className="flex-row gap-2 mt-6">
        <Button
          className="border border-accent-primary bg-background-primary px-6 py-4 rounded-2xl gap-2"
          onPress={() => router.push("/")}
        >
          <Text className="text-accent-primary font-medium">Cancel Ticket</Text>
          <RefreshCcw size={20} color={colorTheme["accentPrimary"]} />
        </Button>
        <Button
          className="bg-accent-primary px-6 py-4 rounded-2xl gap-2"
          onPress={() => router.push("/")}
        >
          <Text className="text-white font-medium">Create Ticket</Text>
          <CirclePlus size={20} color={colorTheme["backgroundPrimary"]} />
        </Button>
      </View>

      <View className="w-full max-w-sm bg-background-primary p-6 rounded-2xl">
        <Text className="text-lg font-bold text-text-primary mb-6">
          Settings
        </Text>

        {/* --- Example 1: Controlled Component --- */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-base text-text-primary">
            Enable Notifications
          </Text>
          <Switch.Root
            checked={isNotificationsEnabled}
            onCheckedChange={setIsNotificationsEnabled}
          >
            <Switch.Thumb />
          </Switch.Root>
        </View>

        {/* --- Example 2: Uncontrolled Component (uses its own state) --- */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-base text-text-primary">Auto-Update</Text>
          <Switch.Root defaultChecked={true}>
            <Switch.Thumb />
          </Switch.Root>
        </View>

        {/* --- Example 3: Disabled State --- */}
        <View className="flex-row items-center justify-between">
          <Text className="text-base text-text-secondary">
            Admin Access (Disabled)
          </Text>
          <Switch.Root disabled={true} checked={false}>
            <Switch.Thumb />
          </Switch.Root>
        </View>

        <Toggle
          options={[
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ]}
          value={selection}
          onValueChange={(value) => setSelection(String(value))}
        />

        <Label htmlFor="email" className="mb-2">
          Email
        </Label>
        <TextField.Root
          type="email"
          placeholder="email@example.com"
          value={email}
          onChangeText={setEmail}
        >
          <TextField.LeftIcon>
            <AtSign size={18} className="text-text-secondary" />
          </TextField.LeftIcon>
        </TextField.Root>

        <Label htmlFor="password" className="mb-2">
          Password
        </Label>
        <TextField.Root
          type="password"
          placeholder="Your password"
          value={password}
          onChangeText={setPassword}
        >
          <TextField.LeftIcon>
            <KeyRound size={18} className="text-text-secondary" />
          </TextField.LeftIcon>
          <TextField.RightIcon>
            <Text className="text-accent-primary font-semibold">Forgot?</Text>
          </TextField.RightIcon>
        </TextField.Root>

        <TextField.Root placeholder="Search the docs…">
          <TextField.RightIcon>
            <Search size={18} className="text-text-secondary" />
          </TextField.RightIcon>
        </TextField.Root>

        <TextField.Root placeholder="Cannot edit" disabled />

        <Label htmlFor="comment" className="mb-2">
          Comment
        </Label>
        <TextField.Root
          placeholder="Leave a comment..."
          multiline
          textAlignVertical="top" // Important for multiline
          value={comment}
          onChangeText={setComment}
        />

        <Label htmlFor="password" className="mb-2">
          Password
        </Label>
        <TextField.Root
          type="password"
          // The `secureTextEntry` prop is now controlled by our state
          secureTextEntry={!isPasswordVisible}
          placeholder="Your password"
          value={password}
          onChangeText={setPassword}
        >
          {/* The RightIcon slot now contains our interactive toggle button */}
          <TextField.RightIcon>
            <Pressable onPress={togglePasswordVisibility} hitSlop={10}>
              {isPasswordVisible ? (
                // Show the 'EyeOff' icon when password is visible
                <EyeOff size={18} className="text-text-secondary" />
              ) : (
                // Show the 'Eye' icon when password is not visible
                <Eye size={18} className="text-text-secondary" />
              )}
            </Pressable>
          </TextField.RightIcon>
        </TextField.Root>
      </View>
    </ScrollView>
  );
};

export default Components;

const styles = StyleSheet.create({});
