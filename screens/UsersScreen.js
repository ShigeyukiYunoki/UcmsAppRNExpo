import { View, StyleSheet, FlatList, Alert } from "react-native";
import * as React from "react";
import { useState, useEffect } from "react";
import { db } from "../src/firebase";
import ListUser from "../components/ListUser";
import "react-native-get-random-values";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";

import {
  onAuthStateChanged,
  TwitterAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { auth } from "../src/firebase";
import { useTwitter } from "react-native-simple-twitter";

const UsersScreen = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [users, setUsers] = useState([]);

    const usersRef = collection(db, "users");

    useEffect(() => {
      const subscriber = onSnapshot(
      usersRef,
      (querySnapshot) => {
        const users = [];
        querySnapshot.forEach((doc) => {
          const userData = doc.data().twitter_data;
          const name = doc.data().name;
          users.push({ userData, key: doc.id, name });
        })
        setUsers(users);
      });
      return () => subscriber;
    },[]);

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
     return () => unsubscribe();
     };

     useEffect(() => {
       twitter.setConsumerKey(
         process.env.TWITTER_CONSUMER_KEY,
         process.env.TWITTER_CONSUMER_SECRET
       );
     }, []);

     useEffect(() => {
      if(!user){
        Alert.alert("Twitter認証が必要です", "他のユーザーを見つけましょう！", [
          {
            text: "OK",
            onPress: () => {
              twitter.login();
            },
          },
        ]);
      }
     },[])

  return (
    <View style={styles.container}>
      {user ? (
        <FlatList
          data={users}
          renderItem={({ item }) => <ListUser item={item} />}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => (
            <View
              style={{
                backgroundColor: "gray",
                height: 1,
              }}
            ></View>
          )}
        />
      ) : null}
      <TWModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 30,
    marginRight: 15,
  },
});

export default UsersScreen;