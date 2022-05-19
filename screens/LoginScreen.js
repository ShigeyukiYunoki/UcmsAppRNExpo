import React, { useState, useEffect, useCallback } from "react";
import {
  signInWithEmailAndPassword,
  TwitterAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
  Button
} from "react-native";
import { auth } from "../src/firebase";
import { useNavigation } from "@react-navigation/native";
import { useTwitter } from "react-native-simple-twitter";
import { SocialIcon } from "@rneui/themed";

const LoginScreen = ({route, navigation}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // const { RNTwitterSignIn } = NativeModules;

  // const onTwitterButtonPress = async () =>  {
  //     await RNTwitterSignIn.init(
  //       process.env.TWITTER_CONSUMER_KEY,
  //       process.env.TWITTER_CONSUMER_SECRET
  //     ).then(() => console.log("Twitter SDK initialized"));
  //   // Perform the login request
  //   const { oauthToken, oauthTokenSecret } = await RNTwitterSignIn.logIn();

  //   // Create a Twitter credential with the tokens
  //   const twitterCredential = auth.TwitterAuthProvider.credential(
  //     oauthToken,
  //     oauthTokenSecret
  //   );

  //   // Sign-in the user with the credential
  //   return auth().signInWithCredential(twitterCredential);
  // }

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.log(error.message);
    }
  };

  // 認証済みかどうかを確認している最中か否か
  const [signInChecking, setSignInChecking] = useState(true);
  // 認証済みか否か
  const [signedIn, setSignedIn] = useState(false);

  const { twitter, TWModal } = useTwitter({
    onSuccess: (user, accessToken) => {
      onTwitterLoginSuccess(user, accessToken);
      console.log(user);
      console.log(accessToken);
    },
  });

  const setCurrentTwitterUser = async () => {
    try{
      const user = auth.currentUser;
      if(user){
        // ログイン済みユーザーの、Twitter上での情報を取得する
        // const twitterRef = doc(db, "users", `${user.uid}`);
        // if(twitterRef){
        //   getDoc(twitterRef).then((snapshot) => {
        //     const doc = snapshot.data().twitter_data;
        //     if(doc){
        //       setTwitterUser(doc.data());
              setSignInChecking(false);
              setSignedIn(true);
          //   }
          // });
        // }
      }else{
        setSignInChecking(false);
        setSignedIn(false);
      }
    }catch(e){
      console.log(e);
    }
  }

    // hook initialize
  useEffect(() => {
    let isMounted = true;
    twitter.setConsumerKey(
      process.env.TWITTER_CONSUMER_KEY,
      process.env.TWITTER_CONSUMER_SECRET
    );
    const unsubscribe = auth.onAuthStateChanged(() => {
      // isMounted === trueのときにしかsetStateするべきではない
      if(isMounted){
        setCurrentTwitterUser();
      }
    });
    // cleanup関数をreturnする
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [])

    // twitter login modal dialogを開く関数
  const toTwitterLogin = useCallback(async () => {
    try {
      setSignInChecking(true);
      setSignedIn(false);
      await twitter.login();
    } catch(e) {
      setSignInChecking(false);
      setSignedIn(false);
      console.log(e.errors);
    }
  }, []);

  // twitterへのログイン成功時に呼ばれるコールバック関数
  const onTwitterLoginSuccess = useCallback(async (user, accessToken) => {
    setSignInChecking(true);
    setSignedIn(false);
    // firebaseで認証する
    const credential = TwitterAuthProvider.credential(accessToken.oauth_token, accessToken.oauth_token_secret);
    await signInWithCredential(auth, credential);
    // const userData = Object.assign(user, accessToken);
    if(auth.currentUser){
      // const uid = auth.currentUser.uid;
      // await setDoc(doc(db, "users", `${uid}`)),
      //   {
      //     twitter_data: userData,
      //   };
      setSignInChecking(false);
      setSignedIn(true);
    }
    Alert.alert("Success", "ログインできました", [
          {
            text: "OK"
          }
        ])
  }, []);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
      }}
    >
      <View style={{ marginBottom: 20 }}>
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

      <Text style={{marginTop: 20}}>もしくは</Text>

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
        <Text style={{ color: "white" }}>TwitterでLoginする</Text>
        <TWModal />
      </TouchableOpacity>

    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
