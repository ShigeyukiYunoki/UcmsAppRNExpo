import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import { auth } from "../src/firebase";
import { signOut } from "firebase/auth";
import * as Notifications from "expo-notifications";
import { db } from "../src/firebase";
import { getDocs, collection } from "firebase/firestore/lite";

const HomeScreen = () => {
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("logout");
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  const user = auth.currentUser;

  const usersCollectionRef = collection(db, "users");

  getDocs(usersCollectionRef).then((snapshot) => {
    snapshot.docs.map((doc) => {
      if (user.uid === doc.data().uid) {
        const strftime = require("strftime");
        // var strftime = require("strftime")
        const med = doc.data().taking_medicine_at.toDate();
        const m = strftime("%B %d, %Y %H:%M:%S", new Date(med));
        // var strftime = require("strftime");
        const m_hour = Number(strftime("%H", new Date(m)));
        // var strftime = require("strftime");
        const m_minute = Number(strftime("%M", new Date(m)));
        console.log(m);
        Notifications.scheduleNotificationAsync({
            content: {
              body: "服薬を記録して、一緒に習慣化しましょう！",
              title: "UcmsApp",
              subtitle: "今日の服薬はおわりましたか？",
            },
            trigger: {
              hour: m_hour,
              minute: m_minute,
              repeats: true,
            },
          });
        };
    });
  });
    
  return (
    <View style={styles.container}>
      <View style={styles.text}>
        <Text>Welcome to UcmsApp!</Text>
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            marginTop: 10,
            padding: 10,
            backgroundColor: "#88cb7f",
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "white" }}>ログアウト</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            await Notifications.cancelAllScheduledNotificationsAsync();
          }}
          style={{
            marginTop: 10,
            padding: 10,
            backgroundColor: "#88cb7f",
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "white" }}>通知終了</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    alignItems: "center",
    padding: 10,
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default HomeScreen;
