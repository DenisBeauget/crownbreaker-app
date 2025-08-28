import KomOptimizer from "@/api/komOptimizer";
import "@/global.css";

import { StravaSegment } from "@/types/types";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Index() {

    const [segments, setSegments] = useState<StravaSegment[]>([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      loadStarredSegments();
    }, []);



  const loadStarredSegments = async () => {
      try {
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
          <Text className="text-heading">CrownBreaker</Text>
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#FC4C02" />
            <Text className="text-body mt-4">Chargement des segments...</Text>
          </View>
        </View>
      );
    }
  
  return (
<View className="container-main">
      {/* Liste des segments */}
          <View className="flex-1">
            <Text className="text-subheading mb-3">📍 Segments disponibles</Text>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {segments.map((segment, index) => (
                <TouchableOpacity 
                  key={segment.id}
                  className="card mb-3 border-l-4 border-primary"
                  onPress={() => {
                    Alert.alert(
                      segment.name,
                      `Distance: ${segment.distance}m\nElevation: ${segment.average_grade}%\nCoordinates: ${segment.start_latlng[0].toFixed(4)}, ${segment.start_latlng[1].toFixed(4)}`
                    );
                  }}
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
                        ⛰️ {Math.round(segments.reduce((sum, s) => sum + (s.elevation_high - s.elevation_low), 0))}m
                      </Text>
                    </View>
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
          
          {/* Action button (dont like it, to do)*/}
          <View className="mt-4">
            <TouchableOpacity 
              className="btn-primary"
              onPress={() => {
                Alert.alert(
                  "Créer une route", 
                  `Créer une route optimisée avec ${segments.length} segments ?`,
                  [
                    { text: "Annuler", style: "cancel" },
                    { text: "Créer", onPress: () => console.log("Création de route...") }
                  ]
                );
              }}
            >
              <Text className="text-white font-medium text-center">
                🚀 Créer une route optimisée
              </Text>
            </TouchableOpacity>
          </View>
</View>
  );
}
