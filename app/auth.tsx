import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type WelcomeScreenProps = {
  onLoginSuccess: () => void;
};

const WelcomeScreen = ({ onLoginSuccess }: WelcomeScreenProps) => {
  const handleStravaLogin = () => {
    console.log("Bouton Strava cliqué");
    onLoginSuccess();
  };

  return (
    <View className="flex-1">
      
      {/* Gradient de fond */}
      <LinearGradient
        colors={["#1e3a8a", "#342a40", "#752830", "#e3360b"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <View className="flex-1 justify-center items-center px-8">
          
          {/* Logo et titre principal */}
          <View className="items-center mb-32">
            <Text className="text-title text-white">CROWNBREAKER</Text>
            <Text className="text-sub-title text-white">Challenge yourself to take KOMs</Text>
          </View>

          {/* Bouton de connexion Strava */}
          <View className="w-full">
            <TouchableOpacity
              onPress={handleStravaLogin}
              className="btn-primary"
              activeOpacity={0.9}
            >
              <View className="flex-row items-center justify-center">
                <FontAwesome5 name="strava" size={24} color="white" className="mr-3" />
                <Text className="text-white text-lg font-semibold">Log in with Strava</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default WelcomeScreen;
