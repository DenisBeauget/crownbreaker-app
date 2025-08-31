import "@/global.css";
import { StravaSegment } from "@/types/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSegmentsContext } from "../contexts/SegmentsContext";

export default function Index() {
  const { segments, loading, error, refetch } = useSegmentsContext();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSegments, setSelectedSegments] = useState<Set<number>>(new Set());


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

 const toggleSegment = (segmentId: number) => {
  setSelectedSegments(prev => {
    const newSet = new Set(prev);
    if (newSet.has(segmentId)) {
      newSet.delete(segmentId);
    } else {
      newSet.add(segmentId);
    }
    return newSet;
  });
};


  const createOptimizedRoute = () => {
  const selectedArray = segments.filter(s => selectedSegments.has(s.id));
  if (selectedArray.length === 0) {
    Alert.alert("No selected segment", "Veuillez cocher au moins un segment.");
    return;
  }

  Alert.alert(
    "Créer une route", 
    `Créer une route optimisée avec ${selectedArray.length} segments :\n${selectedArray.map(s => s.name).join(", ")}`,
    [
      { text: "Annuler", style: "cancel" },
      { text: "Créer", onPress: () => console.log("Segments sélectionnés:", selectedArray) }
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
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-subheading flex-1 mr-2">
                    {index + 1}. {segment.name}
                  </Text>

                  {/* Checkbox */}
                  <TouchableOpacity 
                    onPress={() => toggleSegment(segment.id)}
                    className="flex-row items-center py-3"
                    activeOpacity={0.7}
                  >
                    <View 
                      style={{
                        width: 24,
                        height: 24,
                        borderWidth: 2,
                        borderColor: selectedSegments.has(segment.id) ? '#ef5717' : '#ccc',
                        backgroundColor: selectedSegments.has(segment.id) ? '#ef5717' : 'transparent',
                        borderRadius: 4,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 12
                      }}
                    >
                      {selectedSegments.has(segment.id) && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </View>
                  </TouchableOpacity>
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
          className={`py-4 rounded-lg flex-row items-center justify-center ${
      selectedSegments.size === 0 ? 'btn-primary-disabled' : 'btn-primary'
    }`}
          onPress={createOptimizedRoute}
          disabled={selectedSegments.size === 0}
        >
          <Text className="text-white font-medium text-center">
            {selectedSegments.size === 0 ? "Please select segment" : "🚀 Create optimized route"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}