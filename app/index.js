import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-elements";
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";

export default function Page() {
  const router = useRouter();
  const toTimerScreen = () => {
    router.push({
      pathname: "/timerScreen",
      params: {
        gameTime: 4800,
        shotTime: 300,
        pauseTime: 0,
        teamAName: "Blue",
        teamBName: "White",
        pauseLinked: true,  
      },
    });
  };
  const toSettingScreen = () => {
    router.push({
      pathname: "/settingScreen",
    });
  };
  return (
    <View style={styles.container}>
      <Text h1 h1Style={styles.title}>
        水球タイマーアプリ
      </Text>
      <View style={styles.main}>
          <Button
            icon={<Icon name="ios-timer" size={24} color="white" />}
            title="タイマー画面へ"
            buttonStyle={styles.button}
            onPress={toTimerScreen}
            titleStyle={{ fontSize: 20 }}
          />
          <Button
            icon={<Icon name="ios-settings" size={24} color="white" />}
            title="設定画面へ"
            buttonStyle={styles.button}
            onPress={toSettingScreen}
            titleStyle={{ fontSize: 20 }}
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
    //backgroundColor: "black",
    borderRadius: 5,
    padding: 10,
    margin: 10,
    width: 300,
  },
});
