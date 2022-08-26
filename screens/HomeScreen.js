import {
  View,
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import { auth } from "../src/firebase";
import {
  signOut,
  // updateProfile,
  deleteUser,
  TwitterAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { useTwitter } from "react-native-simple-twitter";
import * as Notifications from "expo-notifications";
import { useNavigation } from "@react-navigation/native";
import { DateTimePickerModal } from "react-native-modal-datetime-picker";
import { Icon } from "@rneui/themed";
import {
  createTable,
  dropTable,
  deleteTakingMedicineAt
} from "../components/Sql";
import * as SQLite from "expo-sqlite";

const HomeScreen = ( ) => {
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("logout");
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  const user = auth.currentUser;
  const [medtime, setMedtime] = useState("");
  const [isLoading, setisLoading] = useState(true);

   const db = SQLite.openDatabase("db");

  useEffect(() => {
    const strftime = require("strftime");
    // var strftime = require("strftime")ではダメ
    Notifications.cancelAllScheduledNotificationsAsync();
    db.transaction((tx) => {
      tx.executeSql(
        `select TakingMedicineAt from Users where id = 1`,
        [],
        (_tx, results) => {
          const med = results.rows.item(0).TakingMedicineAt;
          // console.log(med);
          const m = strftime("%B %d, %Y %H:%M:%S", new Date(med));
          const m_hour = Number(strftime("%H", new Date(m)));
          const m_minute = Number(strftime("%M", new Date(m)));
          Notifications.scheduleNotificationAsync({
            content: {
              body: "服薬を記録して、一緒に習慣化しましょう！",
              title: "UcmsApp",
              subtitle: "今日の服薬はおわりましたか？",
              sound: "sound.wav"
            },
            trigger: {
              hour: m_hour,
              minute: m_minute,
              repeats: true,
            },
          });
          setMedtime(med);
        },
        () => {
          console.log("select TakingMedicineAt faile");
        }
      );
    });
  }, [medtime]);

  useEffect(() => {
    createTable();
    // dropTable();
  },[])

  const navigation = useNavigation();

  const toCalendar = () => {
    navigation.navigate("Calendar", {
      Id: 1,
    });
  };

  const toUsers = () => {
    navigation.navigate("Users");
  };

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      () => {
        navigation.navigate("Calendar");
      }
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    console.log(user.displayName);
  }, []);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = async (time) => {
    hideDatePicker();
    try {
      db.transaction((tx) => {
        tx.executeSql(
          "replace into Users (id, TakingMedicineAt) values (?, ?);",
          [1, `${time}`],
          () => {
            console.log("replace TakingMedicineAt success");
          },
          () => {
            console.log("replace TakingMedicineAt faile");
          }
        );
      });
    } catch (error) {
      console.log(error);
    }
    const strftime = require("strftime");
    const takingMedicineTime = strftime("%H:%M", time);
    setMedtime(takingMedicineTime);
    Alert.alert(takingMedicineTime, "にお知らせします", [
      {
        onPress: async () => {
          try {
            navigation.navigate("Calendar");
          } catch (e) {
            console.error("Error adding document: ", e);
          }
        },
      },
    ]);
  };

  useEffect(() => {
    setTimeout(() => setisLoading(false), 500);
  }, [medtime]);

  const deleteUserData = async () => {
    try {
      Alert.alert("記録が全て消去されます", "本当に退会しますか？", [
        {
          text: "する",
          onPress: async () => {
            Notifications.cancelAllScheduledNotificationsAsync();
            deleteUser(user)
              .then(() => {
                deleteDoc(userRef)
                  .then(() => {
                    Alert.alert(
                      "あなたの健康を願っております",
                      "ぜひまたのご利用を"
                    );
                  })
                  .catch((e) => {
                    console.log(e);
                  });
              })
              .catch((e) => {
                console.log(e.message);
                if (e) {
                  Alert.alert("再度認証が必要です", "", [
                    {
                      text: "OK",
                      onPress: () => {
                        twitter.login();
                      },
                    },
                  ]);
                }
              });
          },
          style: "cancel",
        },
        { text: "しない" },
      ]);
    } catch (e) {
      console.log(e);
    }
  };

  const { twitter, TWModal } = useTwitter({
    onSuccess: (user, accessToken) => {
      onTwitterLoginSuccess(user, accessToken);
    },
  });

  const onTwitterLoginSuccess = async (user, accessToken) => {
    const credential = TwitterAuthProvider.credential(
      accessToken.oauth_token,
      accessToken.oauth_token_secret
    );
    await signInWithCredential(auth, credential);
  };

  const [ctxHeight, setCtxHeight] = useState(0);
  const handleContentSizeChange = (contentWidth, contentHeight) => {
    setCtxHeight(contentHeight);
  };
  const window = useWindowDimensions();
  const scrollEnabled = ctxHeight > window.height;

  return isLoading ? (
    <View style={styles.container}>
      <ActivityIndicator />
    </View>
  ) : (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerstyle={styles.scrollview}
        scrollEnabled={scrollEnabled}
        onContentSizeChange={handleContentSizeChange}
      >
        <View style={{ alignSelf: "center" }}>
          <Text
            style={{
              fontSize: 30,
              marginTop: 20,
              marginBottom: 20,
              alignSelf: "center",
            }}
          >
            UcmsAppにようこそ
          </Text>
          <Text style={{ fontSize: 30, marginBottom: 10, alignSelf: "center" }}>
            毎日の服薬記録で習慣化
          </Text>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="time"
            onConfirm={handleConfirm}
            confirmTextIOS={"この時刻に通知をうけとる"}
            onCancel={hideDatePicker}
            minimumDate={new Date()}
          />
          <TouchableOpacity
            onPress={showDatePicker}
            style={{
              margin: 20,
              padding: 10,
              backgroundColor: "blue",
              borderRadius: 10,
            }}
          >
            <Icon name="clock" type="evilicon" color="white" size={60} />
            <Text
              style={{
                color: "white",
                fontSize: 25,
                marginTop: 10,
                alignSelf: "center",
              }}
            >
              通知時刻を選択
            </Text>
          </TouchableOpacity>

          {medtime ? (
            <TouchableOpacity
              onPress={async () => {
                try {
                  const notifications =
                    await Notifications.getAllScheduledNotificationsAsync();
                  console.log(notifications);
                  Alert.alert("通知をキャンセル？", "", [
                    {
                      text: "する",
                      onPress: async () => {
                        try {
                          await Notifications.cancelAllScheduledNotificationsAsync();
                          deleteTakingMedicineAt();
                          setMedtime("");
                        } catch (e) {
                          console.error("Error adding document: ", e);
                        }
                      },
                      style: "cancel",
                    },
                    { text: "しない" },
                  ]);
                } catch (e) {
                  console.error("Error adding document: ", e);
                }
              }}
              style={{
                margin: 5,
                padding: 5,
                marginLeft: 60,
                marginRight: 60,
                marginBottom: 10,
                backgroundColor: "#FF8A00",
                borderRadius: 10,
              }}
            >
              <Text
                style={{ color: "white", fontSize: 18, alignSelf: "center" }}
              >
                通知をキャンセル
              </Text>
            </TouchableOpacity>
          ) : (
            <Text></Text>
          )}
        </View>

        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              marginTop: 10,
              marginBottom: 10,
              padding: 13,
              backgroundColor: "skyblue",
              borderRadius: 10,
            }}
          >
            <Icon name="log-out" type="feather" color="white" size={50} />
            <Text style={{ color: "white", fontSize: 18, marginTop: 10 }}>
              ログアウト
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={deleteUserData}
            style={{
              margin: 10,
              padding: 5,
              backgroundColor: "red",
              borderRadius: 10,
              alignSelf: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 18 }}>退会</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toUsers}
            style={{
              marginTop: 10,
              marginBottom: 10,
              padding: 10,
              backgroundColor: "#88cb7f",
              borderRadius: 10,
            }}
          >
            <Icon name="users" type="feather" color="white" size={50} />
            <Text style={{ color: "white", fontSize: 18, marginTop: 10 }}>
              ユーザー一覧
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.text}>
          {medtime ? (
            <TouchableOpacity
              onPress={toCalendar}
              style={{
                margin: 20,
                padding: 10,
                paddingLeft: 60,
                paddingRight: 60,
                backgroundColor: "green",
                borderRadius: 10,
              }}
            >
              <Icon name="calendar" type="evilicon" color="white" size={60} />
              <Text style={{ color: "white", fontSize: 22, marginTop: 10 }}>
                服薬の記録・確認
              </Text>
            </TouchableOpacity>
          ) : (
            <Text></Text>
          )}
        </View>

        <TWModal />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  scrollview: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    alignItems: "center",
    padding: 10,
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default HomeScreen;
