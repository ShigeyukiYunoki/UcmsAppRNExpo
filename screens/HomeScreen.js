import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import { auth } from "../src/firebase";
import { signOut } from "firebase/auth";
import * as Notifications from "expo-notifications";

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

  const scheduleNotificationAsync = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        body: "服薬を記録して、一緒に習慣化しましょう！",
        title: "UcmsApp",
        subtitle: "今日の服薬はおわりましたか？",
      },
      trigger: {
        hour: 21,
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
