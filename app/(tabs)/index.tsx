import KomOptimizer from "@/api/komOptimizer";
import "@/global.css";
import { StravaSegment } from "@/types/types";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function Index() {
  const [segments, setSegments] = useState<StravaSegment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStarredSegments();
  }, []);

  const loadStarredSegments = async () => {
    try {
      console.log("Loading segments...");
      const starredSegments = await KomOptimizer.getStarredSegments();
     console.log(`${starredSegments.length} segments trouvés`);
      setSegments(starredSegments);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="container-main">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FC4C02" />
          <Text className="text-body mt-4">Loading segments...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="container-main">
      
       {segments.length === 0 ? (
    <View className="card">
      <Text className="text-body">Aucun segment starred trouvé</Text>
    </View>
  ) : (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
    <>
      {/* Header principal */}
      <View className="mb-6">
        <Text className="text-heading mb-2">Your Starred Segments</Text>
        <Text className="text-caption text-center">
          Discover all your favorite challenges
        </Text>
      </View>

      {/* Stats cards en ligne */}
      <View className="flex-row mb-4 gap-5 px-1">
        <View className="card-elevated flex-1 items-center justify-center mr-3">
         <MaterialIcons name="numbers" size={24} color="#e3360b" />
          <Text className="text-subheading text-center text-primary">
            {segments.length}
          </Text>
          <Text className="text-caption mt-1" style={{ textAlign: 'center' }}>
            Segments
          </Text>
        </View>
       <View className="card-elevated flex-1 items-center justify-center mr-3">
          <MaterialCommunityIcons name="map-marker-distance" size={24} color="#e3360b" className="mb-2" />
          <Text className="text-subheading text-center text-primary">
            {Math.round(segments.reduce((sum, s) => sum + s.distance, 0) / 1000)}km
          </Text>
          <Text className="text-caption mt-1" style={{ textAlign: 'center' }}>
            Distance
          </Text>
        </View>
        <View className="card-elevated flex-1 items-center justify-center">
          <MaterialCommunityIcons name="elevation-rise" size={24} color="#e3360b" />
          <Text className="text-subheading text-center text-primary">
            {Math.round(segments.reduce((sum, s) => sum + (s.elevation_high - s.elevation_low), 0))}m
          </Text>
          <Text className="text-caption mt-1" style={{ textAlign: 'center' }}>
           Elevation
          </Text>
        </View>
      </View>
      
      {/* Google Maps avec titre */}
      <View className="mb-4">
        <View className="flex-row items-center mb-4">
          <FontAwesome name="map-signs" size={18} color="black" className="mr-3 ml-3" />
          <Text className="text-subheading">Map View</Text>
        </View>
        
        <View className="card" style={{ height: 400, overflow: 'hidden', borderRadius: 12 }}>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: segments[0]?.start_latlng[0] || 45.764,
              longitude: segments[0]?.start_latlng[1] || 4.835,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
            showsUserLocation
            showsMyLocationButton
            showsCompass
            toolbarEnabled={false}
          >
            {segments.map((segment, index) => (
              <Marker
                key={segment.id}
                coordinate={{
                  latitude: segment.start_latlng[0],
                  longitude: segment.start_latlng[1],
                }}
                title={`${index + 1}. ${segment.name}`}
                description={`${segment.distance}m - ${segment.average_grade}% - ⭐ Starred`}
                pinColor="#FC4C02"
              />
            ))}
          </MapView>
        </View>
      </View>

      {/* Explore (to do) */}
      <View className="flex-row gap-2 mb-4">
        <TouchableOpacity className="btn-primary flex-1"
        
         onPress={() => router.push('/(tabs)/explore')}>
          <Text className="text-white text-center font-medium">
            🚀 Let&apos;s plan a ride
          </Text>
        </TouchableOpacity>
      </View>
     
    </>
     </ScrollView>
  )}
    </View>
  );
}
