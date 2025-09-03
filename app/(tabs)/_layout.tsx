import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Platform, View } from 'react-native';


export default function TabLayout() {

    const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        try {
          setUser(JSON.parse(userStr));
        } catch (e) {
          console.error("Erreur parse user:", e);
        }
      }
    };
    loadUser();
  }, []);

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
         headerRight: () =>
          user?.avatar ? (
            <Image
              source={{ uri: user.avatar }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                marginRight: 15,
                marginTop: 8,
              }}
            />
          ) : (
            <View style={{ marginRight: 15 }}>
              <MaterialCommunityIcons name="account-circle" size={32} color="black" />
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
