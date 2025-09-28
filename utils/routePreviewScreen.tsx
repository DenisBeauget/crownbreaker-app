import { RouteApiService } from "@/api/route";
import "@/global.css";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Share,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

interface RoutePreviewProps {
  visible: boolean;
  route: GeneratedRoute | null;
  onClose: () => void;
}

interface GeneratedRoute {
  routeId: string;
  totalDistance: number;
  totalDuration: number;
  segments: {
    id: string;
    name: string;
    distance: number;
    komTime: number | null;
    startPoint: {
      latitude: number;
      longitude: number;
    };
  }[];
  fullGeometry: {
    latitude: number;
    longitude: number;
    name?: string;
  }[];
  waypoints: {
    latitude: number;
    longitude: number;
    name?: string;
  }[];
}

export default function RoutePreviewScreen({
  visible,
  route,
  onClose,
}: RoutePreviewProps) {
  const [exportLoading, setExportLoading] = useState(false);
  const [showStats, setShowStats] = useState(true);

  if (!route) return null;

  const mapRegion = {
    latitude: route.fullGeometry[0]?.latitude || 45.764,
    longitude: route.fullGeometry[0]?.longitude || 4.835,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const handleExportGPX = async () => {
    setExportLoading(true);
    try {
      const gpxContent = await RouteApiService.exportRoute(route.routeId, "gpx");
      const fileName = `route_${route.routeId}.gpx`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, gpxContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/gpx+xml",
          dialogTitle: "Export GPX Route",
        });
      } else {
        Alert.alert("Success", `File saved to: ${fileUri}`);
      }
    } catch (error) {
      console.error("GPX export error:", error);
      Alert.alert("Error", "Unable to export route");
    } finally {
      setExportLoading(false);
    }
  };

  const handleShareRoute = async () => {
    try {
      await Share.share({
        message: `My optimized KOM route!\n\nDistance: ${Math.round(
          route.totalDistance / 1000
        )}km\nDuration: ${Math.round(
          route.totalDuration / 60
        )}min\nSegments: ${route.segments.length}\n\n#CrownBreaker #KOM #Strava`,
        title: "My Crownbreaker route !",
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
        <View className="flex-1 bg-neutral-light">
        <TouchableOpacity
              onPress={onClose}
              className="rounded-full bg-neutral-dark"
              style={{ 
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                margin: 6,
                position: 'absolute',
                zIndex: 10
              }}
            >
            <Ionicons name="close" size={25} color="#545c68" />
            </TouchableOpacity>
        <TouchableOpacity 
          onPress={handleShareRoute} 
          className="rounded-full bg-primary-light"
          style={{
            shadowColor: '#FC4C02',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
            margin: 6,
            padding: 4,
            position: 'absolute',
            right: 0,
            zIndex: 10
          }}
        >
          <MaterialCommunityIcons name="share-variant" size={25} color="#FC4C02" />
        </TouchableOpacity>
        {/* Header */}
        <View className="bg-white shadow-lg justify-center items-center" style={{ paddingTop: 20, paddingBottom: 20 }}>
          <View className="items-center justify-center px-6">
            <View className="items-center">
              <Text className="text-heading" style={{ fontSize: 20, fontWeight: '700' }}>Route Preview</Text>
              <Text className="text-caption" style={{ color: '#6b7280', marginTop: 2 }}>
                Your optimized adventure
              </Text>
            </View>
            <View style={{ width: 40 }} />
          </View>
        </View>


        {/* Map */}
        <View className="flex-1">
          <MapView
            style={{ flex: 1 }}
            initialRegion={mapRegion}
            showsUserLocation
            showsMyLocationButton
            showsCompass
            toolbarEnabled={false}
          >
            {/* Route polyline */}
            <Polyline
              coordinates={route.fullGeometry}
              strokeColor="#FC4C02"
              strokeWidth={4}
              lineCap="round"
              lineJoin="round"
            />

            {/* Start point */}
            <Marker
              coordinate={route.fullGeometry[0]}
              title="Start"
              description="Starting point of your route"
              pinColor="#28A745"
            />

            {/* Segment markers */}
            {route.segments.map((segment, index) => (
              <Marker
                key={segment.id}
                coordinate={segment.startPoint}
                title={`${index + 1}. ${segment.name}`}
                description={`${segment.distance}m - ${
                  segment.komTime
                    ? Math.round(segment.komTime / 60) + "min"
                    : "N/A"
                }`}
                pinColor="#FC4C02"
              />
            ))}

            {/* End point (if different from start) */}
            {route.fullGeometry.length > 1 && (
              <Marker
                coordinate={route.fullGeometry[route.fullGeometry.length - 1]}
                title="Finish"
                description="End point of your route"
                pinColor="#28A745"
              />
            )}
          </MapView>

          {/* Stats overlay */}
          {showStats && (
            <View className="absolute bottom-4 left-4 right-4">
              <View 
                className="card-elevated bg-white"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-3">
                      <MaterialCommunityIcons name="chart-line" size={16} color="white" />
                    </View>
                    <Text className="text-subheading">Route Statistics</Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowStats(false)}>
                    <MaterialCommunityIcons name="chevron-down" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                <View className="flex-row justify-between">
                  <View className="flex-1 items-center">
                    <View className="flex-row items-center mb-1">
                      <MaterialCommunityIcons name="map-marker-distance" size={16} color="#FC4C02" />
                      <Text className="text-2xl font-bold text-primary ml-1" style={{color: 'black'}}>
                        {Math.round(route.totalDistance / 1000)}
                      </Text>
                    </View>
                    <Text className="text-caption text-neutral-dark">kilometers</Text>
                  </View>

                  <View className="flex-1 items-center">
                    <View className="flex-row items-center mb-1">
                      <MaterialCommunityIcons name="clock-outline" size={16} color="#FC4C02" />
                      <Text className="text-2xl font-bold text-primary ml-1" style={{color: 'black'}}>
                        {Math.round(route.totalDuration / 60)}
                      </Text>
                    </View>
                    <Text className="text-caption text-neutral-dark">minutes</Text>
                  </View>

                  <View className="flex-1 items-center">
                    <View className="flex-row items-center mb-1">
                      <MaterialCommunityIcons name="flag-checkered" size={16} color="#FC4C02" />
                      <Text className="text-2xl font-bold text-primary ml-1" style={{color: 'black'}}>
                        {route.segments.length}
                      </Text>
                    </View>
                    <Text className="text-caption text-neutral-dark">segments</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Toggle stats button when hidden */}
          {!showStats && (
            <TouchableOpacity
              className="absolute bottom-4 right-4 w-14 h-14 bg-white rounded-full items-center justify-center"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 8
              }}
              onPress={() => setShowStats(true)}
            >
              <MaterialCommunityIcons name="chart-line" size={24} color="#FC4C02" />
            </TouchableOpacity>
          )}
        </View>

  

        {/* Actions */}
        <View className="p-4 bg-white border-t border-neutral-light" 
              style={{ 
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 8
              }}>
          <View className="flex-row" style={{ gap: 12 }}>
            <TouchableOpacity
              className="flex-1 py-3 px-4 bg-neutral-light rounded-xl flex-row items-center justify-center border-2 border-neutral-dark"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3
              }}
              onPress={() => {
                Alert.alert(
                  "Saved",
                  "Route saved to your routes! You can find it in 'My Routes'."
                );
              }}
            >
              <MaterialCommunityIcons name="bookmark-outline" size={18} color="#374151" />
              <Text className="text-neutral-darkest font-semibold ml-2">Save Route</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-3 px-4 rounded-xl flex-row items-center justify-center ${
                exportLoading ? "btn-primary-disabled" : "btn-primary"
              }`}
              style={{
                shadowColor: exportLoading ? 'transparent' : '#FC4C02',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: exportLoading ? 0 : 6,
              }}
              onPress={handleExportGPX}
              disabled={exportLoading}
            >
              {exportLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <MaterialCommunityIcons name="download" size={18} color="white" />
              )}
              <Text className="text-white font-semibold ml-2">
                {exportLoading ? "Exporting..." : "Export GPX"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}