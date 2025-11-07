import { Stack, Redirect } from "expo-router";

export const unstable_settings = {
  initialRouteName: "projects",
};

export default function PrivateLayout() {
  const isLoggedIn = true; // Replace with your auth state

  if (!isLoggedIn) {
    return <Redirect href="/(public)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
