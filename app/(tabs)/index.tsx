import { default as komOptimizer } from "@/api/komOptimizer";
import "@/global.css";
import { decodePolyline } from '@/utils/polyline';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useSegmentsContext } from "../contexts/SegmentsContext";

export default function Index() {
  const { segments, loading, error, refetch } = useSegmentsContext();
  const [selectedSegmentId, setSelectedSegmentId] = useState<number | null>(null);
  const [loadingSegment, setLoadingSegment] = useState(false);
  const [segmentDetails, setSegmentDetails] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const handleMarkerPress = async (segmentId: number) => {
    if (selectedSegmentId === segmentId) {
      setSelectedSegmentId(null);
      setSegmentDetails(null);
      return;
    }

    setLoadingSegment(true);
    try {
      setSelectedSegmentId(segmentId);
      const details = await komOptimizer.getSegmentDetails(segmentId);
      setSegmentDetails(details);
    } catch (error) {
      console.error('Error loading segment details:', error);
      setSelectedSegmentId(null);
      setSegmentDetails(null);
    } finally {
      setLoadingSegment(false);
    }
  };

  const getSegmentCoordinates = () => {
    if (segmentDetails?.map?.polyline) {
      return decodePolyline(segmentDetails.map.polyline);
    }
    return [];
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
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

   if (error && segments.length === 0) {
    return (
      <View className="container-main">
        <View className="flex-1 justify-center items-center">
          <Text className="text-body text-red-500 text-center mb-4">{error}</Text>
          <TouchableOpacity className="btn-primary" onPress={refetch}>
            <Text className="text-white text-center font-medium">Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
     <View className="container-main">
      {segments.length === 0 ? (
        <View className="card">
          <Text className="text-body">No favorites segmentts found</Text>
        </View>
      ) : (
        <View className="flex-1">
          {/* Section scrollable (header + stats) */}
          <ScrollView 
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
            {/* Header principal */}
            <View className="mb-4">
              <Text className="text-caption-big text-center"  style={{ textAlign: 'center', width: '100%', marginBottom: 10}}>
                Discover all your favorite challenges
              </Text>
            </View>

            {/* Stats cards en ligne */}
            <View className="flex-row gap-5 px-1">
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
          </ScrollView>
          
          {/* Google Maps - Section fixe */}
          <View className="mb-8">
            <View className="flex-row items-center mb-2 px-4">
              {loadingSegment && (
                <ActivityIndicator size="small" color="#FC4C02" className="ml-2" />
              )}
            </View>
            
            <View className="card" style={{ height: 350, overflow: 'hidden', borderRadius: 12, marginBottom: 24 }}>
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
                    description={`${segment.distance}m - ${segment.average_grade}%`}
                    pinColor={selectedSegmentId === segment.id ? "#FC4C02" : "#FF6B6B"}
                    onPress={() => handleMarkerPress(segment.id)}
                  />
                ))}

                {segmentDetails && (
                  <>
                    <Polyline
                      coordinates={getSegmentCoordinates()}
                      strokeColor="#FC4C02"
                      strokeWidth={4}
                    />

                    {segmentDetails.end_latlng && (
                      <Marker
                        coordinate={{
                          latitude: segmentDetails.end_latlng[0],
                          longitude: segmentDetails.end_latlng[1],
                        }}
                        title={`Fin: ${segmentDetails.name}`}
                        description={`End of segment`}
                        pinColor="#28A745"
                        identifier="segment-end"
                      />
                    )}
                  </>
                )}
              </MapView>
            </View>
          </View>



              <TouchableOpacity className="btn-primary items-center justify-center" onPress={() => router.replace('/explore')}>
                <Text className="text-white text-center font-medium">
                  🚀 Let&apos;s plan a ride
                </Text>
              </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
