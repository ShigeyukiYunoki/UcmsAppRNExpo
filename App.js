import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";
import "react-native-get-random-values";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import UsersScreen from "./screens/UsersScreen";
import CalendarScreen from "./screens/CalendarScreen";
import RegisterScreen from "./screens/RegisterScreen";
import LoginScreen from "./screens/LoginScreen";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "./src/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function App() {
  const Tab = createBottomTabNavigator();
  // const Stack = createNativeStackNavigator();
  const [user, setUser] = useState('');
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(user);
        setUser(user);
      } else {
        setUser('');
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <NavigationContainer>
      {/* <Stack.Navigator>
        {user ? (
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          <Stack.Screen name="ログイン" component={LoginScreen} />
        )}
      </Stack.Navigator> */}
      <Tab.Navigator>
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
      </Tab.Navigator>
    </NavigationContainer>
  );
}
