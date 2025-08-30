import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeRedirectUri } from "expo-auth-session";
import { LinearGradient } from 'expo-linear-gradient';
import { openAuthSessionAsync } from 'expo-web-browser';
import React, { useEffect } from 'react';
import { Alert, Linking, Text, TouchableOpacity, View } from 'react-native';



const API_BASE_URL = "https://kom-optimizer-production.up.railway.app";


interface WelcomeScreenProps {
  onLoginSuccess: (token: string, user: any) => void;
}

const useStravaAuth = (onLoginSuccess: (token: string, user: any) => void) => {
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);

  useEffect(() => {
    const handleDeepLink = (url: string) => {
      try {
        const parsedUrl = new URL(url);
        const token = parsedUrl.searchParams.get('token');
        const error = parsedUrl.searchParams.get('error');
        const success = parsedUrl.searchParams.get('success');
        const userStr = parsedUrl.searchParams.get('user');

        if (error) {
          setIsAuthenticating(false);
          Alert.alert('Authentication Error', error);
        } else if (success === 'true' && token) {
          setIsAuthenticating(false);
          const user = userStr ? JSON.parse(decodeURIComponent(userStr)) : null;
          AsyncStorage.setItem('authToken', token);
          AsyncStorage.setItem('user', JSON.stringify(user));
          onLoginSuccess(token, user);
        }
      } catch (err) {
        console.error('Error parsing deep link:', err);
        setIsAuthenticating(false);
        Alert.alert('Authentication Error', 'Failed to parse authentication response');
      }
    };

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    return () => subscription?.remove();
  }, [onLoginSuccess]);

const STRAVA_AUTH_URL = `${API_BASE_URL}/api/auth/strava/mobile-auth-url`;

async function authenticateWithStrava() {
  try {
    setIsAuthenticating(true);
    const redirectUri = makeRedirectUri({
      scheme: "crownbreaker", 
      path: "auth/strava"
    });

    const response = await fetch(
      `${STRAVA_AUTH_URL}?redirectUri=${encodeURIComponent(redirectUri)}`
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const { authUrl } = await response.json();

   
    const result = await openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === "success" && result.url) {
      console.log("Redirect URL:", result.url);

      const params = new URLSearchParams(result.url.split("?")[1]);
      const token = params.get("token");
      const user = JSON.parse(params.get("user") || "{}");

      console.log("JWT:", token, "User:", user);
    } else {
      console.log("Auth cancelled or error:", result);
    }
  } catch (err) {
    console.error("Auth error:", err);
  } finally {
    setIsAuthenticating(false);
  }
}

  return {
    isAuthenticating,
    authenticateWithStrava
  };
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLoginSuccess }) => {
  const { isAuthenticating, authenticateWithStrava } = useStravaAuth(onLoginSuccess);

  const handleStravaLogin = async () => {
    console.log("Bouton Strava cliqué");
    await authenticateWithStrava();
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
          
          <View className="items-center mb-32">
            <Text className="text-title text-white">CROWNBREAKER</Text>
            <Text className="text-sub-title text-white">Challenge yourself to take KOMs</Text>
          </View>
          <View className="w-full">
            <TouchableOpacity
              onPress={handleStravaLogin}
              disabled={isAuthenticating}
              className="btn-primary"
              activeOpacity={0.9}
            >
              <View className="flex-row items-center justify-center">
                <FontAwesome5 name="strava" size={24} color="white" className="mr-3" />
                <Text className="text-white text-lg font-semibold"> {isAuthenticating ? 'Authenticating...' : 'Log in with Strava'}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default WelcomeScreen;
