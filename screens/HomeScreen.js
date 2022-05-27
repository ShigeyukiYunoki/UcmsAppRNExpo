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
import { useNavigation } from "@react-navigation/native";
import { DateTimePickerModal } from "react-native-modal-datetime-picker";
import { Icon } from "@rneui/themed";
// import RNDateTimePicker from "@react-native-community/datetimepicker";

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
  const [medtime, setMedtime] = useState("");

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
      setMedtime(med);
    });
  }, []);

  // const [notification, setNotification] = useState("");

  // const onChangeNotification = async (event) => {
  // event.preventDefault();
  // const { date } = event.target.elements;
  // setNotification(event.target.value);
  // };

  // const setDate = (event, date) => {
  //   // event.preventDefault();
  //   setNotification(date);
  // };
  const navigation = useNavigation();
  const toCalendar = () => {
    navigation.navigate("Calendar", {
      Id: 1,
    });
  };

  // useEffect(() => {
  //   getDoc(userRef).then((snapshot) => {
  //     const med = snapshot.data().taking_medicine_at;
  //     if ( med ) {
  //       navigation.navigate("Calendar");
  //     }
  //   })
  // },[]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      () => {
        navigation.navigate("Calendar");
      }
    );
    return () => subscription.remove();
  }, []);

  // const onClickAdd = async () => {
  //   try {
  //     await setDoc(doc(db, "users", `${user.uid}`), {
  //       taking_medicine_at: `${notification}`,
  //     });
  //   } catch (e) {
  //     console.error("Error adding document: ", e);
  //   }
  //   const strftime = require("strftime");
  //   const takingMedicineTime = strftime("%H:%M", notification);
  //   Alert.alert(takingMedicineTime, "にお知らせします", [
  //     {
  //       onPress: async () => {
  //         try {
  //           navigation.navigate("Calendar");
  //         } catch (e) {
  //           console.error("Error adding document: ", e);
  //         }
  //       },
  //     },
  //   ]);
  // };

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = async (time) => {
    hideDatePicker();
    try {
      await setDoc(doc(db, "users", `${user.uid}`), {
        taking_medicine_at: `${time}`,
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
    const strftime = require("strftime");
    const takingMedicineTime = strftime("%H:%M", time);
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
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="time"
        // onChange={setDate}
        onConfirm={handleConfirm}
        confirmTextIOS={"この時刻に通知をうけとる"}
        onCancel={hideDatePicker}
        // value={notification || new Date()}
        minimumDate={new Date()}
      />
      {/* <RNDateTimePicker
        onChange={setDate}
        style={{ width: 100, marginTop: 30, marginBottom: 10 }}
        value={notification || new Date()}
        mode="time"
        // display="spinner"
        minimumDate={new Date()}
        // is24Hour={true}
        // minuteInterval="10"
        // textColor="red"
        // neutralButtonLabel="clear"
      /> */}
      <TouchableOpacity
        onPress={showDatePicker}
        style={{
          margin: 20,
          padding: 10,
          backgroundColor: "skyblue",
          borderRadius: 10,
        }}
      >
        <Icon name="clock" type="evilicon" color="white" size={60} />
        <Text style={{ color: "white", fontSize: 25, marginTop: 10 }}>
          通知時刻を選択
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

        {medtime ? (
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
        ) : (
          <Text></Text>
        )}
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
