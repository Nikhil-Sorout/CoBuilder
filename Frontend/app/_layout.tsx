import {DarkTheme, DefaultTheme, ThemeProvider} from "@react-navigation/native";
import { Stack, SplashScreen } from "expo-router";
import {useColorScheme} from "@/hooks/use-color-scheme";
import { useState, useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  const colorScheme = useColorScheme();
  
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Wait until systemScheme is resolved (not null/undefined)
    if (colorScheme) {
      setReady(true);
      SplashScreen.hideAsync();
    }
  }, [colorScheme]);

  if (!ready) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{headerShown: false}} />
    </ThemeProvider>
  ) 
  ;
}
