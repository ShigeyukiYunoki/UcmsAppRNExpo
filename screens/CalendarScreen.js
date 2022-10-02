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
import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import "react-native-get-random-values";
import { auth } from "../src/firebase";
import { subDays } from "date-fns";
import { useTwitter } from "react-native-simple-twitter";
import { SocialIcon } from "@rneui/themed";
// React 18.0.0では未対応のため、17.0.2にdowngrade
import Dialog from "react-native-dialog";
import {
  TwitterAuthProvider,
  signInWithCredential,
  onAuthStateChanged
} from "firebase/auth";
import * as SQLite from "expo-sqlite";
import {
  insertMedicine,
  replaceDays,
  deleteMedicine,
} from "../components/Sql";

const CalendarScreen = ({ navigation }) => {

  const [user, setUser] = useState(auth.currentUser);
  const [medicines, setMedicines] = useState([]);
  const [meds, setMeds] = useState([]);
  const [marks, setMarks] = useState({});
  const [days, setDays] = useState(0);
  const [max, setMax] = useState(0);
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
        } else if (meds.length === 1) {
          break;
        } else {
          setDays((day) => day + 1);
          break;
        }
      }
      // console.log(days);
    }
  },[isLoading]);

  useEffect(() => {
    if (meds.length === 1) {
      replaceDays(1, 0);
    }
  },[])

  useEffect(() => {
    let d = 0;
    let id = 0;
    for (let i = 0; i < meds.length; i++) {
      const m1 = new Date(meds[i + 1]).getTime();
      const m2 = new Date(subDays(meds[i], 1)).getTime();
      if (m1 === m2) {
        d++;
      } else if (m2 === 0) {
        break;
      } else {
        d++;
        id++;
        replaceDays(id, d);
        d = 0;
      }
      console.log(m1);
      console.log(m2);
    }
  }, [days]);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `select Days from Days`,
        [],
        (_tx, results) => {
          {
            const len = results.rows.length;
            let maxday = 0;
            if (len === 1) {
              maxday = 0;
            }
            for (let i = 0; i < len; i++) {
              const d = results.rows.item(i).Days;
              console.log(d)
              // if (len === 3) {
              //   maxday = 1;
              // }
              if (maxday <= d) {
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
  }, [days]);

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
        Alert.alert("Twitter認証が必要です", "", [
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
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={styles.text}>現在の連続服薬日数</Text>
            <Text style={styles.text}>{days}</Text>
            <Text style={styles.text}>連続服薬記録</Text>
            <Text style={styles.text}>{max}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Calendar monthFormat={"yyyy年 MM月"} markedDates={marks} />
          </View>
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              onPress={showDialog}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 5,
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
          </View>
        </View>

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
    backgroundColor: "#fff",
  },
  scrollview: {
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
