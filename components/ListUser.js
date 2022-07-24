import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking
} from "react-native";
import React from 'react';
import { SocialIcon } from "@rneui/themed";
import { Icon } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";

const ListUser = ({ item }) => {
  const navigation = useNavigation();
  console.log(item);
  return (
    <View style={styles.row}>
      {item.userData ? (
        <View style={styles.item}>
          <Image
            source={{ uri: `${item.userData.profile_image_url}` }}
            style={styles.avatar}
          />
          <Text style={styles.text}>{item.userData.screen_name}</Text>

          <TouchableOpacity style={styles.socialIcon}>
            <SocialIcon
              iconColor="white"
              iconSize={20}
              iconType="font-awesome"
              type="twitter"
              onPress={() =>
                Linking.openURL(
                  `https://twitter.com/${item.userData.screen_name}`
                )
              }
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              padding: 10,
              borderRadius: 10,
              marginLeft: 10,
              backgroundColor: "green",
            }}
          >
            <Icon
              name="calendar"
              type="evilicon"
              color="white"
              size={25}
              onPress={() =>
                navigation.navigate("UsersCalendar", {
                  uid: item.key,
                })
              }
            />
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={styles.item}>
            <Image
              // source={{ uri: "https://i.pravatar.cc/150" }}
              style={styles.avatar}
            />
            <Text style={styles.text}>{item.name}</Text>
          </View>
          <TouchableOpacity
            style={{
              padding: 10,
              borderRadius: 10,
              marginLeft: 10,
              backgroundColor: "green",
            }}
          >
            <Icon
              name="calendar"
              type="evilicon"
              color="white"
              size={25}
              onPress={() =>
                navigation.navigate("UsersCalendar", {
                  uid: item.key,
                })
              }
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 30,
  },
  item: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 30,
    marginRight: 8,
  },
  socialIcon: {
    flex: 1,
    alignItems: "flex-end",
  },
});

export default ListUser