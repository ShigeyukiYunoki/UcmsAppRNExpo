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
import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { auth } from "../src/firebase";
import {
  TwitterAuthProvider,
  signInWithCredential,
  onAuthStateChanged
} from "firebase/auth";
import { useTwitter } from "react-native-simple-twitter";
import * as Notifications from "expo-notifications";
import { useNavigation } from "@react-navigation/native";
import { DateTimePickerModal } from "react-native-modal-datetime-picker";
import { Icon } from "@rneui/themed";
import {
  createTable,
  deleteTakingMedicineAt,
  dropTable
} from "../components/Sql";
import * as SQLite from "expo-sqlite";

const HomeScreen = ( ) => {

  const [user, setUser] = useState(auth.currentUser);
  const [medtime, setMedtime] = useState("");
  const [isLoading, setisLoading] = useState(true);

  const reloadPage = useCallback(async function () {
    setisLoading(true);
    setTimeout(() => setisLoading(false), 1000);
  }, []);

  const sqldb = SQLite.openDatabase("db");

  useEffect(() => {
    const strftime = require("strftime");
    // var strftime = require("strftime")ではダメ
    Notifications.cancelAllScheduledNotificationsAsync();
    sqldb.transaction((tx) => {
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
      sqldb.transaction((tx) => {
        tx.executeSql(
          "replace into Users (id, TakingMedicineAt) values (?, ?);",
          [1, `${time}`],
          () => {
            console.log("replace TakingMedicineAt success");
            reloadPage();
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
    createTable();
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

  useEffect(() => {
    setTimeout(() => setisLoading(false), 500);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(user.uid);
        setUser(user);
      } else {
        setUser("");
      }
    });
    return () => unsubscribe();
  }, []);

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

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(user.uid);
        setUser(user);
      } else {
        setUser("");
      }
    });
    return () => unsubscribe();
  };

  useEffect(() => {
    twitter.setConsumerKey(
      process.env.TWITTER_CONSUMER_KEY,
      process.env.TWITTER_CONSUMER_SECRET
    );
  }, []);

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
        <View style={{ flex: 1 }}>
          <View style={{ alignSelf: "center", flex: 1 }}>
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
            <Text
              style={{ fontSize: 30, marginBottom: 10, alignSelf: "center" }}
            >
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
            ) : null}
          </View>

          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <TouchableOpacity
              onPress={toUsers}
              style={{
                marginTop: 20,
                padding: 10,
                paddingLeft: 60,
                paddingRight: 60,
                backgroundColor: "#88cb7f",
                borderRadius: 10,
              }}
            >
              <Icon name="users" type="feather" color="white" size={50} />
              <Text style={{ color: "white", fontSize: 22, marginTop: 10 }}>
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
            ) : null}
          </View>
          <TWModal />
        </View>
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
    justifyContent: "center"
  },
  text: {
    alignItems: "center",
    padding: 10,
    fontSize: 24,
    fontWeight: "bold",
    flex: 1
  },
});

export default HomeScreen;
