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
  const [gameTime, setGameTime] = useState("4800"); // ゲームタイムの初期値
  const [shotTime, setShotTime] = useState("300"); // ショットクロックの初期値
  const [teamAName, setTeamAName] = useState("Blue"); // チームAの名前
  const [teamBName, setTeamBName] = useState("White"); // チームBの名前
  const [pauseLinked, setPauseLinked] = useState(true); // pauseの連動設定
  const [pauseTime, setPauseTime] = useState("600"); // pauseの連動設定

  const router = useRouter();

  const toTimerScreen = () => {
    router.push({
      pathname: "/timer",
      params: {
        gameTime: parseInt(gameTime * 100),
        shotTime: parseInt(shotTime * 100),
        pauseTime: parseInt(pauseTime * 100),
        teamAName,
        teamBName,
        pauseLinked,
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
          <Text style={styles.label}>ゲームタイム:</Text>
          <View style={styles.timeAdjustContainer}>
            <TouchableOpacity
              onPress={() =>
                setGameTime(String(Math.max(1, parseInt(gameTime, 10) - 600)))
              }
              style={styles.timeAdjustButton}
            >
              <Text>- 1分</Text>
            </TouchableOpacity>
            <Text style={styles.timeDisplay}>
              {Math.floor(parseInt(gameTime, 10) / 600)}分
            </Text>
            <TouchableOpacity
              onPress={() => setGameTime(String(parseInt(gameTime, 10) + 600))}
              style={styles.timeAdjustButton}
            >
              <Text>+ 1分</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>ショットクロック:</Text>
          <View style={styles.timeAdjustContainer}>
            <TouchableOpacity
              onPress={() =>
                setShotTime(String(Math.max(0, parseInt(shotTime) - 50)))
              }
              style={styles.timeAdjustButton}
            >
              <Text>-5秒</Text>
            </TouchableOpacity>
            <Text style={styles.timeDisplay}>
              {Math.floor(parseInt(shotTime) / 10)}秒
            </Text>
            <TouchableOpacity
              onPress={() =>
                setShotTime(String(Math.min(600, parseInt(shotTime) + 50)))
              }
              style={styles.timeAdjustButton}
            >
              <Text>+ 5秒</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>チームAの名前:</Text>
          <Input value={teamAName} onChangeText={setTeamAName} />
          <Text style={styles.label}>チームBの名前:</Text>
          <Input value={teamBName} onChangeText={setTeamBName} />
          <CheckBox
            checked={!pauseLinked}
            onPress={() => setPauseLinked(!pauseLinked)}
            size={30}
            title="ゲームタイマーの流しを有効にする"
          />
          <Text style={[styles.label, { opacity: !pauseLinked ? 1 : 0 }]}>
            ゲームタイマーを止める時間:
          </Text>
          <View
            style={[
              styles.timeAdjustContainer,
              { opacity: !pauseLinked ? 1 : 0 },
            ]}
          >
            <TouchableOpacity
              onPress={() =>
                setPauseTime(String(Math.max(0, parseInt(pauseTime, 10) - 600)))
              }
              style={styles.timeAdjustButton}
            >
              <Text>- 1分</Text>
            </TouchableOpacity>
            <Text style={styles.timeDisplay}>
              {Math.floor(parseInt(pauseTime, 10) / 600)}分
            </Text>
            <TouchableOpacity
              onPress={() =>
                setPauseTime(
                  String(Math.min(gameTime, parseInt(pauseTime, 10) + 600))
                )
              }
              style={styles.timeAdjustButton}
            >
              <Text>+ 1分</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <View>
        <Text
          style={{
            fontSize: 18,
            marginTop: 10,
            marginBottom: 5,
            marginHorizontal: 20,
            fontWeight: "bold",
          }}
        >
          {!pauseLinked
            ? `ゲームタイマーは残り${
                pauseTime / 600
              }分まで流し、その後はショットタイマーと連動して止まります。流しの間はショットタイマーをタップしてもゲームタイマーが止まりません。`
            : "ゲームタイマー及びショットタイマーをタップすると連動して止まります。"}
        </Text>
      </View>

      <Button onPress={toTimerScreen} title="タイマー画面を開く" raised />
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
