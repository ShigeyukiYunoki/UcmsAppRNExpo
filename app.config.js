import "dotenv/config";

export default () => ({
  expo: {
    name: "UcmsApp",
    slug: "UcmsApp",
    version: "0.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "cover",
      backgroundColor: "#ffffff",
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: false,
      userInterfaceStyle: "automatic",
      // jsEngine: "jsc",
    },
    android: {
      package: "moc.ppasmcu",
      versionCode: 1,
      permissions: [],
      adaptiveIcon: {
        foregroundImage: "./assets/icon-adaptive-foreground.png",
        backgroundImage: "./assets/icon-adaptive-background.png",
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      [
        "expo-notifications",
        {
          icon: "./assets/icon.png",
          color: "#ffffff",
          sound: "./assets/sound.wav",
        },
      ],
      [
        "expo-build-properties",
        {
          ios: {
            deploymentTarget: "16.1",
          },
        },
      ],
    ],
    jsEngine: "hermes",
    hooks: {
      postPublish: [
        {
          file: "sentry-expo/upload-sourcemaps",
          config: {
            organization: "ucmsapp",
            project: "ucmsapp",
            authToken: process.env.SENTRY_AUTH,
          },
        },
      ],
    },
    extra: {
      REACT_APP_FIREBASE_API_KEY: process.env.REACT_APP_FIREBASE_API_KEY,
      REACT_APP_FIREBASE_AUTH_DOMAIN:
        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      REACT_APP_FIREBASE_PROJECT_ID: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      REACT_APP_FIREBASE_STORAGE_BUCKET:
        process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      REACT_APP_FIREBASE_MESSAGE_SENDER_ID:
        process.env.REACT_APP_FIREBASE_MESSAGE_SENDER_ID,
      REACT_APP_FIREBASE_APP_ID: process.env.REACT_APP_FIREBASE_APP_ID,
      REACT_APP_FIREBASE_MEASUREMENT_ID:
        process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
      TWITTER_CONSUMER_KEY: process.env.TWITTER_CONSUMER_KEY,
      TWITTER_CONSUMER_SECRET: process.env.TWITTER_CONSUMER_SECRET,
      AD_ID: process.env.AD_ID,
      eas: {
        projectId: "b34077c0-96bb-4a63-b78e-78c9b4c979b6",
      },
    },
  },
});
