import "dotenv/config";

export default {
  expo: {
    name: "CrownBreaker",
    "extra": {
      "eas": {
        "projectId": "db23a1ea-988d-4dd5-8aa0-a26f5350cf34"
      }
    },
    slug: "CrownBreaker",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "crownbreaker",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    ios: {
      bundleIdentifier: "com.optimizer.crownbreaker",
      supportsTablet: true,
      config: {
        googleMapsApiKey: process.env.GOOGLE_API_KEY, 
      },
    },

    android: {
      package: "com.optimizer.crownbreaker",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_API_KEY, 
        },
      },
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },

    updates: {
      enabled: true,
      fallbackToCacheTimeout: 0
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow CrownBreaker to access your location for mapping segments and routes.",
          locationWhenInUsePermission: "Allow CrownBreaker to access your location for mapping segments and routes."
        }
      ]
    ],

    experiments: {
      typedRoutes: true,
    },
  },
};