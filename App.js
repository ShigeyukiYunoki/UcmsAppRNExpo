import "expo-dev-client";
import "react-native-gesture-handler";
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { LogBox, View, Text, Alert, Platform } from "react-native";
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
import * as Device from "expo-device";
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
import {
  AdsConsent,
  AdsConsentDebugGeography,
  AdsConsentStatus,
  BannerAd,
  BannerAdSize,
  TestIds
} from "react-native-google-mobile-ads";
import * as Constants from "expo-constants";

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
  console.log(Constants.default.manifest.extra.TWITTER_CONSUMER_KEY);
  
  const [nonPersonalizedOnly, setNonPersonalizedOnly] = useState(true);
  useEffect(() => {
    // ATTとGDPRの同意状態を取得
    AdsConsent.requestInfoUpdate({
      debugGeography: AdsConsentDebugGeography.EEA, // EU圏としてテストする設定
      testDeviceIdentifiers: ["TEST-DEVICE-HASHED-ID"],
    }).then(async (consentInfo) => {
      let status = consentInfo.status;
      if (
        consentInfo.isConsentFormAvailable &&
        status === AdsConsentStatus.REQUIRED
      ) {
        // 同意状態が必要な場合はダイアログを表示する
        const result = await AdsConsent.showForm();
        status = result.status;
      }

      if (
        consentInfo.status === AdsConsentStatus.OBTAINED ||
        status === AdsConsentStatus.OBTAINED
      ) {
        // 同意が取得できた場合はNonPersonalizedOnlyをfalseにする(トラッキング取得する)
        setNonPersonalizedOnly(false);
        console.log("ok");
      }
    });
  }, []);

  // useEffect(() => {
  //   const requestPermissionsAsync = async () => {
  //    const { granted } = await Notifications.getPermissionsAsync();
  //    if (granted) {
    //      return;
    //    }
  //    await Notifications.requestPermissionsAsync();
  //   };
  //   return () => requestPermissionsAsync();
  // }, []);

  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
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

  async function  registerForPushNotificationsAsync () {
      let token;
      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      if (Device.isDevice) {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== "granted") {
          alert("Failed to get push token for push notification!");
          return;
        }
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log(token);
        this.setState({ expoPushToken: token });
      } else {
        alert("Must use physical device for Push Notifications");
      }

      return token;
    };


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

  const adTestId = __DEV__
    ? TestIds.BANNER
    : process.env.AD_ID;

  const adUnitID = Platform.select({
    ios: process.env.AD_ID,
  });


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
              ),
            }}
          ></Stack.Screen>
          <Stack.Screen name="Calendar" component={CalendarScreen} />
          <Stack.Screen name="Users" component={UsersScreen} />
          <Stack.Screen name="UsersCalendar" component={UsersCalendarScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <View>
        <BannerAd
          unitId={adUnitID}
          size={BannerAdSize.FULL_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
        />
      </View>
    </Provider>
  );
}
