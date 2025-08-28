import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, useColorScheme, View } from 'react-native';


export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#ef5717",
        tabBarActiveBackgroundColor: "#ffffff",
        tabBarInactiveBackgroundColor: "#ffffff",
        headerShown: true,
        headerTitle: "CrownBreaker",
        headerStyle: {
          backgroundColor: '#ef5717', 
        },
        headerLeft: () => (
          <View style={{ marginLeft: 15, marginRight: 70}}>
            <MaterialCommunityIcons name="crown-outline" size={32} color="black" />
          </View>
        ),
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          }
        
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Segments',
           tabBarIcon: ({color, focused}) => (
                <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
            ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({color, focused}) => (
                <Ionicons name={focused ? 'search' : 'search-outline'} color={color} size={24} />
            ),
        }}
      />
    </Tabs>
  );
}
