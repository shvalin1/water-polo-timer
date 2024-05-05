import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, ScrollView } from "react-native";
import {
  CheckBox,
  Button,
  Input,
  ThemeProvider,
  Text,
} from "react-native-elements";
import { Link, useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import "expo-router/entry";

export default function SettingsPage() {
  const [timerId, setTimerId] = useState(null); // タイマーID
  const router = useRouter();

  const toRemoteTimerScreen = () => {
    router.push({
      pathname: "/remoteTimer",
      params: {
        timerId: "test",
      },
    });
  };

  const theme = {
    Button: {
      containerStyle: {
        margin: 30,
      },
    },
    Input: {
      containerStyle: {
        paddingHorizontal: 20,
      },
    },
    CheckBox: {
      containerStyle: {
        backgroundColor: "transparent",
        borderWidth: 0,
      },
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <Link href="/" style={styles.backButton}>
        <AntDesign name="back" size={24} color="black" />
        <Text style={styles.backButtonText}>戻る</Text>
      </Link>
      <ScrollView>
        <View style={styles.container}>
          <Text style={styles.label}>タイマーID:</Text>
          <Input value={setTimerId} onChangeText={setTimerId} />
          <Text
            style={{
              fontSize: 18,
              marginTop: 10,
              marginBottom: 5,
              marginHorizontal: 20,
              fontWeight: "bold",
            }}
          >
            リモート接続タイマーです。スタートやストップ操作は受け付けません。
          </Text>
        </View>
      </ScrollView>
      <Button onPress={toRemoteTimerScreen} title="タイマー画面を開く" raised />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  timerId: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    alignSelf: "flex-start",
    marginLeft: 20,
    marginBottom: 5,
    fontSize: 18, // フォントサイズを少し大きく
    fontWeight: "bold", // フォントを太字に
  },
  timeAdjustButton: {
    backgroundColor: "white", // 背景色を白に
    padding: 10,
    margin: 10,
    borderRadius: 10, // 角を丸くする
    shadowColor: "#000", // 影の色
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  timeDisplay: {
    fontSize: 24, // タイマー表示のフォントサイズを大きく
    marginHorizontal: 20, // 横の余白を追加
    fontWeight: "bold", // フォントを太字に
  },
  pausedTimeDisplay: {
    fontSize: 24, // タイマー表示のフォントサイズを大きく
    marginHorizontal: 20, // 横の余白を追加
    fontWeight: "bold", // フォントを太字に
    color: "red", // 赤色に
  },
  timeAdjustContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30, // 下の余白を追加
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30, // 下の余白を追加
  },
  backButton: {
    marginTop: 10, // 下の余白を追加
    marginLeft: 20, // 左の余白を追加
    width: 100, // 幅を指定
  },
  backButtonText: {
    fontSize: 18, // フォントサイズを大きく
    fontWeight: "bold", // フォントを太字に
  },
});
