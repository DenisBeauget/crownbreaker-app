import "@/global.css";
import { StravaSegment } from "@/types/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface RouteConfigurationProps {
  visible: boolean;
  selectedSegments: StravaSegment[];
  onClose: () => void;
  onGenerateRoute: (config: RouteConfig) => void;
  loading?: boolean;
}

interface RouteConfig {
  routeName: string;
  startPoint: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  profile: "bike" | "foot" | "moutainbike";
  goBack: boolean;
}

export default function RouteConfigurationScreen({
  visible,
  selectedSegments,
  onClose,
  onGenerateRoute,
  loading = false,
}: RouteConfigurationProps) {
  const [routeName, setRouteName] = useState("");
  const [profile, setProfile] = useState<"bike" | "foot" | "moutainbike">(
    "bike"
  );
  const [goBack, setGoBack] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [customStartPoint, setCustomStartPoint] = useState({
    latitude: "",
    longitude: "",
    name: "",
  });

  const profiles = [
    { key: "bike" as const, label: "🚴 Bike", icon: "bicycle" },
    { key: "foot" as const, label: "🚶 Walk", icon: "walk" },
    { key: "moutainbike" as const, label: "🚵 MTB", icon: "bicycle" },
  ];

  const handleGenerateRoute = () => {
    if (!routeName.trim()) {
      Alert.alert("Name required", "Please give your route a name");
      return;
    }

    let startPoint;
    if (useCurrentLocation) {
      // For now we use the first segment as start point
      // You can replace with GPS location later
      startPoint = {
        latitude: selectedSegments[0]?.start_latlng[0] || 45.764,
        longitude: selectedSegments[0]?.start_latlng[1] || 4.835,
        name: "Current position",
      };
    } else {
      if (!customStartPoint.latitude || !customStartPoint.longitude) {
        Alert.alert("Coordinates required", "Please enter valid coordinates");
        return;
      }
      startPoint = {
        latitude: parseFloat(customStartPoint.latitude),
        longitude: parseFloat(customStartPoint.longitude),
        name: customStartPoint.name || "Custom point",
      };
    }

    const config: RouteConfig = {
      routeName: routeName.trim(),
      startPoint,
      profile,
      goBack,
    };

    onGenerateRoute(config);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold">Configure Route</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Selected segments */}
          <View className="mb-6">
            <Text className="text-subheading mb-3">📍 Selected Segments</Text>
            <View className="card">
              <Text className="text-body text-center mb-2">
                {selectedSegments.length} segment
                {selectedSegments.length > 1 ? "s" : ""}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row"
              >
                {selectedSegments.map((segment, index) => (
                  <View
                    key={segment.id}
                    className="bg-gray-100 rounded-lg px-3 py-2 mr-2"
                  >
                    <Text
                      className="text-caption font-medium"
                      numberOfLines={1}
                    >
                      {index + 1}. {segment.name}
                    </Text>
                    <Text className="text-xs text-gray-600">
                      {segment.distance}m
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Route name */}
          <View className="mb-6">
            <Text className="text-subheading mb-2">🏷️ Route Name</Text>
            <TextInput
              className="card border border-gray-200"
              value={routeName}
              onChangeText={setRouteName}
              placeholder="My KOM Route..."
              maxLength={100}
            />
          </View>

          {/* Transport profile */}
          <View className="mb-6">
            <Text className="text-subheading mb-3">🚲 Mode of Transport</Text>
            <View className="flex-row justify-between">
              {profiles.map(({ key, label }) => (
                <TouchableOpacity
                  key={key}
                  className={`flex-1 mx-1 py-3 rounded-lg border-2 ${
                    profile === key
                      ? "border-primary bg-primary/10"
                      : "border-gray-200 bg-gray-50"
                  }`}
                  onPress={() => setProfile(key)}
                >
                  <Text
                    className={`text-center font-medium ${
                      profile === key ? "text-primary" : "text-gray-700"
                    }`}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Start point */}
          <View className="mb-6">
            <Text className="text-subheading mb-3">📍 Start Point</Text>

            <TouchableOpacity
              className={`flex-row items-center p-3 rounded-lg border-2 mb-3 ${
                useCurrentLocation
                  ? "border-primary bg-primary/10"
                  : "border-gray-200 bg-gray-50"
              }`}
              onPress={() => setUseCurrentLocation(true)}
            >
              <View
                className={`w-5 h-5 rounded-full border-2 mr-3 ${
                  useCurrentLocation
                    ? "border-primary bg-primary"
                    : "border-gray-400"
                }`}
              >
                {useCurrentLocation && (
                  <View className="w-full h-full bg-white rounded-full" />
                )}
              </View>
              <Text className="flex-1">
                Current position (or first segment)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-row items-center p-3 rounded-lg border-2 mb-3 ${
                !useCurrentLocation
                  ? "border-primary bg-primary/10"
                  : "border-gray-200 bg-gray-50"
              }`}
              onPress={() => setUseCurrentLocation(false)}
            >
              <View
                className={`w-5 h-5 rounded-full border-2 mr-3 ${
                  !useCurrentLocation
                    ? "border-primary bg-primary"
                    : "border-gray-400"
                }`}
              >
                {!useCurrentLocation && (
                  <View className="w-full h-full bg-white rounded-full" />
                )}
              </View>
              <Text className="flex-1">Custom point</Text>
            </TouchableOpacity>

            {!useCurrentLocation && (
              <View className="card border border-gray-200">
                <TextInput
                  className="mb-2 p-2 border border-gray-200 rounded"
                  value={customStartPoint.latitude}
                  onChangeText={(text) =>
                    setCustomStartPoint((prev) => ({ ...prev, latitude: text }))
                  }
                  placeholder="Latitude (ex: 45.764)"
                  keyboardType="numeric"
                />
                <TextInput
                  className="mb-2 p-2 border border-gray-200 rounded"
                  value={customStartPoint.longitude}
                  onChangeText={(text) =>
                    setCustomStartPoint((prev) => ({ ...prev, longitude: text }))
                  }
                  placeholder="Longitude (ex: 4.835)"
                  keyboardType="numeric"
                />
                <TextInput
                  className="p-2 border border-gray-200 rounded"
                  value={customStartPoint.name}
                  onChangeText={(text) =>
                    setCustomStartPoint((prev) => ({ ...prev, name: text }))
                  }
                  placeholder="Place name (optional)"
                />
              </View>
            )}
          </View>

          {/* Go back to start */}
          <View className="mb-6">
            <TouchableOpacity
              className="flex-row items-center justify-between p-3 card border border-gray-200"
              onPress={() => setGoBack(!goBack)}
            >
              <Text className="text-body flex-1">🔄 Return to start point</Text>
              <View
                className={`w-12 h-6 rounded-full p-1 ${
                  goBack ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <View
                  className={`w-4 h-4 bg-white rounded-full transition-all ${
                    goBack ? "ml-6" : "ml-0"
                  }`}
                />
              </View>
            </TouchableOpacity>
            <Text className="text-caption text-gray-600 mt-1">
              The route will automatically be calculated to return to the
              starting point
            </Text>
          </View>

          {/* Summary */}
          <View className="card bg-gray-50 mb-6">
            <Text className="text-subheading mb-2">📋 Summary</Text>
            <Text className="text-caption text-gray-700 mb-1">
              • {selectedSegments.length} segments to visit
            </Text>
            <Text className="text-caption text-gray-700 mb-1">
              • Mode: {profiles.find((p) => p.key === profile)?.label}
            </Text>
            <Text className="text-caption text-gray-700 mb-1">
              • Start: {useCurrentLocation ? "Current position" : "Custom point"}
            </Text>
            <Text className="text-caption text-gray-700">
              • {goBack ? "With" : "Without"} return to start point
            </Text>
          </View>
        </ScrollView>

        {/* Actions */}
        <View className="p-4 border-t border-gray-200">
          <TouchableOpacity
            className={`py-4 rounded-lg flex-row items-center justify-center ${
              loading ? "btn-primary-disabled" : "btn-primary"
            }`}
            onPress={handleGenerateRoute}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="map" size={20} color="white" />
            )}
            <Text className="text-white font-medium ml-2">
              {loading ? "Generating..." : "Generate Route"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
