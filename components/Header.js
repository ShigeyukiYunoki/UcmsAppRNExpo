import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { Feather } from '@expo/vector-icons';

const Header = ({title}) => {
  return (
    // <View>
    //   <Text>Header</Text>
    // </View>
    <View style={styles.header}>
      <View style={styles.title}>
       <Feather name="users" size={24} color="black" />
       <Text style={styles.text}>{title}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    height: 90,
    backgroundColor: 'lightgreen',
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  text: {
    fontSize: 20,
    marginLeft: 10,
  },
  container: {
    flex: 1,
  }
});

export default Header