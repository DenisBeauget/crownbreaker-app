import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, LogBox, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {



LogBox.ignoreAllLogs(false);


const originalConsoleError = console.error;
console.error = (...args) => {
  Alert.alert('ERROR', JSON.stringify(args));
  originalConsoleError(...args);
};

  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/auth" />;
}