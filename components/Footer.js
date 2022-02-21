import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const Footer = () => {
  return (
    <View style={styles.footer}>
      <Text>Footer</Text>
    </View>
  )
}
const styles = StyleSheet.create({
  footer: {
    height: 90,
    backgroundColor: 'lightgreen',
  },
});

export default Footer