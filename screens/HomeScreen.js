import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { auth } from "../src/firebase";
import { signOut } from "firebase/auth";
import * as Notifications from "expo-notifications";
import { db } from "../src/firebase";
import {
  getDocs,
  getDoc,
  collection,
  addDoc,
  doc,
  updateDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore/lite";
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

  const [notification, setNotification] = useState("");

  // const onChangeNotification = async (event) => {
  // event.preventDefault();
  // const { date } = event.target.elements;

  //   setNotification(event.target.value);
  // };

  const setDate = (event, date) => {
    // event.preventDefault();
    setNotification(date);
  };
  const navigation = useNavigation();
  
  const onClickAdd = async () => {
    // const ref = db.collection(`users/${user.uid}/taking_medicine_at`);
    // ref.addDoc({
    //   taking_medicine_at: notification,
    // })
    // .then((docRef) => {
    //   console.log(docRef.id);
    // })
    // .catch((error) => {
    //   console.log(error);
    // })
    try {
      //  getDocs(usersCollectionRef).then((snapshot) => {
      //    snapshot.docs.map((doc) => {
      //      if (user.uid === doc.data().uid) {
      //        const docId = doc.id;
      //      }
      //    });
      //  });
      await setDoc(doc(db, "users", `${user.uid}`), {
        taking_medicine_at: `${notification}`,
      });
      console.log(notification);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
    navigation.navigate("Calendar")
  };

  
  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 30, marginBottom: 50 }}>UcmsAppにようこそ</Text>
      <Text style={{ fontSize: 30, marginTop: 10, marginBottom: 10 }}>
        毎日の服薬記録で習慣化
      </Text>
      {/* <Text style={{ fontSize: 24, marginTop: 30 }}>
        服薬を忘れないよう通知します
      </Text> */}
      {/* <Text style={{ fontSize: 16, top: 10, margin: 20 }}>
        通知の時間を選んでください
      </Text> */}
      <RNDateTimePicker
        onChange={setDate}
        style={{ width: 200 }}
        value={notification || new Date()}
        mode="time"
        // is24Hour={true}
        display="spinner"
        minimumDate={new Date()}
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
        {/* <Text>Welcome to UcmsApp!</Text> */}
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
