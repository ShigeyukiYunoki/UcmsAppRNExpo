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
import React, {
  useState,
  useEffect
} from "react";
import "react-native-get-random-values";
// import {
//   getDocs,
//   getDoc,
//   collection,
//   addDoc,
//   updateDoc,
//   doc,
//   onSnapshot,
//   query,
//   orderBy,
//   limit
// } from "firebase/firestore";
import { auth } from "../src/firebase";
// import { db } from "../src/firebase";
import * as Notifications from "expo-notifications";
import { subDays, format } from "date-fns";
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
  insertMaxDays,
  updateMinsertMaxDays,
  deleteMedicine,
  selectMinsertMaxDays,
  updateMaxDays,
  selectMaxDays
} from "../components/Sql";
import { daysInWeek } from "date-fns/esm/fp";

const CalendarScreen = ({ navigation }) => {
  const user = auth.currentUser;
  // const userRef = doc(db, "users", `${user.uid}`);
  // const tookMedicinesRef = collection(db, "users", `${user.uid}`, "medicines");

  const [medicines, setMedicines] = useState([]);
  const [meds, setMeds] = useState([]);
  const [marks, setMarks] = useState({});
  const [days, setDays] = useState(0);
  const [d, setD] = useState(0);
  const [max, setMax] = useState(0);
  const [twit, setTwit] = useState({});
  const [isLoading, setisLoading] = useState(true);

  const db = SQLite.openDatabase("db");

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `select TookMedicineAt from Medicines order by TookMedicineAt asc`,
        [],
        (_tx, results) => {
          const len = results.rows.length;
          const items = [];
          for (let i = 0; i < len; i++) {
            const t = results.rows.item(i).TookMedicineAt;
            items.push(t);
          }
          // console.log(items);
          setMedicines(items);
        },
        () => {
          console.log("select faile");
          return false;
        }
      );
    });
  },[medicines]);
  
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
   const strftime = require("strftime");
   const tookMedicineToday = strftime("%Y-%m-%d", new Date());
   const today = strftime("%Y年%m月%d日", new Date());
   db.transaction((tx) => {
     tx.executeSql(
       `select TookMedicineAt from Medicines`,
       [],
       (_tx, results) => {
        if (results.rows.length === 0 ) {
          Alert.alert(`${today}の服薬は？`, "", [
            {
              text: "完了！",
              onPress: async () => {
                try {
                  insertMedicine(tookMedicineToday);
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
         console.log("select faile");
         return false;
       }
     );
   });
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
         console.log("select faile");
         return false;
       }
     );
   });
  }, []);


  // UTCのDateからJSTのDateを取得
  function getJstDate(dateObj) {
    // getTimezoneOffset()はUTCとの差(UTC - JST)を分単位で取得
    // 60 * 1000でミリ秒に変換
    const offset = new Date().getTimezoneOffset() * 60 * 1000;
    // getTime()はUTC現在時間のミリ秒
    const date = new Date(dateObj.getTime() - offset);
    return date;
  }

  useEffect(() => {
  //   const q = query(tookMedicinesRef, orderBy("took_medicine_at", "desc"));
  //   const unsubscribe = onSnapshot(
  //     q,
  //     (querySnapshot) => {
  //       const items = [];
  //       querySnapshot.forEach((doc) => {
  //         const med = format(doc.data().took_medicine_at.toDate(), "Y/M/d");
  //         const m = getJstDate(new Date(med));
  //         items.push(m);
  //       });
  //       setMeds(items);
  //     },
  //     (error) => {
  //       console.error("Error adding document: ", error);
  //     }
  //   );
  //   return () => unsubscribe();
    db.transaction((tx) => {
      tx.executeSql(
        `select TookMedicineAt from Medicines order by TookMedicineAt desc`,
        [],
        (_tx, results) => {
          const len = results.rows.length;
          const items = [];
          for (let i = 0; i < len; i++) {
            const t =
              new Date(results.rows.item(i).TookMedicineAt);
            items.push(t);
          }
          setMeds(items);
          // console.log(meds);
        },
        () => {
          console.log("select faile");
          return false;
        }
      );
    });
  },[marks]);

  useEffect(() => {
    // meds.forEach((index) => {
    //   if (meds[index]+[1] == subDays(meds[index], 1)) {
    //   setDays(days + 1);
    //   }
    // });
    // for (const value of mmm) {
    //   if (value[index + 1] !== subDays(value[index], 1)) break;
    //   setDays(days + 1);
    // }
    // selectMaxDays();
    // db.transaction((tx) => {
    //   tx.executeSql(
    //     `select MaxDays from Users`,
    //     [],
    //     (_tx, results) => {
    //       // console.log("select success");
    //       setD(results.rows.item(0).MaxDays);
    //     },
    //     () => {
    //       console.log("select faile");
    //     }
    //   );
    // });

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
      db.transaction((tx) => {
        tx.executeSql(
          `select MaxDays from Users`,
          [],
          (_tx, results) => {
            // _, {rows}
            setD(results.rows.item(0).MaxDays);
            // console.log(
            //   "select result:" + JSON.stringify(rows._array)
            // );
          },
          () => {
            console.log("select faile");
          }
        );
      });
      if (d < days) {
        updateMaxDays(days);
        break;
      }
    }

    // db.transaction((tx) => {
    //   tx.executeSql(
    //     `select MaxDays from Users`,
    //     [],
    //     (_tx, results) => {
    //       // console.log("select success");
    //       setMax(results.rows.item(0).MaxDays);
    //     },
    //     () => {
    //       console.log("select faile");
    //     }
    //   );
    // });
    // insertMaxDays(10);
    // selectTakingMedicineAt();
    // if (
    //   new Date(meds[0]).getDate() !== subDays(new Date(), 1).getDate() &&
    //   new Date(meds[0]).getDate() !== new Date().getDate()
    // ) {
    //   setDays(0);
    // }
  }, [medicines]);

  // console.log(new Date(subDays(meds[0], 1)).getTime());
  // console.log(new Date(meds[1]).getTime());
  // console.log(new Date(meds[1]).getDate());
  // console.log(subDays(new Date(), 1).getDate());

  // useEffect(() => {
  //   if (
  //     new Date(meds[0]).getDate() === new Date().getDate() &&
  //     subDays(new Date(meds[0]), 1).getDate() !== new Date(meds[1]).getDate()
  //   ) {
  //     setDays(1);
  //   }
    // console.log(days); // これがあるとdaysが２にならず、最終的に１になってくれる
    // console.log(days); // 2回やらないと前日が空いてる場合２になってしまう
  // }, [days]);
  //medsじゃないとダメ。marksでは上記機能せず
  // 上記はどれもダメで結果daysが変わるので、daysで更新した

  const eachCons = (array, num) => {
    return Array.from({ length: array.length - num + 1 }, (_, i) =>
      array.slice(i, i + num)
    );
  };
  const array = meds;

  const eachConsmeds = eachCons(array, 2);

  // useEffect(() => {
  //   let forMax = 0;
  //   for (let i = 0; i < eachConsmeds.length; i++) {
  //     const first = new Date(subDays(eachConsmeds[i][0], 1)).getTime();
  //     const second = new Date(eachConsmeds[i][1]).getTime();
  //     console.log(eachConsmeds);
  //     if (first === second) {
  //       forMax++;
  //       if (max <= forMax) {
  //         setMax(forMax);
  //       }
  //     } else {
  //       forMax = 0;
  //     }
  //   }
  // },[days]);

  // useEffect(() => {
  //   if (days === 1) {
  //     updateDoc(doc(db, "users", `${user.uid}`), {
  //       max_days: 1,
  //     });
  //   } else if (days === 2) {
  //     updateDoc(doc(db, "users", `${user.uid}`), {
  //       max_days: 2,
  //     });
  //   }
  // },[])

  useEffect(() => {
    // getDoc(userRef).then((snapshot) => {
    //   const m = snapshot.data().max_days;
    //   setMax(m);
    // });
    db.transaction((tx) => {
      tx.executeSql(
        `select MaxDays from Users`,
        [],
        (_tx, results) => {
          // console.log("select success");
          setMax(results.rows.item(0).MaxDays);
        },
        () => {
          console.log("select faile");
        }
      );
    });
  },[marks])


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
     setTimeout(() => setisLoading(false), 500);
  },[])

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
