import { Calendar, LocaleConfig } from "react-native-calendars";
import { View, Text, StyleSheet, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
import "react-native-get-random-values";
import { REACT_APP_DEV_API_URL_MEDICINES } from "@env";
import ListMedicine from "../components/ListMedicine";

const CalendarScreen = () => {
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    const getMedicine = async () => {
      const res = await fetch(REACT_APP_DEV_API_URL_MEDICINES);
      const medicines = await res.json();
      setMedicines(medicines);
    };
    getMedicine();
  }, []);
  return (
    <View style={styles.container}>
      <Calendar
        monthFormat={"yyyy年 MM月"}
        markedDates={{
          "2022-02-16": { selected: true, selectedColor: "lightgreen" },
        }}
      />
      <FlatList
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
      />
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
