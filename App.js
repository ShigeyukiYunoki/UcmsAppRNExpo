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
import { db } from "./src/firebase";
import { getDocs, collection } from "firebase/firestore/lite";
import { onAuthStateChanged } from "firebase/auth";
import { signInAnonymously } from "firebase/auth";
import * as Notifications from "expo-notifications";


export default function App() {
  const [user, setUser] = useState("");
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // 匿名ログインする
        signInAnonymously(auth);
      } else {
          // console.log(user);
          // db.collection("users")
          // .get()
          // .then((querySnapshot) => {
          //   querySnapshot.forEach((doc) => {
          //     console.log(`${doc.id} => ${doc.data()}`);
          //   });
          // });
          const user = auth.currentUser;
         
          const usersCollectionRef = collection(db, "users");
          getDocs(usersCollectionRef).then((snapshot) => {
            snapshot.docs.map((doc) => {
               if (user.uid === doc.data().uid ) {
                 console.log(user.uid);
               }
            });
          });
        // var userDoc = await firebase
        //   .firestore()
        //   .collection("users")
        //   .doc(user.uid)
        //   .get();
      }
    });
    return () => unsubscribe();
  }, []);

  // firebase.auth().onAuthStateChanged(async (user) => {
  //   // 未ログイン時
  //   if (!user) {
  //     // 匿名ログインする
  //     firebase.auth().signInAnonymously();
  //   }
  //   // ログイン時
  //   else {
  //     // ログイン済みのユーザー情報があるかをチェック
  //     var userDoc = await firebase
  //       .firestore()
  //       .collection("users")
  //       .doc(user.uid)
  //       .get();
  //     // if (!userDoc.exists) {
  //     //   // Firestore にユーザー用のドキュメントが作られていなければ作る
  //     //   await userDoc.ref.set({
  //     //     screen_name: user.uid,
  //     //     display_name: "名無しさん",
  //     //     created_at: firebase.firestore.FieldValue.serverTimestamp(),
  //     //   });
  //     // }
  //   }
  // });

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

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: true,
    }),
  });

  const Tab = createBottomTabNavigator();
  // const Stack = createNativeStackNavigator();
  // const [user, setUser] = useState('');
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (user) => {
  //     if (user) {
  //       console.log(user);
  //       setUser(user);
  //     } else {
  //       setUser('');
  //     }
  //   });
  //   return () => unsubscribe();
  // }, []);

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
