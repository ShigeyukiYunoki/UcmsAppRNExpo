import { View, StyleSheet, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
import { db } from "../src/firebase";
import ListUser from "../components/ListUser";
import "react-native-get-random-values";
import { collection, onSnapshot } from "firebase/firestore";

const UsersScreen = () => {
  const [users, setUsers] = useState([]);

    const usersRef = collection(db, "users");

    useEffect(() => {
      const subscriber = onSnapshot(
      usersRef,
      (querySnapshot) => {
        const users = [];
        querySnapshot.forEach((doc) => {
          const userData = doc.data().twitter_data;
          const name = doc.data().name;
          users.push({ userData, key: doc.id, name });
        })
        setUsers(users);
      });
      return () => subscriber;
    },[]);

  return (
    <View style={styles.container}>
      <FlatList
        data={ users }
        renderItem={({ item }) => (
          <ListUser item={item} />
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 30,
    marginRight: 15,
  },
});

export default UsersScreen;