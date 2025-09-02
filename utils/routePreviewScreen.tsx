import { RouteApiService } from "@/api/route";
import "@/global.css";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Share,
    Text,
    TouchableOpacity,
    View,
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
      Alert.alert(
        "Export GPX",
        "Feature temporarily disabled. Installing dependencies..."
      );

      const gpxContent = await RouteApiService.exportRoute(route.routeId, 'gpx');

        await Share.share({
        message: gpxContent,
        title: `route_${route.routeId}.gpx`,
      });
      
      /*const fileName = `route_${route.routeId}.gpx`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, gpxContent);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/gpx+xml',
          dialogTitle: 'Export GPX route'
        });
      } else {
        Alert.alert("Success", `Route exported to: ${fileUri}`);
      } */
    } catch (error) {
      console.error("GPX export error:", error);
      Alert.alert("Error", "Unable to export the route");
    } finally {
      setExportLoading(false);
    }
  };

  const handleShareRoute = async () => {
    try {
      await Share.share({
        message: `🚴 My optimized KOM route!\n\n📏 Distance: ${Math.round(
          route.totalDistance / 1000
        )}km\n⏱️ Duration: ${Math.round(
          route.totalDuration / 60
        )}min\n📍 ${route.segments.length} segments to conquer\n\n#CrownBreaker #KOM #Strava`,
        title: "My optimized KOM route",
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
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-white">
          <TouchableOpacity onPress={onClose} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold">Route Preview</Text>
          <TouchableOpacity onPress={handleShareRoute} className="p-2">
            <Ionicons name="share" size={24} color="#FC4C02" />
          </TouchableOpacity>
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
              <View className="card bg-white/95 backdrop-blur">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-subheading">📊 Stats</Text>
                  <TouchableOpacity onPress={() => setShowStats(false)}>
                    <Ionicons name="chevron-down" size={20} color="#666" />
                  </TouchableOpacity>
                </View>

                <View className="flex-row justify-between mb-2">
                  <View className="flex-1 items-center">
                    <Text className="text-2xl font-bold text-primary">
                      {Math.round(route.totalDistance / 1000)}
                    </Text>
                    <Text className="text-caption text-gray-600">km</Text>
                  </View>

                  <View className="flex-1 items-center">
                    <Text className="text-2xl font-bold text-primary">
                      {Math.round(route.totalDuration / 60)}
                    </Text>
                    <Text className="text-caption text-gray-600">min</Text>
                  </View>

                  <View className="flex-1 items-center">
                    <Text className="text-2xl font-bold text-primary">
                      {route.segments.length}
                    </Text>
                    <Text className="text-caption text-gray-600">segments</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Toggle stats button when hidden */}
          {!showStats && (
            <TouchableOpacity
              className="absolute bottom-4 right-4 bg-white rounded-full p-3 shadow-lg"
              onPress={() => setShowStats(true)}
            >
              <Ionicons name="stats-chart" size={24} color="#FC4C02" />
            </TouchableOpacity>
          )}
        </View>

        {/* Segments list */}
        <View className="max-h-48 border-t border-gray-200">
          <TouchableOpacity
            className="p-4 border-b border-gray-100"
            onPress={() => {
              /* TODO: Toggle list visibility */
            }}
          >
            <Text className="text-subheading text-center">
              📍 {route.segments.length} segments to conquer
            </Text>
          </TouchableOpacity>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {route.segments.map((segment, index) => (
              <View
                key={segment.id}
                className="flex-row items-center p-3 border-b border-gray-50"
              >
                <View className="w-6 h-6 rounded-full bg-primary items-center justify-center mr-3">
                  <Text className="text-white text-xs font-bold">
                    {index + 1}
                  </Text>
                </View>

                <View className="flex-1">
                  <Text className="font-medium" numberOfLines={1}>
                    {segment.name}
                  </Text>
                  <Text className="text-caption text-gray-600">
                    {segment.distance}m •{" "}
                    {segment.komTime
                      ? Math.round(segment.komTime / 60) + " min"
                      : "N/A"}
                  </Text>
                </View>

                <Ionicons name="flag" size={16} color="#FC4C02" />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Actions */}
        <View className="p-4 border-t border-gray-200 bg-white">
          <View className="flex-row space-x-3">
            <TouchableOpacity
              className="flex-1 py-3 px-4 bg-gray-100 rounded-lg flex-row items-center justify-center"
              onPress={() => {
                Alert.alert(
                  "Saved",
                  "Route saved to your routes! You can find it in 'My Routes'."
                );
              }}
            >
              <Ionicons name="bookmark" size={18} color="#666" />
              <Text className="text-gray-700 font-medium ml-2">Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-3 px-4 rounded-lg flex-row items-center justify-center ${
                exportLoading ? "btn-primary-disabled" : "btn-primary"
              }`}
              onPress={handleExportGPX}
              disabled={exportLoading}
            >
              {exportLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="download" size={18} color="white" />
              )}
              <Text className="text-white font-medium ml-2">
                {exportLoading ? "Exporting..." : "Export GPX"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
