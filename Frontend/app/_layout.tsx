import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, SplashScreen } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const colorScheme = useColorScheme();
  const { isInitialized } = useAuth();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Wait until both colorScheme and auth are initialized
    if (colorScheme && isInitialized) {
      setAppReady(true);
      SplashScreen.hideAsync();
    }
  }, [colorScheme, isInitialized]);

  if (!appReady) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
