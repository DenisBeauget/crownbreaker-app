import { GeneratedRoute, RouteApiService } from "@/api/route";
import "@/global.css";
import { StravaSegment } from "@/types/types";
import RouteConfigurationScreen from "@/utils/routeConfigScreen";
import RoutePreviewScreen from "@/utils/routePreviewScreen";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSegmentsContext } from "../../contexts/SegmentsContext";

export default function Index() {
  const { segments, loading, error, refetch } = useSegmentsContext();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSegments, setSelectedSegments] = useState<Set<number>>(new Set());
  
  // États pour les modals
  const [showRouteConfig, setShowRouteConfig] = useState(false);
  const [showRoutePreview, setShowRoutePreview] = useState(false);
  const [generatedRoute, setGeneratedRoute] = useState<GeneratedRoute | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

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
      Alert.alert("No selected segment", "Please select at least one segment.");
      return;
    }

    // Ouvrir le modal de configuration
    setShowRouteConfig(true);
  };

  const handleGenerateRoute = async (config: any) => {
    const selectedArray = segments.filter(s => selectedSegments.has(s.id));
    
    setRouteLoading(true);
    
    try {
      const result = await RouteApiService.generateRoute(config, selectedArray);
      
      setShowRouteConfig(false);
      setGeneratedRoute(result);
      setShowRoutePreview(true);
      
    } catch (error) {
      console.error("Erreur génération route:", error);
      Alert.alert(
        "Error", 
        error instanceof Error ? error.message : "Unable to generate route"
      );
    } finally {
      setRouteLoading(false);
    }
  };

  if (loading && segments.length === 0) {
    return (
      <View className="container-main">
        <Text className="text-heading">CrownBreaker</Text>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FC4C02" />
          <Text className="text-body mt-4">Loading segments...</Text>
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
            <Text className="text-white text-center font-medium">Retry</Text>
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
          <Text className="text-body">No starred segments found</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="container-main">
      {/* Header Section */}
      <View className="mb-6">
        <View className="flex-row items-center justify-center mb-2">
          <Text className="text-heading ml-2" style={{ fontSize: 24, fontWeight: '700', color: '#1a1a1a' }}>
            Available Segments
          </Text>
        </View>
        
        {/* Sous-titre et compteur */}
        <View className="flex-row items-center justify-center">
          <Text className="text-caption text-center" style={{ color: '#6b7280' }}>
            Select segments to create your optimal route
          </Text>
        </View>
        
        <View className="flex-row items-center justify-center mt-2">
          <View className="bg-primary-light px-3 py-1 rounded-full">
            <Text className="text-primary text-sm font-medium">
              {segments.length} segment{segments.length > 1 ? 's' : ''} • {selectedSegments.size} selected
            </Text>
          </View>
        </View>
      </View>

      {/* Liste des segments */}
      <View className="flex-1">        
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
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
              className={`bg-white rounded-xl mb-3 border ${
                selectedSegments.has(segment.id) ? 'border-primary bg-primary-light' : 'border-neutral-light'
              }`}
              style={{ 
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                paddingHorizontal: 16,
                paddingVertical: 12
              }}
              activeOpacity={0.7}
            >
              {/* Header avec nom et checkbox */}
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-1 mr-3">
                  <Text 
                    className="font-semibold" 
                    style={{ fontSize: 16, color: '#1f2937' }}
                    numberOfLines={1}
                  >
                    {index + 1}. {segment.name}
                  </Text>
                </View>

                {/* Checkbox */}
                <TouchableOpacity 
                  onPress={() => toggleSegment(segment.id)}
                  className="flex-row items-center py-3"
                  activeOpacity={0.7}
                >
                  <View 
                    style={{
                      width: 22,
                      height: 22,
                      borderWidth: 2,
                      borderColor: selectedSegments.has(segment.id) ? '#FC4C02' : '#d1d5db',
                      backgroundColor: selectedSegments.has(segment.id) ? '#FC4C02' : 'transparent',
                      borderRadius: 6,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12
                    }}
                  >
                    {selectedSegments.has(segment.id) && (
                      <Ionicons name="checkmark" size={14} color="white" />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
              
              {/* Stats compactes avec icônes */}
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center" style={{ gap: 12 }}>
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons name="ruler" size={14} color="#6b7280" />
                    <Text className="text-sm ml-1" style={{ color: '#6b7280' }}>
                      {Math.round(segment.distance)}m
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center mr-4">
                    <MaterialCommunityIcons name="elevation-rise" size={14} color="#6b7280" />
                    <Text className="text-sm ml-1" style={{ color: '#6b7280' }}>
                      {Math.round(segment.elevation_high - segment.elevation_low)}m
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons name="trending-up" size={14} color="#6b7280" />
                    <Text className="text-sm ml-1" style={{ color: '#6b7280' }}>
                      {segment.average_grade}%
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Action button fixe */}
      <View className="mt-4 pt-4 border-t border-neutral-light">
        <TouchableOpacity 
          className={`flex-row items-center justify-center py-4 rounded-xl ${
            selectedSegments.size === 0 ? 'btn-primary-disabled' : 'btn-primary'
          }`}
          style={{
            shadowColor: selectedSegments.size > 0 ? '#FC4C02' : 'transparent',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: selectedSegments.size > 0 ? 6 : 0,
          }}
          onPress={createOptimizedRoute}
          disabled={selectedSegments.size === 0}
        >
          <Text className={`font-semibold text-center ml-2 ${
            selectedSegments.size === 0 ? 'text-neutral' : 'text-white'
          }`}>
            {selectedSegments.size === 0 
              ? "Select segments to continue" 
              : `Create route (${selectedSegments.size})`
            }
          </Text>
        </TouchableOpacity>
      </View>

      {/* Route Configuration Modal */}
      <RouteConfigurationScreen
        visible={showRouteConfig}
        selectedSegments={segments.filter(s => selectedSegments.has(s.id))}
        onClose={() => setShowRouteConfig(false)}
        onGenerateRoute={handleGenerateRoute}
        loading={routeLoading}
      />

      {/* Route Preview Modal */}
      <RoutePreviewScreen
        visible={showRoutePreview}
        route={generatedRoute}
        onClose={() => {
          setShowRoutePreview(false);
          setGeneratedRoute(null);
        }}
      />
    </View>
  );
}