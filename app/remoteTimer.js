import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Animated,
  TouchableOpacity,
  Alert,
  BackHandler,
} from "react-native";
import { useRouter } from "expo-router";
import moment from "moment";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import Constants from "expo-constants";

const { width, height } = Dimensions.get("window");
//ステータスバーの高さを取得する
const statusBarHeight = Platform.OS == "ios" ? Constants.statusBarHeight : 0;
//ステータスバーの高さを引いた高さを取得する
const standardHeight = (height - statusBarHeight - 300) / 2;

const RemoteTimer = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [timerData, setTimerData] = useState({
    start: 0,
    shotTimerStart: 0,
    lastLap: 0,
    shotTimerLastLap: 0,
    gameTime: 0,
    shotTimerGameTime: 0,
    isGamePaused: true,
    isShotClockPaused: true,
    teamA: 0,
    teamB: 0,
  });
  const [now, setNow] = useState(0);
  const [ShotTimerNow, setShotTimerNow] = useState(0);
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "timers", params.timerId), (doc) => {
      const data = doc.data();
      if (data) {
        setTimerData(data);
      }
    });
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.push({
          pathname: "/",
        });
        return true;
      }
    );

    return () => {
      backHandler.remove();
      unsubscribe();
    };
  }, []);

  //isGamePausedがtrueからfalseになったらsetIntervalを使ってタイマーを動かす
  useLayoutEffect(() => {
    let animationFrameId;
    let lastTime = Date.now();
    const updateTimer = () => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTime;
      if (deltaTime >= 100) {
        // 100msごとに更新
        setNow((prevNow) => prevNow + deltaTime);
        lastTime = currentTime;
      }
      animationFrameId = requestAnimationFrame(updateTimer);
    };
    if (!timerData.isGamePaused) {
      setNow(timerData.start);
      lastTime = Date.now(); // 初期化時に現在時刻を設定
      animationFrameId = requestAnimationFrame(updateTimer);
    } else {
      cancelAnimationFrame(animationFrameId);
      setNow(0);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [timerData.isGamePaused]);

  useLayoutEffect(() => {
    let shotTimerAnimationFrameId;
    let lastShotTime = Date.now();
    const updateShotTimer = () => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastShotTime;
      if (deltaTime >= 100) {
        // 100msごとに更新
        setShotTimerNow((prevNow) => prevNow + deltaTime);
        lastShotTime = currentTime;
      }
      shotTimerAnimationFrameId = requestAnimationFrame(updateShotTimer);
    };
    if (!timerData.isShotClockPaused) {
      setShotTimerNow(timerData.shotTimerStart);
      lastShotTime = Date.now(); // 初期化時に現在時刻を設定
      shotTimerAnimationFrameId = requestAnimationFrame(updateShotTimer);
    } else {
      cancelAnimationFrame(shotTimerAnimationFrameId);
      setShotTimerNow(0);
    }

    return () => {
      cancelAnimationFrame(shotTimerAnimationFrameId);
    };
  }, [timerData.isShotClockPaused]);

  //gametimeが0になったらタイマーを止める
  useEffect(() => {
    if (timerData.gameTime - (timerData.lastLap + now - timerData.start) <= 0) {
      setTimerData((prev) => ({ ...prev, isGamePaused: true }));
    }
  }, [timerData.gameTime, timerData.lastLap, now, timerData.start]);

  const toHomeScreen = () => {
    router.push({
      pathname: "/",
    });
  };

  const pad = (n) => (n < 10 ? "0" + n : n);

  const formatGameTime = (interval) => {
    const duration = moment.duration(interval);
    let minutes = duration.minutes();
    let seconds = duration.seconds();
    const centiseconds = Math.floor(duration.milliseconds() / 10);
    if (seconds !== timerData.gameTime / 1000) {
      if (centiseconds > 10) {
        seconds += 1;
        if (seconds === 60) {
          minutes += 1;
          seconds = 0;
        }
      }
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const formatShotTime = (interval) => {
    const duration = moment.duration(interval);
    let seconds = duration.seconds();
    const centiseconds = Math.floor(duration.milliseconds() / 10);
    if (seconds !== timerData.shotTimerGameTime / 1000) {
      if (centiseconds > 10) {
        seconds += 1;
      }
    }
    return `${seconds}`;
  };
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
    if (timerData.isGamePaused || timerData.isShotClockPaused) {
      startBlinking();
    } else {
      blinkingOpacity.setValue(1); // 点滅を停止して、不透明度をリセット
    }
  }, [timerData.isGamePaused, timerData.isShotClockPaused, blinkingOpacity]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.timerArea}>
        <Animated.Text
          style={[
            styles.timer,
            { opacity: timerData.isGamePaused ? blinkingOpacity : 1 },
          ]}
        >
          {formatGameTime(
            timerData.gameTime - (timerData.lastLap + now - timerData.start)
          )}
        </Animated.Text>
      </TouchableOpacity>
      <View style={styles.centerWrapper}>
        <TouchableOpacity>
          <Text style={styles.score}>
            {timerData.teamAName}: {timerData.teamA}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.score}>
            {timerData.teamBName}: {timerData.teamB}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.timerArea}>
        {!timerData.shotTimerBlackout && (
          <Animated.Text
            style={[
              styles.timer,
              { opacity: timerData.isShotClockPaused ? blinkingOpacity : 1 },
            ]}
          >
            {formatShotTime(
              timerData.shotTimerGameTime -
                (timerData.shotTimerLastLap +
                  ShotTimerNow -
                  timerData.shotTimerStart)
            )}
          </Animated.Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={toHomeScreen} style={styles.homeButton}>
        <Icon name="ios-home" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

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
    bottom: 0,
    left: 0,
    margin: 15,
  },
  finishContainer: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.5)",
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
  },
  finishButton: {
    width: 300,
    height: 300,
    borderRadius: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,200,0,0.9)",
  },
  finishText: {
    fontSize: 75,
    color: "white",
  },
});

export default RemoteTimer;
