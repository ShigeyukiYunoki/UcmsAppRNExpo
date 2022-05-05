import { Calendar, LocaleConfig } from "react-native-calendars";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import "react-native-get-random-values";
import { REACT_APP_DEV_API_URL_MEDICINES } from "@env";
import ListMedicine from "../components/ListMedicine";import {
  getDocs,
  getDoc,
  collection,
  addDoc,
  doc,
  updateDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore/lite";
import { auth } from "../src/firebase";
import { db } from "../src/firebase";
import * as Notifications from "expo-notifications";

const CalendarScreen = () => {
  // const [medicines, setMedicines] = useState([]);

  // useEffect(() => {
  //   const getMedicine = async () => {
  //     const res = await fetch(REACT_APP_DEV_API_URL_MEDICINES);
  //     const medicines = await res.json();
  //     setMedicines(medicines);
  //   };
  //   getMedicine();
  // }, []);

  const signInUser = auth.currentUser;
  const userRef = doc(db, "users", `${signInUser.uid}`);

  useEffect(() => {
    getDoc(userRef).then((snapshot) => {
      const strftime = require("strftime");
      // var strftime = require("strftime")
      const med = snapshot.data().taking_medicine_at;
      console.log(med);
      const m = strftime("%B %d, %Y %H:%M:%S", new Date(med));
      // var strftime = require("strftime");
      const m_hour = Number(strftime("%H", new Date(m)));
      // var strftime = require("strftime");
      const m_minute = Number(strftime("%M", new Date(m)));
      console.log(m_minute);
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

  return (
    <View style={styles.container}>
      <Calendar
        monthFormat={"yyyy年 MM月"}
        markedDates={{
          "2022-02-16": { selected: true, selectedColor: "lightgreen" },
        }}
      />
      {/* <FlatList
        data={ medicines }
        renderItem={({ item }) => (
          <ListMedicine item={item} />
        )}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => (
          <View
            style={{
              backgroundColor: "gray",
              height: 1,
            }}
          ></View>
        )}
      /> */}
      <TouchableOpacity
        onPress={async () => {
          try {
            const notifications =
              await Notifications.getAllScheduledNotificationsAsync();
            // const identifier = notifications[0].identifier;
            // console.log(identifier);
            console.log(notifications);
            // await Notifications.cancelAllScheduledNotificationsAsync()
          } catch (e) {
            console.error("Error adding document: ", e);
          }
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
  );
}

LocaleConfig.locales.jp = {
  monthNames: [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ],
  monthNamesShort: [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ],
  dayNames: [
    "日曜日",
    "月曜日",
    "火曜日",
    "水曜日",
    "木曜日",
    "金曜日",
    "土曜日",
  ],
  dayNamesShort: ["日", "月", "火", "水", "木", "金", "土"],
};
LocaleConfig.defaultLocale = "jp";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#fff',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  text: {
    alignItems: "center",
    padding: 10,
    fontSize: 24,
    fontWeight: "bold",
  },
  item: {
    padding: 30,
    backgroundColor: "#88cb7f",
    flexDirection: "row",
    alignItems: "center",
  },
});

export default CalendarScreen;
