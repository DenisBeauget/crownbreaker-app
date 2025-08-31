import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from "react";
import { useColorScheme } from "react-native";
import 'react-native-reanimated';
import WelcomeScreen from './auth';
import { SegmentsProvider } from './contexts/SegmentsContext';



export default function RootLayout() {
  const colorScheme = useColorScheme();
   const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleLoginSuccess = (token: string, user: any) => {
    setIsAuthenticated(true);
    setTimeout(() => {
      router.replace("/(tabs)");
    }, 100);
  };


 if (!isAuthenticated) {
    return (
      <WelcomeScreen onLoginSuccess={handleLoginSuccess} />
    );
  }



  return (
    <SegmentsProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SegmentsProvider>
  );
}
