import { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { theme } from "../constants/theme";



// Keep the native splash visible until fonts are ready.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Satoshi-Regular": require("../assets/fonts/Satoshi-Regular.ttf"),
    "Satoshi-Medium": require("../assets/fonts/Satoshi-Medium.ttf"),
    "Satoshi-Bold": require("../assets/fonts/Satoshi-Bold.ttf"),
  });

  useEffect(() => {
    // Hide the splash screen once fonts are ready (or if loading fails).
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Render nothing while fonts are loading to prevent a flash
  // of unstyled text. Font loading from local TTF files is near-instant.
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      />
    </SafeAreaProvider>
  );
}
