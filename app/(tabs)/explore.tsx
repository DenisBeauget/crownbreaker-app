import "@/global.css";
import { useSegments } from "@/hooks/useSegments";
import { StravaSegment } from "@/types/types";
import React, { useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const { segments, loading, error, refetch } = useSegments();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const showSegmentDetails = (segment: StravaSegment, index: number) => {
    Alert.alert(
      segment.name,
      `Distance: ${segment.distance}m\nElevation: ${segment.average_grade}%\nCoordinates: ${segment.start_latlng[0].toFixed(4)}, ${segment.start_latlng[1].toFixed(4)}`
    );
  };

  const createOptimizedRoute = () => {
    Alert.alert(
      "Créer une route", 
      `Créer une route optimisée avec ${segments.length} segments ?`,
      [
        { text: "Annuler", style: "cancel" },
        { text: "Créer", onPress: () => console.log("Création de route...") }
      ]
    );
  };

  if (loading && segments.length === 0) {
    return (
      <View className="container-main">
        <Text className="text-heading">CrownBreaker</Text>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FC4C02" />
          <Text className="text-body mt-4">Chargement des segments...</Text>
        </View>
      </View>
    );
  }

  if (error && segments.length === 0) {
    return (
      <View className="container-main">
        <Text className="text-heading">CrownBreaker</Text>
        <View className="flex-1 justify-center items-center">
          <Text className="text-body text-red-500 text-center mb-4">{error}</Text>
          <TouchableOpacity className="btn-primary" onPress={refetch}>
            <Text className="text-white text-center font-medium">Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (segments.length === 0) {
    return (
      <View className="container-main">
        <Text className="text-heading">CrownBreaker</Text>
        <View className="flex-1 justify-center items-center">
          <Text className="text-body">Aucun segment starred trouvé</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="container-main">
      {/* Liste des segments */}
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-subheading">📍 Segments disponibles</Text>
          <Text className="text-caption text-gray-600">
            {segments.length} segment{segments.length > 1 ? 's' : ''}
          </Text>
        </View>
        
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={["#FC4C02"]}
              tintColor="#FC4C02"
            />
          }
        >
          {segments.map((segment, index) => (
            <TouchableOpacity 
              key={segment.id}
              className="card mb-3 border-l-4 border-primary"
              onPress={() => showSegmentDetails(segment, index)}
            >
              {/* Header du segment */}
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-subheading flex-1 mr-2">
                  {index + 1}. {segment.name}
                </Text>
                <View className="badge-primary">
                  <Text className="text-white text-xs">★</Text>
                </View>
              </View>
              
              {/* Stats du segment */}
              <View className="flex-row justify-between mb-2">
                <View className="flex-row items-center">
                  <Text className="text-caption mr-4">
                    📏 {segment.distance}m
                  </Text>
                  <Text className="text-caption">
                    ⛰️ {Math.round(segment.elevation_high - segment.elevation_low)}m
                  </Text>
                </View>
                <Text className="text-caption">
                  📈 {segment.average_grade}%
                </Text>
              </View>
              
              {/* Coordonnées */}
              <Text className="text-caption">
                📍 {segment.start_latlng[0].toFixed(4)}, {segment.start_latlng[1].toFixed(4)}
              </Text>
              
              {/* Action hint */}
              <View className="mt-2 pt-2 border-t border-neutral-light">
                <Text className="text-primary-brand text-xs text-center">
                  Press to see details
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          
          {/* Bottom spacer */}
          <View className="h-4" />
        </ScrollView>
      </View>
      
      {/* Action button */}
      <View className="mt-4">
        <TouchableOpacity 
          className="btn-primary"
          onPress={createOptimizedRoute}
        >
          <Text className="text-white font-medium text-center">
            🚀 Créer une route optimisée
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}