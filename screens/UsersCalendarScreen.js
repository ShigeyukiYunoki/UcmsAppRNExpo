import { Calendar, LocaleConfig } from "react-native-calendars";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import "react-native-get-random-values";
import {
  doc,
  getDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../src/firebase";
import { subDays, format } from "date-fns";

const UsersCalendarScreen = ({ route }) => {
  const uid = route.params.uid;
  const userRef = doc(db, "users", `${uid}`);
  const tookMedicinesRef = collection(db, "users", `${uid}`, "medicines");

  const [medicines, setMedicines] = useState([]);
  const [meds, setMeds] = useState([]);
  const [marks, setMarks] = useState({});
  const [days, setDays] = useState(0);
  const [max, setMax] = useState(0);
  const [isLoading, setisLoading] = useState(true);

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
    return () => unsubscribe();
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
    for (let i = 0; i < meds.length; i++) {
      const m1 = new Date(meds[i + 1]).getTime();
      const m2 = new Date(subDays(meds[i], 1)).getTime();
      if (days === 0) {
        if (m1 === m2) {
          setDays((day) => day + 1);
        } else {
          setDays((day) => day + 1);
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

  useEffect(() => {
    if (
      new Date(meds[0]).getDate() === new Date().getDate() &&
      subDays(new Date(meds[0]), 1).getDate() !== new Date(meds[1]).getDate()
    ) {
      setDays(1);
    }
  }, [days]);

  useEffect(() => {
     getDoc(userRef).then((snapshot) => {
       const m = snapshot.data().max_days;
       if (m) {
         setMax(m);
       } else {
         setMax(0);
       }
     });
  },[])

   useEffect(() => {
     setTimeout(() => setisLoading(false), 500);
   }, []);

  return (
    isLoading ? (
    <View style={styles.container}>
      <ActivityIndicator />
    </View>) : (
    <View style={styles.container}>
      <Text style={styles.text}>現在の連続服薬日数</Text>
      <Text style={styles.text}>{days}</Text>
      <Text style={styles.text}>連続服薬記録</Text>
      <Text style={styles.text}>{max}</Text>
      <Calendar monthFormat={"yyyy年 MM月"} markedDates={marks} />
    </View>
    )
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
    alignItems: "center",
    justifyContent: "center",
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

export default UsersCalendarScreen;
