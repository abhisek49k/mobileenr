import { Stack, Redirect } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'projects',
};

export default function PrivateLayout() {
  const isLoggedIn = false; // Replace with real auth state

  if (!isLoggedIn) {
    return <Redirect href="(public)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1E6AB4' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
  );
}
