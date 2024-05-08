import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  StyleSheet,
  Animated,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import { useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import { ShotClock, GameClock, NormalTimer } from "../component/Clock";

//ステータスバーの高さを引いた高さを取得する

export default function RemoteTimer() {
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
  const [screen, setScreen] = useState("normal");
  const [clockFontSize, setClockFontSize] = useState({
    GameTimerTextSize: 100,
    ShotTimerTextSize: 100,
    ScoreTextSize: 100,
  });

  useEffect(() => {
    setScreen(params.screen);
    setClockFontSize({
      GameTimerTextSize: Number(params.GameTimerTextSize),
      ShotTimerTextSize: Number(params.ShotTimerTextSize),
      ScoreTextSize: Number(params.ScoreTextSize),
    });
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

  const onPress = () => {
    setScreen((prevScreen) => {
      switch (prevScreen) {
        case "normal":
          return "shotClock";
        case "shotClock":
          return "gameClock";
        case "gameClock":
          return "normal";
        default:
          return "normal";
      }
    });
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      {screen == "normal" && (
        <NormalTimer
          timerData={timerData}
          now={now}
          ShotTimerNow={ShotTimerNow}
          blinkingOpacity={blinkingOpacity}
          params={clockFontSize}
        />
      )}
      {screen == "gameClock" && (
        <GameClock
          timerData={timerData}
          now={now}
          blinkingOpacity={blinkingOpacity}
          params={clockFontSize}
        />
      )}
      {screen == "shotClock" && (
        <ShotClock
          timerData={timerData}
          ShotTimerNow={ShotTimerNow}
          blinkingOpacity={blinkingOpacity}
          params={clockFontSize}
        />
      )}
      <TouchableOpacity onPress={toHomeScreen} style={styles.homeButton}>
        <Icon name="ios-home" size={30} color="white" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "",
    alignItems: "stretch",
    backgroundColor: "black",
  },
  homeButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    margin: 15,
  },
});
