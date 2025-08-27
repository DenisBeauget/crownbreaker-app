import KomOptimizer from "@/api/komOptimizer";
import "@/global.css";
import { StravaSegment } from "@/types/types";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function Index() {
  const [segments, setSegments] = useState<StravaSegment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStarredSegments();
  }, []);

  const loadStarredSegments = async () => {
    try {
      console.log("🔍 Chargement des segments starred...");
      const starredSegments = await KomOptimizer.getStarredSegments();
      console.log(`✅ ${starredSegments.length} segments trouvés`);
      setSegments(starredSegments);
    } catch (error) {
      console.error("❌ Erreur:", error);
      Alert.alert("Erreur", "Impossible de charger les segments");
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
      <Text className="text-heading">Mes Segments Starred</Text>
      
      {segments.length === 0 ? (
        <View className="card">
          <Text className="text-body">Aucun segment starred trouvé</Text>
        </View>
      ) : (
        <>
          {/* Header avec stats */}
          <View className="card-elevated mb-4">
            <Text className="text-subheading text-center">
              🏃‍♂️ {segments.length} segments détectés
            </Text>
            <Text className="text-caption text-center mt-1">
              Prêts pour l`&lsquooptimisation de route
            </Text>
          </View>
          
         {/* Carte Google Maps */}
          <View className="card-elevated mb-4" style={{ height: 300, overflow: 'hidden', borderRadius: 12 }}>
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
                  onPress={() => {
                    console.log("📍 Segment sélectionné sur la carte:", segment.name);
                  }}
                />
              ))}
            </MapView>
          </View>
          
          {/* Liste des segments */}
          <View className="flex-1">
            <Text className="text-subheading mb-3">📍 Segments disponibles</Text>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {segments.map((segment, index) => (
                <TouchableOpacity 
                  key={segment.id}
                  className="card mb-3 border-l-4 border-primary"
                  onPress={() => {
                    console.log("📍 Segment sélectionné:", segment.name);
                    Alert.alert(
                      segment.name,
                      `Distance: ${segment.distance}m\nDénivelé: ${segment.average_grade}%\nCoordonnées: ${segment.start_latlng[0].toFixed(4)}, ${segment.start_latlng[1].toFixed(4)}`
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
                        ⛰️ {segment.average_grade}%
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
                      Appuyer pour voir les détails
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
              onPress={() => {
                Alert.alert(
                  "Créer une route", 
                  `Créer une route optimisée avec ${segments.length} segments ?`,
                  [
                    { text: "Annuler", style: "cancel" },
                    { text: "Créer", onPress: () => console.log("🚀 Création de route...") }
                  ]
                );
              }}
            >
              <Text className="text-white font-medium text-center">
                🚀 Créer une route optimisée
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
