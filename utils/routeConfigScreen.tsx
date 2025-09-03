import "@/global.css"
import type { StravaSegment } from "@/types/types"
import Ionicons from "@expo/vector-icons/Ionicons"
import Constants from "expo-constants"
import React, { useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native"

interface RouteConfigurationProps {
  visible: boolean
  selectedSegments: StravaSegment[]
  onClose: () => void
  onGenerateRoute: (config: RouteConfig) => void
  loading?: boolean
}

interface RouteConfig {
  routeName: string
  startPoint: {
    latitude: number
    longitude: number
    name?: string
  }
  profile: "bike" | "foot" | "moutainbike"
  goBack: boolean
}

interface PlacePrediction {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

export default function RouteConfigurationScreen({
  visible,
  selectedSegments,
  onClose,
  onGenerateRoute,
  loading = false,
}: RouteConfigurationProps) {
  const [routeName, setRouteName] = useState("")
  const [profile, setProfile] = useState<"bike" | "foot" | "moutainbike">("bike")
  const [goBack, setGoBack] = useState(false)
  const [startPointMode, setStartPointMode] = useState<"current" | "address" | "coordinates">("current")
  const [addressInput, setAddressInput] = useState("")
  const [customStartPoint, setCustomStartPoint] = useState({
    latitude: "",
    longitude: "",
    name: "",
  })
  const [addressLoading, setAddressLoading] = useState(false)
  const [predictions, setPredictions] = useState<PlacePrediction[]>([])
  const [showPredictions, setShowPredictions] = useState(false)
  const autocompleteTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const profiles = [
    { key: "bike" as const, label: "🚴 Bike", icon: "bicycle" },
    { key: "foot" as const, label: "🚶 Walk", icon: "walk" },
    { key: "moutainbike" as const, label: "🚵 MTB", icon: "bicycle" },
  ]

  // Get autocomplete predictions from Google Places API
  const getPlacePredictions = async (input: string) => {
    if (input.length < 2) {
      setPredictions([])
      setShowPredictions(false)
      return
    }

    try {
      const GOOGLE_MAPS_API_KEY =
        Constants.expoConfig?.ios?.config?.googleMapsApiKey || Constants.expoConfig?.android?.config?.googleMaps?.apiKey
      if (!GOOGLE_MAPS_API_KEY) return

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_API_KEY}`,
      )
      const data = await response.json()

      if (data.status === "OK" && data.predictions) {
        setPredictions(data.predictions.slice(0, 5)) // Limit to 5 suggestions
        setShowPredictions(true)
      } else {
        setPredictions([])
        setShowPredictions(false)
      }
    } catch (error) {
      console.error("Autocomplete error:", error)
      setPredictions([])
      setShowPredictions(false)
    }
  }

  // Get place details from place_id
  const getPlaceDetails = async (placeId: string) => {
    setAddressLoading(true)
    try {
      const GOOGLE_MAPS_API_KEY =
        Constants.expoConfig?.ios?.config?.googleMapsApiKey || Constants.expoConfig?.android?.config?.googleMaps?.apiKey
      if (!GOOGLE_MAPS_API_KEY) {
        throw new Error("Google Maps API key not configured")
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address&key=${GOOGLE_MAPS_API_KEY}`,
      )
      const data = await response.json()

      if (data.status === "OK" && data.result) {
        return {
          latitude: data.result.geometry.location.lat,
          longitude: data.result.geometry.location.lng,
          name: data.result.formatted_address,
        }
      } else {
        throw new Error(data.error_message || "Place details failed")
      }
    } catch (error) {
      console.error("Place details error:", error)
      Alert.alert("Error", error instanceof Error ? error.message : "Could not get place details")
      return null
    } finally {
      setAddressLoading(false)
    }
  }

  // Handle address input change with debouncing
  const handleAddressInputChange = (text: string) => {
    setAddressInput(text)
    if (autocompleteTimeout.current) {
      clearTimeout(autocompleteTimeout.current)
    }


    autocompleteTimeout.current = setTimeout(() => {
      getPlacePredictions(text)
    }, 300) // 300ms debounce
  }


  const handlePredictionSelect = (prediction: PlacePrediction) => {
    setAddressInput(prediction.description)
    setShowPredictions(false)
    setPredictions([])
    Keyboard.dismiss()
  }


  const geocodeAddress = async (address: string) => {
    setAddressLoading(true)
    try {
      const GOOGLE_MAPS_API_KEY =
        Constants.expoConfig?.ios?.config?.googleMapsApiKey || Constants.expoConfig?.android?.config?.googleMaps?.apiKey

      if (!GOOGLE_MAPS_API_KEY) {
        throw new Error("Google Maps API key not configured")
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`,
      )
      const data = await response.json()

      if (data.status === "OK" && data.results && data.results.length > 0) {
        const result = data.results[0]
        return {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          name: result.formatted_address,
        }
      } else if (data.status === "ZERO_RESULTS") {
        throw new Error("Address not found")
      } else if (data.status === "REQUEST_DENIED") {
        throw new Error("API key issue")
      } else {
        throw new Error(data.error_message || "Geocoding failed")
      }
    } catch (error) {
      console.error("Geocoding error:", error)
      Alert.alert("Error", error instanceof Error ? error.message : "Could not find this address")
      return null
    } finally {
      setAddressLoading(false)
    }
  }

  const handleGenerateRoute = async () => {
    if (!routeName.trim()) {
      Alert.alert("Name required", "Please give your route a name")
      return
    }

    let startPoint

    if (startPointMode === "current") {
      // Use current position or first segment
      startPoint = {
        latitude: selectedSegments[0]?.start_latlng[0] || 45.764,
        longitude: selectedSegments[0]?.start_latlng[1] || 4.835,
        name: "Current position",
      }
    } else if (startPointMode === "address") {
      if (!addressInput.trim()) {
        Alert.alert("Address required", "Please enter an address")
        return
      }

      const geocodedPoint = await geocodeAddress(addressInput.trim())
      if (!geocodedPoint) {
        return 
      }
      startPoint = geocodedPoint
    } else {
      // Coordinates mode
      if (!customStartPoint.latitude || !customStartPoint.longitude) {
        Alert.alert("Coordinates required", "Please enter valid coordinates")
        return
      }
      startPoint = {
        latitude: Number.parseFloat(customStartPoint.latitude),
        longitude: Number.parseFloat(customStartPoint.longitude),
        name: customStartPoint.name || "Custom point",
      }
    }

    const config: RouteConfig = {
      routeName: routeName.trim(),
      startPoint,
      profile,
      goBack,
    }

    onGenerateRoute(config)
  }


  React.useEffect(() => {
    if (startPointMode !== "address") {
      setShowPredictions(false)
      setPredictions([])
    }
  }, [startPointMode])

  React.useEffect(() => {
    if (!visible) {
      setShowPredictions(false)
      setPredictions([])
    }
  }, [visible])

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-neutral-light">
        <View className="bg-white border-b-2 border-primary/20 shadow-sm">
          <View className="flex-row items-center justify-between p-6 pt-12">
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-neutral-light items-center justify-center"
            >
              <Ionicons name="close" size={20} color="#545c68" />
            </TouchableOpacity>
            <Text className="text-heading text-center">Configure Route</Text>
            <View style={{ width: 40 }} />
          </View>
        </View>

        <ScrollView className="flex-1 px-4 py-6" keyboardShouldPersistTaps="handled">
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3">
                <Text className="text-lg">📍</Text>
              </View>
              <Text className="text-subheading text-neutral-darkest">Selected Segments</Text>
            </View>
            <View className="card-elevated">
              <View className="flex-row items-center justify-center mb-3">
                <View className="badge-primary">
                  <Text className="text-white font-semibold">
                    {selectedSegments.length} segment{selectedSegments.length > 1 ? "s" : ""}
                  </Text>
                </View>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {selectedSegments.map((segment, index) => (
                  <View
                    key={segment.id}
                    className="bg-secondary/10 border border-secondary/20 rounded-xl px-4 py-3 mr-3 min-w-32"
                  >
                    <Text className="text-caption font-semibold text-neutral-darkest mb-1" numberOfLines={1}>
                      {index + 1}. {segment.name}
                    </Text>
                    <Text className="text-xs text-secondary font-medium">{segment.distance}m</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>

          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3">
                <Text className="text-lg">🏷️</Text>
              </View>
              <Text className="text-subheading text-neutral-darkest">Route Name</Text>
            </View>
            <View className="card">
              <TextInput
                className="input-field text-body"
                value={routeName}
                onChangeText={setRouteName}
                placeholder="My KOM Route..."
                placeholderTextColor="#545c68"
                maxLength={100}
              />
            </View>
          </View>

          <View className="mb-8">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3">
              <Text className="text-lg">🚲</Text>
            </View>
            <Text className="text-subheading text-neutral-darkest">Mode of Transport</Text>
          </View>

          <View className="flex-row justify-between">
            {profiles.map(({ key, label }) => {
              const isSelected = profile === key;
              return (
                <TouchableOpacity
                  key={key}
                  className={`flex-1 mx-1 py-4 rounded-xl border-2 ${
                    isSelected
                      ? "border-primary bg-primary/20 shadow-md"
                      : "border-neutral-dark/20 bg-white"
                  }`}
                  onPress={() => setProfile(key)}
                >
                  <Text
                    className={`text-center font-semibold ${
                      isSelected ? "text-primary" : "text-neutral-dark"
                    }`}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3">
                <Text className="text-lg">📍</Text>
              </View>
              <Text className="text-subheading text-neutral-darkest">Start Point</Text>
            </View>

            <View className="card space-y-3">
              <TouchableOpacity
                className={`flex-row items-center p-4 rounded-xl border-2 ${
                  startPointMode === "current"
                    ? "border-primary bg-primary/5"
                    : "border-neutral-dark/10 bg-neutral-light/50"
                }`}
                onPress={() => setStartPointMode("current")}
              >
                <View
                  className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${
                    startPointMode === "current" ? "border-primary bg-primary" : "border-neutral-dark/30"
                  }`}
                >
                  {startPointMode === "current" && <View className="w-2 h-2 bg-white rounded-full" />}
                </View>
                <Text className="flex-1 text-body text-neutral-darkest font-medium">
                  Current position (or first segment)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-row items-center p-4 rounded-xl border-2 ${
                  startPointMode === "address"
                    ? "border-primary bg-primary/5"
                    : "border-neutral-dark/10 bg-neutral-light/50"
                }`}
                onPress={() => setStartPointMode("address")}
              >
                <View
                  className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${
                    startPointMode === "address" ? "border-primary bg-primary" : "border-neutral-dark/30"
                  }`}
                >
                  {startPointMode === "address" && <View className="w-2 h-2 bg-white rounded-full" />}
                </View>
                <Text className="flex-1 text-body text-neutral-darkest font-medium">Enter an address</Text>
              </TouchableOpacity>
            </View>

            {startPointMode === "address" && (
              <View className="relative mt-4">
                <View className="card">
                  <View className="flex-row items-center">
                    <TextInput
                      className="flex-1 input-field"
                      value={addressInput}
                      onChangeText={handleAddressInputChange}
                      placeholder="Ex: 123 Main Street, New York, NY"
                      placeholderTextColor="#545c68"
                      multiline={false}
                    />
                    {addressLoading && <ActivityIndicator size="small" color="#e3360b" style={{ marginLeft: 12 }} />}
                  </View>
                  <Text className="text-caption text-secondary mt-2">Start typing for suggestions...</Text>
                </View>

                {showPredictions && predictions.length > 0 && (
                  <View className="absolute top-full left-0 right-0 z-10 card-elevated mt-2">
                  <ScrollView style={{ maxHeight: 200 }}>
                      {predictions.map((item) => (
                        <TouchableOpacity
                          key={item.place_id}
                          className="p-4 border-b border-neutral-light/50 last:border-b-0"
                          onPress={() => handlePredictionSelect(item)}
                        >
                          <Text className="font-semibold text-neutral-darkest mb-1">
                            {item.structured_formatting.main_text}
                          </Text>
                          <Text className="text-caption text-neutral-dark">
                            {item.structured_formatting.secondary_text}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}

            {startPointMode === "coordinates" && (
              <View className="card mt-4 space-y-3">
                <TextInput
                  className="input-field"
                  value={customStartPoint.latitude}
                  onChangeText={(text) => setCustomStartPoint((prev) => ({ ...prev, latitude: text }))}
                  placeholder="Latitude (ex: 45.764)"
                  placeholderTextColor="#545c68"
                  keyboardType="numeric"
                />
                <TextInput
                  className="input-field"
                  value={customStartPoint.longitude}
                  onChangeText={(text) => setCustomStartPoint((prev) => ({ ...prev, longitude: text }))}
                  placeholder="Longitude (ex: 4.835)"
                  placeholderTextColor="#545c68"
                  keyboardType="numeric"
                />
                <TextInput
                  className="input-field"
                  value={customStartPoint.name}
                  onChangeText={(text) => setCustomStartPoint((prev) => ({ ...prev, name: text }))}
                  placeholder="Place name (optional)"
                  placeholderTextColor="#545c68"
                />
              </View>
            )}
          </View>

          <View className="mb-8">
            <View className="card">
              <TouchableOpacity className="flex-row items-center justify-between" onPress={() => setGoBack(!goBack)}>
                <View className="flex-row items-center flex-1">
                  <Text className="text-lg mr-3">🔄</Text>
                  <View className="flex-1">
                    <Text className="text-body font-semibold text-neutral-darkest mb-1">Return to start point</Text>
                    <Text className="text-caption text-neutral-dark">
                      Route will automatically return to starting point
                    </Text>
                  </View>
                </View>
                <View className={`w-14 h-8 rounded-full p-1 ml-4 ${goBack ? "bg-primary" : "bg-neutral-dark/20"}`}>
                  <View
                    className={`w-6 h-6 bg-white rounded-full shadow-sm transition-all ${goBack ? "ml-6" : "ml-0"}`}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View className="card bg-secondary/5 border-2 border-secondary/20 mb-6">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 rounded-full bg-secondary/20 items-center justify-center mr-3">
                <Text className="text-lg">📋</Text>
              </View>
              <Text className="text-subheading text-neutral-darkest">Route Summary</Text>
            </View>
            <View className="space-y-2">
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-secondary mr-3" />
                <Text className="text-body text-neutral-darkest">{selectedSegments.length} segments to visit</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-secondary mr-3" />
                <Text className="text-body text-neutral-darkest">
                  Mode: {profiles.find((p) => p.key === profile)?.label}
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-secondary mr-3" />
                <Text className="text-body text-neutral-darkest">
                  Start:{" "}
                  {startPointMode === "current"
                    ? "Current position"
                    : startPointMode === "address"
                      ? "Custom address"
                      : "GPS coordinates"}
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-secondary mr-3" />
                <Text className="text-body text-neutral-darkest">
                  {goBack ? "With" : "Without"} return to start point
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View className="p-6 bg-white border-t-2 border-neutral-light/50">
          <TouchableOpacity
            className={`py-4 px-6 rounded-xl flex-row items-center justify-center shadow-lg ${
              loading || addressLoading ? "btn-primary-disabled" : "btn-primary"
            }`}
            onPress={handleGenerateRoute}
            disabled={loading || addressLoading}
          >
            {loading || addressLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="map" size={22} color="white" />
            )}
            <Text className="text-white font-semibold text-lg ml-3">
              {loading ? "Generating Route..." : "Generate Route"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}
