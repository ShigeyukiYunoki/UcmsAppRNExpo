import { Calendar, LocaleConfig } from "react-native-calendars";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import React, {
  useState,
  useEffect
} from "react";
import "react-native-get-random-values";
import {
  getDocs,
  getDoc,
  collection,
  addDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  limit
} from "firebase/firestore";
import { auth } from "../src/firebase";
import { db } from "../src/firebase";
import * as Notifications from "expo-notifications";
import { subDays, format } from "date-fns";

const CalendarScreen = ({ route, navigation }) => {
  const user = auth.currentUser;
  const userRef = doc(db, "users", `${user.uid}`);
  const tookMedicinesRef = collection(db, "users", `${user.uid}`, "medicines");
  
  const [medicines, setMedicines] = useState([]);
  const [meds, setMeds] = useState([]);
  const [marks, setMarks] = useState({});
  const [days, setDays] = useState(0);

  useEffect(() => {
    const strftime = require("strftime");
    const q = query(tookMedicinesRef, orderBy("took_medicine_at", "asc"));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const items = [];
        querySnapshot.forEach((doc) => {
          const med = doc.data().took_medicine_at.toDate();
          const m = strftime("%Y-%m-%d", med);
          items.push(m);
        });
        setMedicines(items);
      },
      (error) => {
        console.error("Error adding document: ", error);
      }
    );
    // getDocs(query(tookMecicinesRef, orderBy("took_medicine_at", "desc"))).then(
    //   (snapshot) => {
    //     const items = [];
    //     snapshot.forEach((doc) => {
    //       const med = doc.data().took_medicine_at.toDate();
    //       const m = strftime("%Y-%m-%d", med);
    //       items.push(m);
    //     });
    //     setMedicines(items);
    //   }
    //   );
    return () => unsubscribe();
  }, []);


  // const [medicines, setMedicines] = useState([]);

  // useEffect(() => {
  //   const getMedicine = async () => {
  //     const res = await fetch(REACT_APP_DEV_API_URL_MEDICINES);
  //     const medicines = await res.json();
  //     setMedicines(medicines);
  //   };
  //   getMedicine();
  // }, []);


  useEffect(() => {
    const strftime = require("strftime");
    getDocs(
      query(tookMedicinesRef, orderBy("took_medicine_at", "desc"), limit(1))
    ).then((snapshot) => {
      if (snapshot.empty) {
        const tookMedicineToday = new Date();
        const today = strftime("%Y年%m月%d日", new Date());
        console.log(today);
        
        Alert.alert(`${today}の服薬は？`, "", [
          {
            text: "完了！",
            onPress: async () => {
              try {
                await addDoc(
                  collection(db, "users", `${user.uid}`, "medicines"),
                  {
                    took_medicine_at: tookMedicineToday,
                  }
                );
                // setDays((day) => day + 1);
              } catch (e) {
                console.error("Error adding document: ", e);
              }
            },
            style: "cancel",
          },
          { text: "まだ...", onPress: () => navigation.navigate("Home") },
        ])
      } else {
        snapshot.forEach((doc) => {
          const med = doc.data().took_medicine_at.toDate();
          const m = strftime("%Y年%m月%d日", med);
          const today = strftime("%Y年%m月%d日", new Date());
          const tookMedicineToday = new Date();

          if (m !== today) {
            Alert.alert(`${today}の服薬は？`, "", [
              {
                text: "完了！",
                onPress: async () => {
                  try {
                    await addDoc(
                      collection(db, "users", `${user.uid}`, "medicines"),
                      {
                        took_medicine_at: tookMedicineToday,
                      }
                    );
                    
                    setDays((day) => day + 1);
                    
                  } catch (e) {
                    console.error("Error adding document: ", e);
                  }
                },
                style: "cancel",
              },
              { text: "まだ...", onPress: () => navigation.navigate("Home") },
            ]);
          }
        })
      }
    });
  }, []);

  
  useEffect(() => {
    const markedDates = {};
    medicines.forEach((i) => {
      markedDates[i] = {
        selected: true,
        marked: true,
        selectedColor: "lightgreen",
      };
    });
    setMarks(markedDates);
  }, [medicines]);

  // UTCのDateからJSTのDateを取得
  function getJstDate(dateObj) {
    // getTimezoneOffset()はUTCとの差(UTC - JST)を分単位で取得
    // 60 * 1000でミリ秒に変換
    const offset = new Date().getTimezoneOffset() * 60 * 1000;
    // getTime()はUTC現在時間のミリ秒
    const date = new Date(dateObj.getTime() - offset);
    return date;
  }

  useEffect(() => {
    const q = query(tookMedicinesRef, orderBy("took_medicine_at", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const items = [];
        querySnapshot.forEach((doc) => {
          const med = format(doc.data().took_medicine_at.toDate(), "Y/M/d");
          const m = getJstDate(new Date(med));
          items.push(m);
        });
        setMeds(items);
      },
      (error) => {
        console.error("Error adding document: ", error);
      }
    );
    return () => unsubscribe();
  }, [marks]);
  
  useEffect(() => {
    // meds.forEach((index) => {
      //   if (meds[index]+[1] == subDays(meds[index], 1)) {
        //   setDays(days + 1);
        //   }
        // });
        // for (const value of mmm) {
          //   if (value[index + 1] !== subDays(value[index], 1)) break;
    //   setDays(days + 1);
    // }
    for (let i = 0; i < meds.length; i++) {
      const m1 = new Date(meds[i + 1]).getTime();
      const m2 = new Date(subDays(meds[i], 1)).getTime();
      if (days === 0) {
        if (m1 === m2) {
          setDays((day) => day + 1);
        } else {
          setDays((day) => day + 1);
          console.log(days);
          break;
        }
      } 
    }
    if (
      new Date(meds[0]).getDate() !== subDays(new Date(), 1).getDate() &&
      new Date(meds[0]).getDate() !== new Date().getDate()
      ) {
        setDays(0);
      } 
    }, [meds]);
    
    // console.log(new Date(subDays(meds[0], 1)).getTime());
    // console.log(new Date(meds[1]).getTime());
    // console.log(new Date(meds[1]).getDate());
    // console.log(subDays(new Date(), 1).getDate());

    useEffect(() => {
      if (
        new Date(meds[0]).getDate() === new Date().getDate() &&
        subDays(new Date(meds[0]), 1).getDate() !== new Date(meds[1]).getDate()
        ) {
          setDays(1);
        }
        console.log(days); // これがあるとdaysが２にならず、最終的に１になってくれる
        console.log(days); // 2回やらないと前日が空いてる場合２になってしまう
      }, [meds]); //medsじゃないとダメ。marksでは上記機能せず
  
  useEffect(() => {
    getDoc(userRef).then((snapshot) => {
      const strftime = require("strftime");
      const med = snapshot.data().taking_medicine_at;
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
  
  const medicineAlert = () => {
    const strftime = require("strftime");
    const today = strftime("%Y年%m月%d日", new Date());
    console.log(today);
    Alert.alert(`${today}の服薬は？`, "", [
      {
        text: "完了！",
        onPress: () => console.log("OK Pressed"),
        style: "cancel",
      },
      { text: "まだ...", onPress: () => console.log("Cancel Pressed") },
    ]);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={ medicineAlert }
        style={{
          marginTop: 10,
          padding: 20,
          backgroundColor: "#88cb7f",
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "white" }}>今日の服薬完了？</Text>
      </TouchableOpacity>
      <Text style={styles.text}>現在の連続服薬日数</Text>
      <Text style={styles.text}>{days}</Text>
      {/* <Text style={styles.text}>連続服薬記録</Text>
      <Text style={styles.text}>{number}</Text> */}
      <Calendar
        monthFormat={"yyyy年 MM月"}
        markedDates={
          marks
        }
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
};

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
    alignItems: 'center',
    justifyContent: 'center',
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
