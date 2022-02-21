import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, } from 'react-native';
import Header from './components/Header';
import Footer from './components/Footer';
import ListUser from './components/ListUser';
import AddUser from './components/AddUser';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export default function App() {
  const [users, setUsers] = useState([]);

  const addUser = (name) => {
    setUsers((prevUsers) => {
      return [{id: uuidv4(), name }, ...prevUsers];
    });
  };

  const deleteUser = (id) => {
    setUsers((prevUsers) => {
      return prevUsers.filter((prevUser) => prevUser.id !== id);
    });
  };

  useEffect(() => {
    const getUser = async () => {
      const res = await fetch('https://jsonplaceholder.typicode.com/users');
      const users = await res.json();
      setUsers(users)
    };
    getUser();
  }, []);
  
  return (
    <View style={styles.container}>
      <Header title="ユーザ一覧" />
        <View style={styles.text}>
          <Text>Welcome to UcmsApp!</Text>
        </View>
          <AddUser addUser = { addUser } />
      <FlatList
        data={users}
        renderItem = {({ item }) => (
          <ListUser item = { item } deleteUser = { deleteUser } />
        )}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => (
        <View
          style={{
            backgroundColor: 'gray',
            height: 1,
          }}
        >
        </View>
      )}
      />
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#fff',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  text: {
    alignItems: 'center',
    padding: 10,
    fontSize: 24,
    fontWeight: 'bold',
  },
  item: {
    padding: 30,
    backgroundColor: '#88cb7f',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 30,
    marginRight: 15,
  },
});
