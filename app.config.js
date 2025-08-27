import "dotenv/config";

export default {
  expo: {
    name: "CrownBreaker",
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
    ],

    experiments: {
      typedRoutes: true,
    },
  },
};
