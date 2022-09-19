import "react-native-gesture-handler";
import * as React from "react";
import { useState, useEffect } from "react";
import {
  LogBox,
  View,
  Text,
  Alert
} from "react-native";
import "react-native-get-random-values";
import { CurrentRenderContext, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import CalendarScreen from "./screens/CalendarScreen";
import UsersScreen from "./screens/UsersScreen";
import UsersCalendarScreen from "./screens/UsersCalendarScreen";
import { auth, db } from "./src/firebase";
import { doc, deleteDoc } from "firebase/firestore";
import {
  TwitterAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
  deleteUser,
} from "firebase/auth";
import * as Notifications from "expo-notifications";
import * as Sentry from "sentry-expo";
import { Icon } from "@rneui/themed";
import {
  Menu,
  Divider,
  Provider,
} from "react-native-paper";
import {
  deleteDocumentDirectory
} from "./components/Sql";
import { useTwitter } from "react-native-simple-twitter";

// import ignoreWarnings from "react-native-ignore-warnings";
// ignoreWarnings("Setting a timer");
// ignoreWarnings("AsyncStorage has been");
LogBox.ignoreLogs(["Setting a timer", "AsyncStorage has been"]);

export default function App({}) {
  Sentry.init({
    dsn: "https://0f591275b08c49bfb3e68c98e2c8c702@o1231533.ingest.sentry.io/6378969",
    enableInExpoDevelopment: true, // falseとした場合、開発時のエラーは無視される
    debug: false, // 製品版ではfalseにする
  });

  useEffect(() => {
    const requestPermissionsAsync = async () => {
      const { granted } = await Notifications.getPermissionsAsync();
      if (granted) {
        return;
      }
      await Notifications.requestPermissionsAsync();
    };
    return () => requestPermissionsAsync();
  }, []);

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }, []);

  const Stack = createNativeStackNavigator();

   const [user, setUser] = useState("");
   useEffect(() => {
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

   const handleLogout = () => {
     signOut(auth)
       .then(() => {
         console.log("logout");
         Alert.alert("ログアウトしました", "", [
           {
             text: "OK",
           },
         ]);
       })
       .catch((error) => {
         console.log(error.message);
       });
   };

   const [medtime, setMedtime] = useState("");

   const deleteUserData = async () => {
     const userRef = doc(db, "users", `${user.uid}`);
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
                   "ぜひまたのご利用を",
                   [
                     {
                       text: "OK",
                       onPress: async () => {
                         try {
                           setMedtime("");
                           deleteDocumentDirectory();
                         } catch (e) {
                           console.error("Error adding document: ", e);
                         }
                       },
                     },
                   ]
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

  // useEffect(() => {
    //   const subscribeNotification = (notification) => {
      //     const { data = {} } = notification
  //     if (notification.origin === "selected") {
  //       if (screen) {
  //         // アプリがバックグラウンドまたは、開かれていない状態で通知を開いた場合
  //         navigation.navigate("Calendar");
  //       } else if (notification.origin === "received") {
  //         // アプリが開かれている場合
  //         navigation.navigate("Calendar");
  //       }
  //     }
  //   };
  //   Notifications.addNotificationReceivedListener(subscribeNotification);
  // }, []);

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

  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);

  return (
    <Provider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerTitle: () => (
                  <View>
                    {user ? (
                      <Menu
                        visible={visible}
                        onDismiss={closeMenu}
                        style={{}}
                        anchor={
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                              Home
                            </Text>
                            <Icon
                              style={{ marginLeft: 20 }}
                              name="navicon"
                              type="evilicon"
                              onPress={openMenu}
                            />
                          </View>
                        }
                      >
                        <Menu.Item
                          icon="alert-decagram"
                          onPress={deleteUserData}
                          title="退会"
                        />
                        <Divider />
                        <Menu.Item
                          onPress={handleLogout}
                          icon="logout"
                          title="ログアウト"
                        />
                      </Menu>
                    ) : null}
                    {!user ? (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                          Home
                        </Text>
                      </View>
                    ) : null}
                    <TWModal />
                  </View>
                )
              }
            }
          ></Stack.Screen>
          <Stack.Screen name="Calendar" component={CalendarScreen} />
          <Stack.Screen name="Users" component={UsersScreen} />
          <Stack.Screen name="UsersCalendar" component={UsersCalendarScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
