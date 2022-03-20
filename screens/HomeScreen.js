import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import { auth } from "../src/firebase";
import { signOut, currentUser } from "firebase/auth";
import * as Notifications from "expo-notifications";
import { db } from "../src/firebase";
import { getDocs, collection, query, where } from "firebase/firestore/lite";

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
        const med = doc.data().taking_medicine_at;
        console.log(med);
      }
    });
  });
  // const q = query(collection(db, "users"), where("uid", user.uid));


  const scheduleNotificationAsync = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        body: "服薬を記録して、一緒に習慣化しましょう！",
        title: "UcmsApp",
        subtitle: "今日の服薬はおわりましたか？",
      },
      trigger: {
        hour: med,
        minute: med,
        repeats: true,
      },
    });
  };
  
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
          onPress={scheduleNotificationAsync}
          style={{
            marginTop: 10,
            padding: 10,
            backgroundColor: "#88cb7f",
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "white" }}>3秒後にプッシュ通知する</Text>
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
