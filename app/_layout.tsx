import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from "react";
import { useColorScheme } from "react-native";
import 'react-native-reanimated';
import WelcomeScreen from './auth';

export default function RootLayout() {
  const colorScheme = useColorScheme();
   const [isAuthenticated, setIsAuthenticated] = useState(false);


   if (!isAuthenticated) {
    return (
      <WelcomeScreen
        onLoginSuccess={() => setIsAuthenticated(true)}
      />
    );
  }



  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
