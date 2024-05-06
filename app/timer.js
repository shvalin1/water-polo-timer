import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { Text } from "react-native-elements";
import "expo-router/entry";
import moment from "moment";
import Constants from "expo-constants";
import Icon from "react-native-vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { firebaseFunctions, deleteTimer } from "../firebase";

const { width, height } = Dimensions.get("window");
//ステータスバーの高さを取得する
const statusBarHeight = Platform.OS == "ios" ? Constants.statusBarHeight : 0;
//ステータスバーの高さを引いた高さを取得する
const standardHeight = (height - statusBarHeight - 300) / 2;

export default function Page() {
  const params = useLocalSearchParams();
  const [now, setNow] = useState(0);
  const [start, setStart] = useState(0);
  const [intervalId, setIntervalId] = useState();
  const [lastLap, setLastLap] = useState(0);
  const [gameTime, setGameTime] = useState(300000);
  const [isStarted, setIsStarted] = useState(false);
  const [shotTimerNow, setShotTimerNow] = useState(0);
  const [shotTimerStart, setShotTimerStart] = useState(0);
  const [shotTimerIntervalId, setShotTimerIntervalId] = useState();
  const [shotTimerLastLap, setShotTimerLastLap] = useState(0);
  const [shotTimerGameTime, setShotTimerGameTime] = useState(30000);
  const [shotTimerIsStarted, setShotTimerIsStarted] = useState(false);
  const [isTimerLinked, setIsTimerLinked] = useState(false);
  const [teamAName, setTeamAName] = useState("Blue"); // チームAの名前
  const [teamBName, setTeamBName] = useState("White"); // チームBの名前
  const [teamScores, setTeamScores] = useState({ teamA: 0, teamB: 0 }); // 得点
  const [isGamePaused, setIsGamePaused] = useState(true); // 一時停止状態
  const [isShotClockPaused, setIsShotClockPaused] = useState(true); // ショットクロックの一時停止状態
  const [timerLinkedFrom, setTimerLinkedFrom] = useState(60000); // タイマー連動元
  const [shotTimerBlackout, setShotTimerBlackout] = useState(false); // ショットクロックのブラックアウト状態
  const [isFinished, setIsFinished] = useState(false); // ゲーム終了状態

  const router = useRouter();

  useEffect(() => {
    if (params && params.gameTime && params.shotTime) {
      setGameTime(params.gameTime);
      setShotTimerGameTime(params.shotTime);
      setTimerLinkedFrom(params.pauseTime);
      setIsTimerLinked(params.pauseLinked === "true");
      setTeamAName(params.teamAName);
      setTeamBName(params.teamBName);
    }
  }, [params]);

  useEffect(() => {
    // component will unmount
    return () => clearInterval(intervalId);
  }, [intervalId]);

  useEffect(() => {
    // component will unmount
    return () => clearInterval(shotTimerIntervalId);
  }, [shotTimerIntervalId]); // ShotTimerIntervalId を依存配列に追加

  useEffect(() => {
    if (
      !isTimerLinked &&
      gameTime - (lastLap + now - start) <= timerLinkedFrom
    ) {
      setIsTimerLinked(true);
      if (isShotClockPaused) {
        handleStop();
      }
    }
    if (gameTime - (lastLap + now - start) <= 0) {
      doubleTimerStop();
      setIsFinished(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [gameTime, lastLap, now, start]);

  useEffect(() => {
    if (
      shotTimerGameTime - (shotTimerLastLap + shotTimerNow - shotTimerStart) <=
      0
    ) {
      isTimerLinked ? doubleTimerStop() : handleShotTimerStop();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [shotTimerGameTime, shotTimerLastLap, shotTimerNow, shotTimerStart]);

  useEffect(() => {
    return () => {
      if (params.isRemote) {
        deleteTimer(params.timerId);
      }
    };
  }, []);

  const handleStart = () => {
    const id = setInterval(() => {
      setNow(new Date().getTime());
    }, 100);
    setIntervalId(id);
    setStart(new Date().getTime());
    setLastLap(0);
    setIsStarted(true);
  };

  const handleStop = () => {
    firebaseFunctions.RemoteHandleStop(lastLap + now - start, params.timerId);
    clearInterval(intervalId);
    setLastLap(lastLap + now - start);
    setStart(0);
    setNow(0);
    setIsGamePaused(true);
  };

  const handleResume = () => {
    const newDate = new Date().getTime();
    firebaseFunctions.RemoteHandleResume(newDate, params.timerId);
    setStart(newDate);
    setNow(newDate);
    const id = setInterval(() => {
      setNow(new Date().getTime());
    }, 100);
    setIntervalId(id);
    setIsGamePaused(false);
  };

  const handleReset = () => {
    setLastLap(0);
    setStart(0);
    setNow(0);
    setIsStarted(false);
  };

  // 新しいタイマーの関数を追加
  const handleShotTimerStart = () => {
    const id = setInterval(() => {
      setShotTimerNow(new Date().getTime());
    }, 100);
    setShotTimerIntervalId(id);
    setShotTimerStart(new Date().getTime());
    setShotTimerLastLap(0);
    setShotTimerIsStarted(true);
    setIsShotClockPaused(false);
  };

  const handleShotTimerStop = () => {
    firebaseFunctions.RemoteHandleShotTimerStop(
      shotTimerLastLap + shotTimerNow - shotTimerStart,
      params.timerId
    );
    clearInterval(shotTimerIntervalId);
    setShotTimerLastLap(shotTimerLastLap + shotTimerNow - shotTimerStart);
    setShotTimerStart(0);
    setShotTimerNow(0);
    setIsShotClockPaused(true);
  };

  const doubleTimerStart = () => {
    handleResume();
    handleShotTimerResume();
    setIsGamePaused(false);
    setIsShotClockPaused(false);
    setIsStarted(true);
  };

  const doubleTimerStop = () => {
    handleStop();
    handleShotTimerStop();
  };

  const doubleTimerResume = () => {
    handleResume();
    handleShotTimerResume();
  };

  const handleShotTimerResume = () => {
    const newDate = new Date().getTime();
    firebaseFunctions.RemoteHandleShotTimerResume(newDate, params.timerId);
    setShotTimerStart(newDate);
    setShotTimerNow(newDate);
    const id = setInterval(() => {
      setShotTimerNow(new Date().getTime());
    }, 100);
    setShotTimerIntervalId(id);
    setIsShotClockPaused(false);
  };

  const handleShotTimerReset = (resetTime) => {
    firebaseFunctions.RemoteHandleShotTimerReset(resetTime, params.timerId);
    setShotTimerLastLap(0);
    if (gameTime - (lastLap + now - start) <= resetTime) {
      setShotTimerBlackout(true);
    }
    setShotTimerGameTime(resetTime);
    if (!isShotClockPaused) {
      handleShotTimerResume();
    }
  };

  const incrementScore = (team) => {
    const score = teamScores[team];
    firebaseFunctions.RemoteScoreChange(team, score + 1, params.timerId);
    setTeamScores((prevScores) => ({
      ...prevScores,
      [team]: score + 1,
    }));
  };

  const decrementScore = (team) => {
    //短いバイブレーションを追加する
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const score = teamScores[team];
    if (score === 0) {
      return;
    }
    firebaseFunctions.RemoteScoreChange(team, score - 1, params.timerId);
    setTeamScores((prevScores) => ({
      ...prevScores,
      [team]: prevScores[team] - 1,
    }));
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
    if (isGamePaused || isShotClockPaused) {
      startBlinking();
    } else {
      blinkingOpacity.setValue(1); // 点滅を停止して、不透明度をリセット
    }
  }, [isGamePaused, isShotClockPaused, blinkingOpacity]);

  const handleOnPressGameTimer = () => {
    if (isGamePaused) {
      doubleTimerResume();
    } else {
      doubleTimerStop();
    }
  };

  const handleOnPressShotClock = () => {
    if (isShotClockPaused) {
      isTimerLinked ? doubleTimerResume() : handleShotTimerResume();
    } else {
      isTimerLinked ? doubleTimerStop() : handleShotTimerStop();
    }
  };

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
    if (seconds !== gameTime / 1000) {
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
    if (seconds !== shotTimerGameTime / 1000) {
      if (centiseconds > 10) {
        seconds += 1;
      }
    }
    return `${seconds}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => handleOnPressGameTimer()}
        style={styles.timerArea}
      >
        <Animated.Text
          style={[
            styles.timer,
            { opacity: isGamePaused ? blinkingOpacity : 1 },
          ]}
        >
          {formatGameTime(gameTime - (lastLap + now - start))}
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
            onPress={() => handleShotTimerReset("20000")}
            style={[styles.resetButton, { backgroundColor: "red" }]}
          >
            <Text style={styles.buttonText}>20</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleShotTimerReset(params.shotTime)}
            style={[styles.resetButton, { backgroundColor: "orange" }]}
          >
            <Text style={styles.buttonText}>{params.shotTime / 1000}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleOnPressShotClock()}
        style={styles.timerArea}
      >
        {!shotTimerBlackout && (
          <Animated.Text
            style={[
              styles.timer,
              { opacity: isShotClockPaused ? blinkingOpacity : 1 },
            ]}
          >
            {formatShotTime(
              shotTimerGameTime -
                (shotTimerLastLap + shotTimerNow - shotTimerStart)
            )}
          </Animated.Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={toHomeScreen} style={styles.homeButton}>
        <Icon name="ios-home" size={30} color="white" />
      </TouchableOpacity>
      {!isStarted && (
        <View style={styles.startContainer}>
          <TouchableOpacity
            onPress={doubleTimerStart}
            style={styles.startButton}
          >
            <Text style={styles.startText}>START</Text>
          </TouchableOpacity>
        </View>
      )}
      {isFinished && (
        <View style={styles.finishContainer}>
          <TouchableOpacity
            onPress={() => toHomeScreen()}
            style={styles.finishButton}
          >
            <Text style={styles.finishText}>ホームへ</Text>
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

//   return (
//     <React.Fragment>
//       <Timer
//         interval={gameTime - (lastLap + now - start)}
//         style={styles.timer}
//       />
//       {!isStarted && (
//         <TouchableOpacity
//           onPress={isTimerLinked ? doubleTimerResume : handleResume}
//           style={styles.button}
//         >
//           <Text>START</Text>
//         </TouchableOpacity>
//       )}
//       {start > 0 && (
//         <React.Fragment>
//           <TouchableOpacity
//             onPress={isTimerLinked ? doubleTimerStop : handleStop}
//             style={styles.button}
//           >
//             <Text>STOP</Text>
//           </TouchableOpacity>
//         </React.Fragment>
//       )}
//       {isStarted && start === 0 && (
//         <React.Fragment>
//           <TouchableOpacity onPress={handleReset} style={styles.button}>
//             <Text>RESET</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             onPress={isTimerLinked ? doubleTimerResume : handleResume}
//             style={styles.button}
//           >
//             <Text>RESUME</Text>
//           </TouchableOpacity>
//         </React.Fragment>
//       )}
//       <Text style={styles.label}>LAST LAP</Text>
//       <Text style={styles.lastLap}>{lastLap}</Text>
//       <Timer
//         interval={
//           ShotTimerGameTime -
//           (ShotTimerLastLap + ShotTimerNow - ShotTimerStart)
//         }
//         style={styles.timer}
//       />
//       {!ShotTimerIsStarted && (
//         <TouchableOpacity
//           onPress={handleShotTimerStart}
//           style={styles.button}
//         >
//           <Text>START</Text>
//         </TouchableOpacity>
//       )}
//       {ShotTimerStart > 0 && (
//         <React.Fragment>
//           <TouchableOpacity
//             onPress={handleShotTimerStop}
//             style={styles.button}
//           >
//             <Text>STOP</Text>
//           </TouchableOpacity>
//         </React.Fragment>
//       )}
//       {ShotTimerIsStarted && ShotTimerStart === 0 && (
//         <React.Fragment>
//           <TouchableOpacity
//             onPress={handleShotTimerReset}
//             style={styles.button}
//           >
//             <Text>RESET30</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             onPress={handleShotTimerReset2}
//             style={styles.button}
//           >
//             <Text>RESET20</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             onPress={handleShotTimerResume}
//             style={styles.button}
//           >
//             <Text>RESUME</Text>
//           </TouchableOpacity>
//         </React.Fragment>
//       )}
//       <Text style={styles.label}>LAST LAP</Text>
//       <Text style={styles.lastLap}>{ShotTimerLastLap}</Text>
//     </React.Fragment>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   label: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginVertical: 20,
//   },
//   timerContainer: {
//     flexDirection: "row",
//   },
//   timer: {
//     fontSize: 76,
//     fontWeight: "200",
//   },
//   button: {
//     margin: 10,
//     height: 100,
//     width: 100,
//     backgroundColor: "red",
//   },
//   lap: {
//     flexDirection: "column",
//   },
//   lapText: {
//     fontSize: 20,
//   },
//   lapTimer: {
//     width: 30,
//   },
//   lastLap: {
//     fontSize: 20,
//   },
// });
