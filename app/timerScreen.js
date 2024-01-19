import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Vibration,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import "expo-router/entry";
import Constants from "expo-constants";
import Icon from "react-native-vector-icons/Ionicons";

const { width, height } = Dimensions.get("window");
//ステータスバーの高さを取得する
const statusBarHeight = Platform.OS == "ios" ? Constants.statusBarHeight : 0;
//ステータスバーの高さを引いた高さを取得する
const standardHeight = (height - statusBarHeight - 300) / 2;

export default function Page() {
  const params = useLocalSearchParams();
  const [gameTime, setGameTime] = useState(4800); // ゲームタイム
  const [shotTime, setShotTime] = useState(300); // ショットクロック
  const [pauseTime, setPauseTime] = useState(600); // pauseの連動設定
  const [teamAName, setTeamAName] = useState("Blue"); // チームAの名前
  const [teamBName, setTeamBName] = useState("White"); // チームBの名前
  const [pauseLinked, setPauseLinked] = useState(true); // pauseの連動設定
  const [isGamePaused, setIsGamePaused] = useState(true); // 一時停止状態
  const [isShotClockPaused, setIsShotClockPaused] = useState(true); // ショットクロックの一時停止状態
  const [teamScores, setTeamScores] = useState({ teamA: 0, teamB: 0 }); // 得点
  const [isStarted, setIsStarted] = useState(true); // ゲーム開始状態

  const router = useRouter();

  useEffect(() => {
    if (params && params.gameTime && params.shotTime) {
      setGameTime(parseInt(params.gameTime, 10));
      setShotTime(parseInt(params.shotTime, 10));
      setPauseTime(parseInt(params.pauseTime, 10));
      setTeamAName(params.teamAName);
      setTeamBName(params.teamBName);
      setPauseLinked(params.pauseLinked === "true");
    }
  }, [params]);

  useEffect(() => {
    let gameInterval;
    if (!isGamePaused) {
      gameInterval = setInterval(() => {
        setGameTime((prevTime) => prevTime - 1);
      }, 100);
    }
    if (gameTime === 0) {
      pauseGameTimer();
      Vibration.vibrate();
    }
    return () => clearInterval(gameInterval);
  }, [isGamePaused, setGameTime, gameTime]);

  useEffect(() => {
    let shotInterval;
    if (!isShotClockPaused) {
      shotInterval = setInterval(() => {
        setShotTime((prevTime) => {
          if (prevTime <= 30 && prevTime > 0 && prevTime % 10 === 0) {
            Haptics.selectionAsync();
          }
          return prevTime > 0 ? prevTime - 1 : 0;
        });
      }, 100);
      if (shotTime === 0) {
        pauseShotClock();
        Vibration.vibrate(1000);
      }
    }
    return () => clearInterval(shotInterval);
  }, [isShotClockPaused, setShotTime, shotTime]);

  useEffect(() => {
    //GameTimeがpauseTimeを過ぎたら、PauseLinkedをtrueにする
    if (gameTime <= pauseTime) {
      setPauseLinked(true);
    }
  }, [gameTime, pauseTime]);

  const blinkingOpacity = useRef(new Animated.Value(1)).current;

  const startBlinking = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkingOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(blinkingOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    if (isGamePaused || isShotClockPaused) {
      startBlinking();
    } else {
      blinkingOpacity.setValue(1); // 点滅を停止して、不透明度をリセット
    }
  }, [isGamePaused, isShotClockPaused, blinkingOpacity]);

  const pauseGameTimer = () => {
    setIsGamePaused(!isGamePaused);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    if (pauseLinked) {
      setIsShotClockPaused(!isShotClockPaused);
    }
  };

  const pauseShotClock = () => {
    setIsShotClockPaused(!isShotClockPaused);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (pauseLinked) {
      setIsGamePaused(!isGamePaused);
    }
  };

  const resetShotTime = (time) => {
    setShotTime(time);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const incrementScore = (team) => {
    setTeamScores((prevScores) => ({
      ...prevScores,
      [team]: prevScores[team] + 1,
    }));
  };

  const decrementScore = (team) => {
    //短いバイブレーションを追加する
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTeamScores((prevScores) => ({
      ...prevScores,
      [team]: Math.max(0, prevScores[team] - 1),
    }));
  };

  const handleStart = () => {
    setIsStarted(false);
    setIsGamePaused(false);
    setIsShotClockPaused(false);
  };

  const toHomeScreen = () => {
    router.push({
      pathname: "/",
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pauseGameTimer} style={styles.timerArea}>
        <Animated.Text
          style={[
            styles.timer,
            { opacity: isGamePaused ? blinkingOpacity : 1 },
          ]}
        >
          {Math.floor(gameTime / 10 / 60)}:
          {Math.floor(gameTime / 10) % 60 < 10 ? "0" : ""}
          {Math.floor(gameTime / 10) % 60}
        </Animated.Text>
      </TouchableOpacity>
      <View style={styles.centerWrapper}>
        <TouchableOpacity
          onPress={() => incrementScore("teamA")}
          onLongPress={() => decrementScore("teamA")}
        >
          <Text style={styles.score}>
            {teamAName}: {teamScores.teamA}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => incrementScore("teamB")}
          onLongPress={() => decrementScore("teamB")}
        >
          <Text style={styles.score}>
            {teamBName}: {teamScores.teamB}
          </Text>
        </TouchableOpacity>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => resetShotTime(200)}
            style={[styles.resetButton, { backgroundColor: "red" }]}
          >
            <Text style={styles.buttonText}>20</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => resetShotTime(parseInt(params.shotTime, 10))}
            style={[styles.resetButton, { backgroundColor: "orange" }]}
          >
            <Text style={styles.buttonText}>
              {parseInt(params.shotTime / 10, 0)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={pauseShotClock} style={styles.timerArea}>
        <Animated.Text
          style={[
            styles.timer,
            { opacity: isShotClockPaused ? blinkingOpacity : 1 },
          ]}
        >
          {Math.floor(shotTime / 10)}.{shotTime % 10}
        </Animated.Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={toHomeScreen} style={styles.homeButton}>
        <Icon name="ios-home" size={30} color="black" />
      </TouchableOpacity>
      {isStarted && (
        <View style={styles.startContainer}>
          <TouchableOpacity onPress={handleStart} style={styles.startButton}>
            <Text style={styles.startText}>START</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  startContainer: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.5)",
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
  },
  startButton: {
    width: 300,
    height: 300,
    borderRadius: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(200,0,0,0.9)",
  },
  container: {
    flex: 1,
    justifyContent: "",
    alignItems: "stretch",
    backgroundColor: "black",
  },
  centerWrapper: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(200,200,200,0.3)",
    height: 300,
  },
  timer: {
    fontSize: 130,
    margin: 10,
    color: "white",
  },
  score: {
    fontSize: 50,
    margin: 0,
    color: "white",
  },
  resetButton: {
    height: 130,
    width: 130,
    borderRadius: 65,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "black",
    shadowRadius: 10,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 0 },
    elevation: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: width,
  },
  timerArea: {
    justifyContent: "center",
    alignItems: "center",
    height: standardHeight,
    width: width,
    //backgroundColor: "rgba(200,200,200,0.)",
  },
  buttonText: {
    fontSize: 60,
    color: "white",
  },
  startText: {
    fontSize: 100,
    color: "white",
  },
  homeButton: {
    position: "absolute",
    top: 0,
    right: 0,
    margin: 15,
  },
});
