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
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");
//ステータスバーの高さを取得する
const statusBarHeight = Platform.OS == "ios" ? Constants.statusBarHeight : 0;
//ステータスバーの高さを引いた高さを取得する
const standardHeight = (height - statusBarHeight - 300) / 2;

export default function Page() {
  const [now, setNow] = useState(0);
  const [start, setStart] = useState(0);
  const [intervalId, setIntervalId] = useState();
  const [lastLap, setLastLap] = useState(0);
  const [gameTime, setGameTime] = useState(300000);
  const [isStarted, setIsStarted] = useState(false);
  const [secondTimerNow, setSecondTimerNow] = useState(0);
  const [secondTimerStart, setSecondTimerStart] = useState(0);
  const [secondTimerIntervalId, setSecondTimerIntervalId] = useState();
  const [secondTimerLastLap, setSecondTimerLastLap] = useState(0);
  const [secondTimerGameTime, setSecondTimerGameTime] = useState(30000);
  const [secondTimerIsStarted, setSecondTimerIsStarted] = useState(false);
  const [isTimerLinked, setIsTimerLinked] = useState(true);
  const [teamAName, setTeamAName] = useState("Blue"); // チームAの名前
  const [teamBName, setTeamBName] = useState("White"); // チームBの名前
  const [teamScores, setTeamScores] = useState({ teamA: 0, teamB: 0 }); // 得点
  const [isGamePaused, setIsGamePaused] = useState(true); // 一時停止状態
  const [isShotClockPaused, setIsShotClockPaused] = useState(true); // ショットクロックの一時停止状態

  const router = useRouter();

  useEffect(() => {
    // component will unmount
    return () => clearInterval(intervalId);
  }, [intervalId]);

  useEffect(() => {
    // component will unmount
    return () => clearInterval(secondTimerIntervalId);
  }, [secondTimerIntervalId]); // secondTimerIntervalId を依存配列に追加

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
    clearInterval(intervalId);
    setLastLap(lastLap + now - start);
    setStart(0);
    setNow(0);
    setIsGamePaused(true);
  };

  const handleResume = () => {
    setStart(new Date().getTime());
    setNow(new Date().getTime());
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
  const handleSecondTimerStart = () => {
    const id = setInterval(() => {
      setSecondTimerNow(new Date().getTime());
    }, 100);
    setSecondTimerIntervalId(id);
    setSecondTimerStart(new Date().getTime());
    setSecondTimerLastLap(0);
    setSecondTimerIsStarted(true);
    setIsShotClockPaused(false);
  };

  const handleSecondTimerStop = () => {
    clearInterval(secondTimerIntervalId);
    setSecondTimerLastLap(
      secondTimerLastLap + secondTimerNow - secondTimerStart
    );
    setSecondTimerStart(0);
    setSecondTimerNow(0);
    setIsShotClockPaused(true);
  };
  const doubleTimerStart = () => {
    handleResume();
    handleSecondTimerResume();
    setIsGamePaused(false);
    setIsShotClockPaused(false);
    setIsStarted(true);
  };

  const doubleTimerStop = () => {
    handleStop();
    handleSecondTimerStop();
  };

  const doubleTimerResume = () => {
    handleResume();
    handleSecondTimerResume();
  };

  const handleSecondTimerResume = () => {
    setSecondTimerStart(new Date().getTime());
    setSecondTimerNow(new Date().getTime());
    const id = setInterval(() => {
      setSecondTimerNow(new Date().getTime());
    }, 100);
    setSecondTimerIntervalId(id);
    setIsShotClockPaused(false);
  };

  const handleSecondTimerReset = () => {
    setSecondTimerLastLap(0);
    setSecondTimerStart(0);
    setSecondTimerNow(0);
    setSecondTimerGameTime(30000);
    setSecondTimerIsStarted(false);
  };

  const handleSecondTimerReset2 = () => {
    setSecondTimerLastLap(0);
    setSecondTimerStart(0);
    setSecondTimerNow(0);
    setSecondTimerGameTime(20000);
    setSecondTimerIsStarted(false);
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
    console.log("handleOnPressGameTimer");
    if (isGamePaused) {
      handleResume();
    } else {
      handleStop();
    }
    setIsGamePaused(!isGamePaused);
  };

  const handleOnPressShotClock = () => {
    console.log("handleOnPressShotClock");
    if (isShotClockPaused) {
      handleSecondTimerResume();
    } else {
      handleSecondTimerStop();
    }
    setIsShotClockPaused(!isShotClockPaused);
  };

  const toHomeScreen = () => {
    router.push({
      pathname: "/",
    });
  };

  const pad = (n) => (n < 10 ? "0" + n : n);

  const formatGameTime = (interval) => {
    const duration = moment.duration(interval);
    const minutes = pad(duration.minutes());
    const seconds = pad(duration.seconds());
    return `${minutes}:${seconds}`;
  };

  const formatShotTime = (interval) => {
    const duration = moment.duration(interval);
    const seconds = pad(duration.seconds());
    const centiseconds = Math.floor(duration.milliseconds() / 100);
    return `${seconds}.${centiseconds}`;
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
            onPress={handleSecondTimerReset2}
            style={[styles.resetButton, { backgroundColor: "red" }]}
          >
            <Text style={styles.buttonText}>20</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSecondTimerReset}
            style={[styles.resetButton, { backgroundColor: "orange" }]}
          >
            <Text style={styles.buttonText}>30</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleOnPressShotClock()}
        style={styles.timerArea}
      >
        <Animated.Text
          style={[
            styles.timer,
            { opacity: isShotClockPaused ? blinkingOpacity : 1 },
          ]}
        >
          {formatShotTime(
            secondTimerGameTime -
              (secondTimerLastLap + secondTimerNow - secondTimerStart)
          )}
        </Animated.Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={toHomeScreen} style={styles.homeButton}>
        <Icon name="ios-home" size={30} color="black" />
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
//           secondTimerGameTime -
//           (secondTimerLastLap + secondTimerNow - secondTimerStart)
//         }
//         style={styles.timer}
//       />
//       {!secondTimerIsStarted && (
//         <TouchableOpacity
//           onPress={handleSecondTimerStart}
//           style={styles.button}
//         >
//           <Text>START</Text>
//         </TouchableOpacity>
//       )}
//       {secondTimerStart > 0 && (
//         <React.Fragment>
//           <TouchableOpacity
//             onPress={handleSecondTimerStop}
//             style={styles.button}
//           >
//             <Text>STOP</Text>
//           </TouchableOpacity>
//         </React.Fragment>
//       )}
//       {secondTimerIsStarted && secondTimerStart === 0 && (
//         <React.Fragment>
//           <TouchableOpacity
//             onPress={handleSecondTimerReset}
//             style={styles.button}
//           >
//             <Text>RESET30</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             onPress={handleSecondTimerReset2}
//             style={styles.button}
//           >
//             <Text>RESET20</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             onPress={handleSecondTimerResume}
//             style={styles.button}
//           >
//             <Text>RESUME</Text>
//           </TouchableOpacity>
//         </React.Fragment>
//       )}
//       <Text style={styles.label}>LAST LAP</Text>
//       <Text style={styles.lastLap}>{secondTimerLastLap}</Text>
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
