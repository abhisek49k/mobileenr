import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioItem,
    DropdownMenuTrigger
} from "@/components/ui/Dropdown";
import { Entypo } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Button from '@/components/ui/Button';
import Header from '@/components/ui/Header';
import ImageUploader, { ImageAsset } from '@/components/ui/ImageUploader';
import { Dialog } from '@/components/ui/Dialog';

let imageCounter = 0;

const Components = () => {
    const router = useRouter();
    const [images, setImages] = useState<ImageAsset[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // The parent's only job is to update its state when the child says so.
    const handleImagesChanged = (updatedImages: ImageAsset[]) => {
        setImages(updatedImages);
    };

    return (
        <View className='flex-1 bg-background-primary'>
            <Header
                headerLeft={<Text className="text-lg font-semibold text-white">Components</Text>}
            />
            <View className="flex flex-row gap-2 p-2">
                <DropdownMenu>
                    <DropdownMenuTrigger placeholder="Select Frameworks" className="w-80" />
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
                        <DropdownMenuItem onPress={() => console.log("GitHub")}>GitHub</DropdownMenuItem>
                        <DropdownMenuItem onPress={() => console.log("Support")}>Support</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </View>

            <DropdownMenu>
                <DropdownMenuTrigger placeholder="Choose Theme" />
                <DropdownMenuContent>
                    <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                    <DropdownMenuRadioItem label="Light" value="light" />
                    <DropdownMenuRadioItem label="Dark" value="dark" />
                    <DropdownMenuRadioItem label="System" value="system" />
                </DropdownMenuContent>
            </DropdownMenu>

            <ImageUploader
                images={images}
                onImagesChanged={handleImagesChanged}
            />

            <Dialog.Root open={isOpen} onOpenChange={setIsOpen} enableAndroidBlur={true}>
                <Dialog.Trigger>
                    <Pressable
                        className={`px-4 py-2.5 rounded-lg bg-accent-primary`}
                    >
                        <Text className={`font-semibold text-text-primary`}>
                            Open Dialog
                        </Text>
                    </Pressable>
                </Dialog.Trigger>

                <Dialog.Portal>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Dialog Title</Dialog.Title>
                            <Dialog.Description>
                                This is a description for the dialog. You can put any content you want here.
                            </Dialog.Description>
                        </Dialog.Header>

                        <View className="p-6">
                            <Text className="text-text-secondary">This is the main body content of the dialog.</Text>
                        </View>

                        <Dialog.Footer>
                            <Dialog.Close>
                                <Pressable
                                    className={`px-4 py-2.5 rounded-lg bg-accent-primary`}
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
                                <Text className={`font-semibold text-text-icon`}>
                                    Close
                                </Text>
                            </Pressable>
                        </Dialog.Footer>

                        {/* You can also use the default X button */}
                        <Dialog.Close />
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            <Button
                className="w-96 mt-6 bg-accent-primary px-6 py-4 rounded-2xl"
                onPress={() => router.push('/')}
                asChild
            >
                <Text className="text-white font-medium">Login</Text>
            </Button>
        </View>
    )
}

export default Components;

const styles = StyleSheet.create({});
