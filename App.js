import "react-native-gesture-handler";
import React, { useState, useEffect } from "react";
import { LogBox } from "react-native";
import "react-native-get-random-values";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import CalendarScreen from "./screens/CalendarScreen";
import LoginScreen from "./screens/LoginScreen";
import UsersScreen from "./screens/UsersScreen";
import UsersCalendarScreen from "./screens/UsersCalendarScreen";
import { auth } from "./src/firebase";
import { onAuthStateChanged } from "firebase/auth";
import * as Notifications from "expo-notifications";
import * as Sentry from "sentry-expo";

// import ignoreWarnings from "react-native-ignore-warnings";
// ignoreWarnings("Setting a timer");
// ignoreWarnings("AsyncStorage has been");
LogBox.ignoreLogs(["Setting a timer", "AsyncStorage has been"]);

export default function App({}) {
  Sentry.init({
    dsn: "https://0f591275b08c49bfb3e68c98e2c8c702@o1231533.ingest.sentry.io/6378969",
    enableInExpoDevelopment: true, // falseとした場合、開発時のエラーは無視される
    debug: false, // 製品版ではfalseにする
  });

  useEffect(() => {
    const requestPermissionsAsync = async () => {
      const { granted } = await Notifications.getPermissionsAsync();
      if (granted) {
        return;
      }
      await Notifications.requestPermissionsAsync();
    };
    return () => requestPermissionsAsync();
  }, []);

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }, []);

  const Stack = createNativeStackNavigator();

   const [user, setUser] = useState("");
   useEffect(() => {
     const unsubscribe = onAuthStateChanged(auth, (user) => {
       if (user) {
         console.log(user.uid);
         setUser(user);
       } else {
         setUser("");
       }
     });
     return () => unsubscribe();
   }, []);

  // useEffect(() => {
    //   const subscribeNotification = (notification) => {
      //     const { data = {} } = notification
  //     if (notification.origin === "selected") {
  //       if (screen) {
  //         // アプリがバックグラウンドまたは、開かれていない状態で通知を開いた場合
  //         navigation.navigate("Calendar");
  //       } else if (notification.origin === "received") {
  //         // アプリが開かれている場合
  //         navigation.navigate("Calendar");
  //       }
  //     }
  //   };
  //   Notifications.addNotificationReceivedListener(subscribeNotification);
  // }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <Stack.Screen
            name="Home"
            component={HomeScreen}
          />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        )}
        <Stack.Screen name="Calendar" component={CalendarScreen} />
        <Stack.Screen name="Users" component={UsersScreen} />
        <Stack.Screen name="UsersCalendar" component={UsersCalendarScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
