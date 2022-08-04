import { StyleSheet, View, Text,  } from "react-native";
import React from "react";

const ListMedicine = ({ item }) => {
  return (
    <View style={styles.row}>
      <View style={styles.item}>
        <Text>{item.took_medicine_at}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 40,
    backgroundColor: "lightblue",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 30,
    marginRight: 8,
  },
});

export default ListMedicine
;
