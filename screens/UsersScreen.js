import { View, StyleSheet, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
import ListUser from "../components/ListUser";
import "react-native-get-random-values";
import {REACT_APP_DEV_API_URL_USERS} from "@env";

const UsersScreen = () => {
  const [users, setUsers] = useState([]);

  // const addUser = (name) => {
  //   setUsers((prevUsers) => {
  //     return [{ id: uuidv4(), name }, ...prevUsers];
  //   });
  // };

  // const deleteUser = (id) => {
  //   setUsers((prevUsers) => {
  //     return prevUsers.filter((prevUser) => prevUser.id !== id);
  //   });
  // };

  useEffect(() => {
    const getUser = async () => {
      const res = await fetch(REACT_APP_DEV_API_URL_USERS);
      const users = await res.json();
      setUsers(users);
    };
    getUser();
  }, []);

  return (
    <View style={styles.container}>
      {/* <Header title="ユーザ一覧" /> */}
      {/* <AddUser addUser={addUser} /> */}
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
      {/* <Footer /> */}
    </View>
  );
};

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
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 30,
    marginRight: 15,
  },
});

export default UsersScreen;
