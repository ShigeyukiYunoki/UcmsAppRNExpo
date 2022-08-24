import { Calendar, LocaleConfig } from "react-native-calendars";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import "react-native-get-random-values";
import { auth } from "../src/firebase";
import * as Notifications from "expo-notifications";
import { subDays } from "date-fns";
import { useTwitter } from "react-native-simple-twitter";
import { SocialIcon } from "@rneui/themed";
// React 18.0.0では未対応のため、17.0.2にdowngrade
import Dialog from "react-native-dialog";
import {
  TwitterAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import * as SQLite from "expo-sqlite";
import {
  insertMedicine,
  replaceDays,
  deleteMedicine,
} from "../components/Sql";

const CalendarScreen = ({ navigation }) => {

  const [medicines, setMedicines] = useState([]);
  const [meds, setMeds] = useState([]);
  const [marks, setMarks] = useState({});
  const [days, setDays] = useState(0);
  const [max, setMax] = useState(0);
  const [twit, setTwit] = useState({});
  const [isLoading, setisLoading] = useState(true);

  const reloadPage = useCallback(async function () {
    setisLoading(true);
    setTimeout(() => setisLoading(false), 1000);
  },[]);
  
  const db = SQLite.openDatabase("db");

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `select TookMedicineAt from Medicines order by TookMedicineAt asc`,
        [],
        (_tx, results) => {
          const len = results.rows.length;
          const items = [];
          for (let i = 1; i < len; i++) {
            const t = results.rows.item(i).TookMedicineAt;
            items.push(t);
          }
          setMedicines(items);
          // console.log(medicines);
          // Array [
          //   "2022-08-07",
          //   "2022-08-14",
          //   "2022-08-19",
          // ]
        },
        () => {
          console.log("select TookMedicineAt faile");
        }
      );
    });
  },[medicines]);
  
  
  useEffect(() => {
    const strftime = require("strftime");
    const tookMedicineToday = strftime("%Y-%m-%d", new Date());
    const today = strftime("%Y年%m月%d日", new Date());

    db.transaction((tx) => {
      tx.executeSql(
        `select TookMedicineAt from Medicines order by TookMedicineAt desc limit 1`,
        [],
        (_tx, results) => {
          if (results.rows.item(0).TookMedicineAt !== tookMedicineToday) {
            Alert.alert(`${today}の服薬は？`, "", [
              {
                text: "完了！",
                onPress: async () => {
                  try {
                    insertMedicine(tookMedicineToday);
                    // deleteMedicine();
                    reloadPage();
                  } catch (e) {
                    console.error("Error adding document: ", e);
                  }
                },
                style: "cancel",
              },
              { text: "まだ...", onPress: () => navigation.navigate("Home") },
            ]);
          }
        },
        () => {
          console.log("select TookMedicineAt faile");
        }
      );
    });
  }, []);
  
  useEffect(() => {
    const markedDates = {};
    medicines.forEach((i) => {
      markedDates[i] = {
        selected: true,
        marked: true,
        selectedColor: "lightgreen",
      };
    });
    setMarks(markedDates);
  }, [medicines]);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `select TookMedicineAt from Medicines order by TookMedicineAt desc`,
        [],
        (_tx, results) => {
          const len = results.rows.length;
          const items = [];
          for (let i = 0; i < len; i++) {
            const t = new Date(results.rows.item(i).TookMedicineAt);
            items.push(t);
            // console.log(results.rows.item(i).TookMedicineAt);
          }
          setMeds(items);
          // console.log(meds);
          // Array [
          //   2022-08-14T00:00:00.000Z,
          //   2022-08-07T00:00:00.000Z,
          //   1970-01-01T00:00:00.000Z,
          // ]
        },
        () => {
          console.log("select TookMedicineAt faile");
        }
      );
    });
  },[marks]);


  useEffect(() => {
    setDays(0);
    for (let i = 0; i < meds.length; i++) {
      const m1 = new Date(meds[i + 1]).getTime();
      const m2 = new Date(subDays(meds[i], 1)).getTime();
      if (days === 0) {
        if (m1 === m2) {
          setDays((day) => day + 1);
        } else {
          setDays((day) => day + 1);
          break;
        }
      }
      // console.log(days);
    }
  },[isLoading]);

  useEffect(() => {
    let d = 0;
    let id = 0;
    for (let i = 0; i < meds.length; i++) {
      const m1 = new Date(meds[i + 1]).getTime();
      const m2 = new Date(subDays(meds[i], 1)).getTime();
      if (m1 === m2) {
        d++;
      } else {
        d++;
        id++;
        replaceDays(id, d);
        d = 0;
      }
      // console.log(m1);
      // console.log(m2);
    }
  }, [isLoading]);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `select Days from Days`,
        [],
        (_tx, results) => {
          {
            const len = results.rows.length;
            let maxday = 0;
            for (let i = 0; i < len; i++) {
              const d = results.rows.item(i).Days;
              // console.log(d)
              if (len === 1) {
                maxday = d;
              }
              if (maxday < d) {
                maxday = d;
              }
            }
            setMax(maxday);
          }
        },
        () => {
          console.log("select Days faile");
        }
      );
    });
  }, [isLoading]);

  // useEffect(() => {
  //   getDoc(userRef).then((snapshot) => {
  //     const strftime = require("strftime");
  //     const med = snapshot.data().taking_medicine_at;
  //     const m = strftime("%B %d, %Y %H:%M:%S", new Date(med));
  //     const m_hour = Number(strftime("%H", new Date(m)));
  //     const m_minute = Number(strftime("%M", new Date(m)));
  //     Notifications.cancelAllScheduledNotificationsAsync();
  //     Notifications.scheduleNotificationAsync({
  //       content: {
  //         body: "服薬を記録して、一緒に習慣化しましょう！",
  //         title: "UcmsApp",
  //         subtitle: "今日の服薬はおわりましたか？",
  //       },
  //       trigger: {
  //         hour: m_hour,
  //         minute: m_minute,
  //         repeats: true,
  //       },
  //     });
  //   });
  // }, []);

  const { twitter, TWModal } = useTwitter({
    onSuccess: (user, accessToken) => {
      onTwitterLoginSuccess(user, accessToken);
      console.log(user);
      console.log(accessToken);
      showDialog();
    },
  });

  const onTwitterLoginSuccess = async (_user, accessToken) => {
    const credential = TwitterAuthProvider.credential(
      accessToken.oauth_token,
      accessToken.oauth_token_secret
    );
    await signInWithCredential(auth, credential);
  };

  const tweet = async () => {
    try {
      await twitter.api("POST", "statuses/update.json", {
        status: text,
      });

      Alert.alert("Success", "ツイートできました", [
        {
          text: "OK",
        },
      ]);
    } catch (e) {
      console.log(e.message);
      if (
        e.message !==
        `{"errors":[{"code":187,"message":"Status is a duplicate."}]}`
      ) {
        Alert.alert("再度認証が必要です", "", [
          {
            text: "OK",
            onPress: () => {
              twitter.login();
            },
          },
        ]);
      } else {
        Alert.alert("同じ内容で連続投稿できません", "", [
          {
            text: "OK",
            onPress: () => {
              showDialog;
            },
          },
        ]);
      }
    }
  };

  useEffect(() => {
    onChangeText(`\n現在の連続服薬日数 ${days} \n連続服薬記録 ${max} \n\n #潰瘍性大腸炎 #UcmsApp`);
  },[days, max]);

  const [visible, setVisible] = useState(false);
  const [text, onChangeText] = useState("");

  const showDialog = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleTweet = () => {
    setVisible(false);
    tweet();
  };
  
  useEffect(() => {
    setTimeout(() => setisLoading(false), 200);
  }, []);

  const [ctxHeight, setCtxHeight] = useState(0);
  const handleContentSizeChange = (_contentWidth, contentHeight) => {
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
        contentContainerStyle={styles.scrollview}
        scrollEnabled={scrollEnabled}
        onContentSizeChange={handleContentSizeChange}
      >
        <Text style={styles.text}>現在の連続服薬日数</Text>
        <Text style={styles.text}>{days}</Text>
        <Text style={styles.text}>連続服薬記録</Text>
        <Text style={styles.text}>{max}</Text>
        <Calendar monthFormat={"yyyy年 MM月"} markedDates={marks} />
        {twit ? (
          <TouchableOpacity
            onPress={showDialog}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 10,
              marginBottom: 5,
              backgroundColor: "skyblue",
              borderRadius: 10,
            }}
          >
            <SocialIcon
              iconColor="white"
              iconSize={18}
              iconType="font-awesome"
              type="twitter"
            />
            <Text style={{ color: "white", fontSize: 16 }}>
              服薬記録をツイート
            </Text>
          </TouchableOpacity>
        ) : (
          <Text></Text>
        )}
        <Dialog.Container visible={visible}>
          <Dialog.Title>服薬記録を共有しましょう！</Dialog.Title>
          <Dialog.Input
            defaultValue={text}
            onChangeText={(text) => onChangeText(text)}
            // keyboardType="twitter"
            // autoFocus="true"
            multiline
            numberOfLines={8}
          ></Dialog.Input>
          <Dialog.Button label="やめる" onPress={handleCancel} />
          <Dialog.Button label="ツイート" onPress={handleTweet} />
        </Dialog.Container>
        <TWModal />
      </ScrollView>
    </SafeAreaView>
  );
};

LocaleConfig.locales.jp = {
  monthNames: [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ],
  monthNamesShort: [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ],
  dayNames: [
    "日曜日",
    "月曜日",
    "火曜日",
    "水曜日",
    "木曜日",
    "金曜日",
    "土曜日",
  ],
  dayNamesShort: ["日", "月", "火", "水", "木", "金", "土"],
};
LocaleConfig.defaultLocale = "jp";

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
  item: {
    padding: 30,
    backgroundColor: "#88cb7f",
    flexDirection: "row",
    alignItems: "center",
  },
});

export default CalendarScreen;
