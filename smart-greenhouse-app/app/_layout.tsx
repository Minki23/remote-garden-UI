import { Stack } from "expo-router";
import { StatusBar, Platform } from "react-native";

export default function RootLayout() {
  const statusBarHeight = Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { marginTop: statusBarHeight }, // Adjust for status bar height
      }}
    />
  );
}