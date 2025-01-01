import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function Page() {
  const router = useRouter();
  const toTimerScreen = () => {
    router.push({
      pathname: "/timer",
      params: {
        gameTime: 480000,
        shotTime: 30000,
        pauseTime: 60000,
        teamAName: "Blue",
        teamBName: "White",
        pauseLinked: true,
        isRemote: false,
      },
    });
  };
  const toSettingScreen = () => {
    router.push({
      pathname: "/settingScreen",
    });
  };
  const toRemoteSetting = () => {
    router.push({
      pathname: "/remoteSetting",
    });
  };

  return (
    <View style={styles.container}>
      <Text h1 h1Style={styles.title}>
        水球タイマー
      </Text>
      <View style={styles.main}>
        <Button
          icon={<Ionicons name="timer-outline" size={30} color="white" />}
          title="タイマー画面へ"
          buttonStyle={styles.button}
          onPress={toTimerScreen}
          titleStyle={{ fontSize: 25 }}
        />
        <Button
          icon={<Ionicons name="settings-outline" size={30} color="white" />}
          title="設定画面へ"
          buttonStyle={styles.button}
          onPress={toSettingScreen}
          titleStyle={{ fontSize: 25 }}
        />
        <Button
          icon={
            <MaterialCommunityIcons
              name="cellphone-wireless"
              size={30}
              color="white"
            />
          }
          title="リモート設定へ"
          buttonStyle={styles.button}
          onPress={toRemoteSetting}
          titleStyle={{ fontSize: 25 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  main: {
    justifyContent: "space-around",
    alignItems: "center",
    maxWidth: 960,
    width: "100%",
  },
  title: {
    color: "black",
    marginBottom: 100,
  },
  subtitle: {
    color: "gray",
    marginBottom: 32,
  },
  link: {
    width: "100%",
    marginBottom: 10,
  },
  button: {
    borderRadius: 5,
    padding: 10,
    margin: 10,
    width: 300,
    marginBottom: 20,
  },
});
