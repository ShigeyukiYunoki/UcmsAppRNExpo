import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { auth } from "../src/firebase";
import { signOut } from "firebase/auth";
import * as Notifications from "expo-notifications";
import { db } from "../src/firebase";
import {
  getDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";


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
  const userRef = doc(db, "users", `${user.uid}`);

  useEffect(() => {
    getDoc(userRef).then((snapshot) => {
      const strftime = require("strftime");
      // var strftime = require("strftime")ではダメ
      const med = snapshot.data().taking_medicine_at;
      console.log(med);
      const m = strftime("%B %d, %Y %H:%M:%S", new Date(med));
      const m_hour = Number(strftime("%H", new Date(m)));
      const m_minute = Number(strftime("%M", new Date(m)));
      Notifications.cancelAllScheduledNotificationsAsync();
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
    });
  }, []);

  const [notification, setNotification] = useState("");

  // const onChangeNotification = async (event) => {
    // event.preventDefault();
    // const { date } = event.target.elements;
    // setNotification(event.target.value);
  // };

  const setDate = (event, date) => {
    // event.preventDefault();
    setNotification(date);
  };
  const navigation = useNavigation();
  const toCalendar = () => {
    navigation.navigate("Calendar",{
      Id: 1,
    });
  } 

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      () => {
        navigation.navigate("Calendar");
      }
    );
    return () => subscription.remove();
  }, []);

  const onClickAdd = async () => {
    try {
      await setDoc(doc(db, "users", `${user.uid}`), {
        taking_medicine_at: `${notification}`,
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
    const strftime = require("strftime");
    const takingMedicineTime = strftime("%H:%M", notification);
    Alert.alert(takingMedicineTime, "にお知らせします", [
      {
        onPress: async () => {
          try {
            navigation.navigate("Calendar");
          } catch (e) {
            console.error("Error adding document: ", e);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 30, marginBottom: 50 }}>UcmsAppにようこそ</Text>
      <Text style={{ fontSize: 30, marginTop: 10, marginBottom: 10 }}>
        毎日の服薬記録で習慣化
      </Text>
      <RNDateTimePicker
        onChange={setDate}
        style={{ width: 200 }}
        value={notification || new Date()}
        mode="time"
        display="spinner"
        minimumDate={new Date()}
        // is24Hour={true}
        // minuteInterval="10"
        // textColor="red"
        // neutralButtonLabel="clear"
      />
      <TouchableOpacity
        onPress={onClickAdd}
        style={{
          marginTop: 10,
          padding: 20,
          backgroundColor: "#88cb7f",
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "white", fontSize: 20 }}>
          この時刻に通知をうけとる
        </Text>
      </TouchableOpacity>

      <View style={styles.text}>
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
          onPress={toCalendar}
          style={{
            marginTop: 10,
            padding: 10,
            backgroundColor: "#88cb7f",
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "white" }}>calendar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          // onPress={async () => {
          //   try {
          //     const notifications =
          //       await Notifications.getAllScheduledNotificationsAsync();
          //     const identifier = notifications[0].identifier;
          //     await Notifications.cancelAllScheduledNotificationsAsync()
          //   } catch (e) {
          //     console.error("Error adding document: ", e);
          //   }
          // }}
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
};;

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
