import "@/global.css"
import type { StravaSegment } from "@/types/types"
import Ionicons from "@expo/vector-icons/Ionicons"
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
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
  profile: "bike"
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
      profile: "bike", // Toujours "bike" maintenant
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
                position: 'absolute'
              }}
            >
            <Ionicons name="close" size={25} color="#545c68" />
            </TouchableOpacity>
        {/* Header */}
        <View className="bg-white shadow-lg justify-center items-center" style={{ paddingTop: 20, paddingBottom: 20 }}>
          <View className="items-center justify-center px-6">
            <View className="items-center">
              <Text className="text-heading" style={{ fontSize: 20, fontWeight: '700' }}>Route Configuration</Text>
              <Text className="text-caption" style={{ color: '#6b7280', marginTop: 2 }}>
                Customize your adventure
              </Text>
            </View>
            <View style={{ width: 40 }} />
          </View>
        </View>

        <ScrollView className="flex-1 px-4 py-6" keyboardShouldPersistTaps="handled">
          {/* Selected Segments Section */}
          <View className="mb-6">
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-3">
                <MaterialCommunityIcons name="map-marker-multiple" size={18} color="white" />
              </View>
              <Text className="text-subheading">Selected Segments</Text>
            </View>
            
            <View className="card-elevated" style={{ padding: 16 }}>
              <View className="flex-row items-center justify-center mb-4">
                <View className="badge-primary">
                  <Text className="text-white font-semibold">
                    {selectedSegments.length} segment{selectedSegments.length > 1 ? "s" : ""}
                  </Text>
                </View>
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row">
                  {selectedSegments.map((segment, index) => (
                    <View
                      key={segment.id}
                      className="bg-primary-light border border-primary rounded-xl mr-3"
                      style={{ paddingHorizontal: 12, paddingVertical: 8, minWidth: 120 }}
                    >
                      <Text className="font-semibold text-primary mb-1" style={{ fontSize: 12 }} numberOfLines={1}>
                        {index + 1}. {segment.name}
                      </Text>
                      <Text className="text-primary" style={{ fontSize: 10, fontWeight: '600' }}>
                        {Math.round(segment.distance)}m
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>

          {/* Route Name Section */}
          <View className="mb-6">
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-3">
                <MaterialCommunityIcons name="pencil" size={18} color="white" />
              </View>
              <Text className="text-subheading">Route Name</Text>
            </View>
            
            <View className="card">
              <TextInput
                className="input-field text-body"
                value={routeName}
                onChangeText={setRouteName}
                placeholder="My Epic KOM Hunt..."
                placeholderTextColor="#9ca3af"
                maxLength={100}
                style={{ fontSize: 16, padding: 12 }}
              />
            </View>
          </View>

          {/* Start Point Section */}
          <View className="mb-6">
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-3">
                <MaterialCommunityIcons name="map-marker" size={18} color="white" />
              </View>
              <Text className="text-subheading">Starting Point</Text>
            </View>

            <View className="card" style={{ padding: 12, gap: 12 }}>
              <TouchableOpacity
                className={"flex-row items-center"}
                style={{
                  backgroundColor: '#ffffff',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.12,
                  shadowRadius: 6,
                  elevation: 4,
                  padding: 4,
                  borderRadius: 8
                }}
                onPress={() => setStartPointMode("current")}
              >
                <View
                  className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${
                    startPointMode === "current" ? "border-primary bg-primary" : "border-neutral-dark"
                  }`}
                >
                  {startPointMode === "current" && <View className="w-2 h-2 bg-white rounded-full" />}
                </View>
                <View className="flex-1">
                  <Text className="font-semibold"style={{color: '#545c68' }} >Current Location</Text>
                  <Text className="text-caption text-neutral-dark">Use your current position or first segment</Text>
                </View>
                  <View className={`w-8 h-8 rounded-full items-center justify-center`}>
                    <MaterialCommunityIcons 
                      name="map-marker-account" 
                      size={20} 
                      color= {startPointMode === "current" ? "#FC4C02" : "#666"} 
                    />
                </View>
               
              </TouchableOpacity>

             <TouchableOpacity
                className={"flex-row items-center"}
                style={{
                  backgroundColor: '#ffffff',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.12,
                  shadowRadius: 6,
                  elevation: 4,
                  padding: 4,
                  borderRadius: 8
                }}
                onPress={() => setStartPointMode("address")}
                activeOpacity={0.75}
              >
                <View
                  className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${
                    startPointMode === "address" ? "border-primary bg-primary" : "border-neutral-dark"
                  }`}
                >
                  {startPointMode === "address" && <View className="w-2 h-2 bg-white rounded-full" />}
                </View>
                <View className="flex-1">
                  <Text className={`font-semibold`} style={{color: '#545c68' }}>
                    Custom Address
                  </Text>
                  <Text className="text-sm" style={{color: '#545c68' }}>Search for a specific location</Text>
                </View>
                <View className={`w-4 h-8 rounded-full items-center justify-center`}>
                  <MaterialCommunityIcons 
                    name="map-marker" 
                    size={20} 
                    color={startPointMode === "address" ? "#FC4C02" : "#666"} 
                  />
                </View>
              </TouchableOpacity>
            </View>

            {startPointMode === "address" && (
              <View className="relative mt-3">
                <View className="card border-primary-light">
                  <View className="flex-row items-center">
                    <TextInput
                      className="flex-1 input-field"
                      value={addressInput}
                      onChangeText={handleAddressInputChange}
                      placeholder="Search for a location..."
                      placeholderTextColor="#9ca3af"
                      style={{ fontSize: 16, padding: 12 }}
                    />
                    {addressLoading && (
                      <ActivityIndicator size="small" color="#FC4C02" style={{ marginLeft: 12 }} />
                    )}
                  </View>
                </View>

                {showPredictions && predictions.length > 0 && (
                  <View className="absolute top-full left-0 right-0 z-10 card-elevated mt-2">
                    <ScrollView style={{ maxHeight: 200 }}>
                      {predictions.map((item) => (
                        <TouchableOpacity
                          key={item.place_id}
                          className="p-4 border-b border-neutral-light"
                          onPress={() => handlePredictionSelect(item)}
                        >
                          <Text className="font-semibold text-neutral-darkest mb-1" style={{ fontSize: 14 }}>
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
          </View>

          {/* Return Option */}
            <View className="mb-6">
              <View className="card">
                <TouchableOpacity 
                  className="flex-row items-center justify-between p-2" 
                  onPress={() => setGoBack(!goBack)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center flex-1">
                    <View className="w-8 h-8 rounded-full bg-secondary items-center justify-center mr-3">
                      <MaterialCommunityIcons name="backup-restore" size={18} color="white" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-neutral-darkest mb-1">Return to Start</Text>
                      <Text className="text-caption text-neutral-dark">
                        Create a loop back to starting point
                      </Text>
                    </View>
                  </View>
                  
                  {/* Checkbox */}
                  <View 
                    style={{
                      width: 22,
                      height: 22,
                      borderWidth: 2,
                      borderColor: goBack ? '#FC4C02' : '#d1d5db',
                      backgroundColor: goBack ? '#FC4C02' : 'transparent',
                      borderRadius: 6,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    {goBack && (
                      <Ionicons name="checkmark" size={14} color="white" />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </View>

         {/* Route Summary */}
                <View className="alert-info mb-6" style={{ backgroundColor: '#f0f9ff', borderLeftColor: '#0ea5e9' }}>
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons name="information" size={18} color="#0ea5e9" />
                    <Text className="text-lg font-medium" style={{ color: '#0c4a6e', marginLeft: 3 }}>Route Summary</Text>
                  </View>

                  <View style={{ gap: 12 }}>
                    <View className="flex-row items-start">
                      <View className="w-1.5 h-1.5 rounded-full mt-2 mr-3" style={{ backgroundColor: '#0ea5e9' }} />
                      <View className="flex-1">
                        <Text className="text-sm font-medium" style={{ color: '#0c4a6e' }}>
                          Segments to conquer
                        </Text>
                        <Text className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                          {selectedSegments.length} selected
                        </Text>
                      </View>
                    </View>
                    
                    <View className="flex-row items-start">
                      <View className="w-1.5 h-1.5 rounded-full mt-2 mr-3" style={{ backgroundColor: '#0ea5e9' }} />
                      <View className="flex-1">
                        <Text className="text-sm font-medium" style={{ color: '#0c4a6e' }}>
                          Starting point
                        </Text>
                        <Text className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                          {startPointMode === "current" ? "Current location" : "Custom address"}
                        </Text>
                      </View>
                    </View>

                     <View className="flex-row items-start">
                      <View className="w-1.5 h-1.5 rounded-full mt-2 mr-3" style={{ backgroundColor: '#0ea5e9' }} />
                      <View className="flex-1">
                        <Text className="text-sm font-medium" style={{ color: '#0c4a6e' }}>
                          Journey type
                        </Text>
                        <Text className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                          {goBack ? "Return to start" : "One way journey"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
        </ScrollView>

        {/* Generate Button */}
        <View className="p-6 bg-white border-t border-neutral-light" 
              style={{ 
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 8
              }}>
          <TouchableOpacity
            className={`py-4 px-6 rounded-xl flex-row items-center justify-center ${
              loading || addressLoading ? "btn-primary-disabled" : "btn-primary"
            }`}
            style={{
              shadowColor: loading || addressLoading ? 'transparent' : '#FC4C02',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: loading || addressLoading ? 0 : 6,
            }}
            onPress={handleGenerateRoute}
            disabled={loading || addressLoading}
          >
            {loading || addressLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <MaterialCommunityIcons name="map-marker-path" size={22} color="white" />
            )}
            <Text className="text-white font-semibold text-lg ml-3">
              {loading ? "Creating Route..." : "Generate Optimal Route"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}