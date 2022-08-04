import React, { useEffect } from "react";
import {
  TwitterAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import {
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert
} from "react-native";
import { auth } from "../src/firebase";
import { useTwitter } from "react-native-simple-twitter";
import { SocialIcon } from "@rneui/themed";
import { db } from "../src/firebase";
import { getDoc, doc, setDoc } from "firebase/firestore";

const LoginScreen = ({ navigation }) => {

  const { twitter, TWModal } = useTwitter({
    onSuccess: (user, accessToken) => {
      onTwitterLoginSuccess(user, accessToken);
      console.log(user);
      console.log(accessToken);
    },
  });

  useEffect(() => {
    twitter.setConsumerKey(
      process.env.TWITTER_CONSUMER_KEY,
      process.env.TWITTER_CONSUMER_SECRET
    );

  }, [])

    // twitter login modal dialogを開く関数
  const toTwitterLogin = async () => {
    try {

      await twitter.login();
    } catch(e) {

      console.log(e.errors);
    }
  };

  // twitterへのログイン成功時に呼ばれるコールバック関数
  const onTwitterLoginSuccess = async (user, accessToken) => {

    // firebaseで認証する
    const credential = TwitterAuthProvider.credential(accessToken.oauth_token, accessToken.oauth_token_secret);
    await signInWithCredential(auth, credential);
    // const firebaseUserCredential = await signInWithCredential(auth, credential);
    // const userData = firebaseUserCredential.user.toJSON();
    if(auth.currentUser){
      const uid = auth.currentUser.uid;
      setDoc(doc(db, "users", `${uid}`), {
        twitter_data: {
          screen_name: user.screen_name,
          profile_image_url: user.profile_image_url,
        },
      },
        { merge: true }
      );
    }
    Alert.alert("Success", "ログインできました!", [
      {
        text: "OK",
        onPress: LoginToCalendar,
      },
    ]);
  };

  const LoginToCalendar = () => {
    const user = auth.currentUser;
    const userRef = doc(db, "users", `${user.uid}`);
    getDoc(userRef).then((snapshot) => {
      const med = snapshot.data().taking_medicine_at;
      if (med) {
        navigation.navigate("Calendar");
      }
    });
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
      }}
    >
      {/* <View style={{ marginBottom: 20 }}>
        <TextInput
          style={{
            width: 250,
            borderWidth: 1,
            padding: 5,
            borderColor: "gray",
          }}
          onChangeText={setEmail}
          value={email}
          placeholder="メールアドレスを入力してください"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      <View style={{ marginBottom: 20 }}>
        <TextInput
          style={{
            width: 250,
            borderWidth: 1,
            padding: 5,
            borderColor: "gray",
          }}
          onChangeText={setPassword}
          value={password}
          placeholder="パスワードを入力してください"
          secureTextEntry={true}
          autoCapitalize="none"
        />
      </View>
      <TouchableOpacity
        style={{
          paddingHorizontal: 50,
          paddingVertical: 15,
          backgroundColor: "#88cb7f",
          borderRadius: 10,
        }}
        onPress={handleLogin}
        // disabled={!email || !password}
      >
        <Text style={{ color: "white" }}>ログイン</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ marginTop: 10 }}
        onPress={() => navigation.navigate("Register")}
      >
        <Text>ユーザ登録はこちら</Text>
      </TouchableOpacity>

      <Text style={{ marginTop: 20 }}>もしくは</Text> */}

      <TouchableOpacity
        style={{
          alignItems: "center",
          justifyContent: "center",
          margin: 10,
          padding: 10,
          backgroundColor: "skyblue",
          borderRadius: 10,
        }}
        onPress={toTwitterLogin}
      >
        <SocialIcon
          iconColor="white"
          iconSize={25}
          iconType="font-awesome"
          type="twitter"
        />
        <Text style={{ color: "white" }}>Login with Twitter </Text>

        <TWModal />

      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
