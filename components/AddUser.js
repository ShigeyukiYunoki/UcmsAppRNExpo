import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import Icon from 'react-native-vector-icons/FontAwesome';

const AddUser = ({ addUser }) => {
  const [user, setUser] = useState('');

  const handleUser = () => {
    addUser(user);
    setUser('');
  };
  
  return (
    <View>
      <TextInput
        style={styles.input}
        onChangeText={setUser}
        value={user}
        placeholder="ユーザ名を入力してください"
      />
      <TouchableOpacity style={styles.btn} onPress={handleUser}>
        <View style={styles.text}>
          <Icon name="plus" size={20} />
          <Text>ユーザ追加</Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    padding: 8,
    margin: 5,
  },
  btn: {
    backgroundColor: 'lightgreen',
    paddingVertical: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  text: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AddUser