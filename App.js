import React, { useState, useEffect } from "react";
import {  Button } from "react-native";
import "react-native-get-random-values";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import CalendarScreen from "./screens/CalendarScreen";
import RegisterScreen from "./screens/RegisterScreen";
import LoginScreen from "./screens/LoginScreen";
import { auth } from "./src/firebase";
import { onAuthStateChanged } from "firebase/auth";
import * as Notifications from "expo-notifications";
import * as Sentry from "sentry-expo";


export default function App() {
  Sentry.init({
    dsn: "https://0f591275b08c49bfb3e68c98e2c8c702@o1231533.ingest.sentry.io/6378969",
    enableInExpoDevelopment: true, // falseとした場合、開発時のエラーは無視される
    debug: true, // 製品版ではfalseにする
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

  
  // const Tab = createBottomTabNavigator();
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
  
  // const navigation = useNavigation();
  // const toCalendar = () => {
  //   navigation.navigate("Calendar");
  // }; 

  // useEffect(() => {
  //   const subscribeNotification = (notification) => {
  //     const { data = {} } = notification;

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
            options={{
              headerRight: () => (
                <Button
                  title="Calendar"
                />
              ),
            }}
          />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
        <Stack.Screen name="Calendar" component={CalendarScreen} />
      </Stack.Navigator>

      {/* <Tab.Navigator>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="ios-home" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="ユーザー一覧"
          component={UsersScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="ユーザー登録"
          component={RegisterScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="カレンダー"
          component={CalendarScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="ログイン"
          component={LoginScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator> */}
    </NavigationContainer>
  );
}
