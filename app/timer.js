import React, { useState, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Text } from "react-native-elements";
import "expo-router/entry";
import moment from "moment";

export default function Page() {
  const [now, setNow] = useState(0);
  const [start, setStart] = useState(0);
  const [intervalId, setIntervalId] = useState();
  const [lastLap, setLastLap] = useState(0);
  const [gameTime, setGameTime] = useState(30000);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    // component will unmount
    return () => clearInterval(intervalId);
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
    clearInterval(intervalId);
    setLastLap(lastLap + now - start);
    setStart(0);
    setNow(0);
  };

  const handleResume = () => {
    setStart(new Date().getTime());
    setNow(new Date().getTime());
    const id = setInterval(() => {
      setNow(new Date().getTime());
    }, 100);
    setIntervalId(id);
  };

  const handleReset = () => {
    setLastLap(0);
    setStart(0);
    setNow(0);
    setIsStarted(false);
  };

  const Timer = ({ interval, style }) => {
    const pad = (n) => (n < 10 ? "0" + n : n);
    const duration = moment.duration(interval);
    const centiseconds = Math.floor(duration.milliseconds() / 100);
    return (
      <View style={styles.timerContainer}>
        {duration.minutes() < 0 ? (
          <React.Fragment>
            <Text style={style}>00</Text>
            <Text style={style}>00</Text>
            <Text style={style}>0</Text>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Text style={style}>{pad(duration.minutes())}</Text>
            <Text style={style}>{pad(duration.seconds())}</Text>
            <Text style={style}>{centiseconds}</Text>
          </React.Fragment>
        )}
      </View>
    );
  };
  return (
    <React.Fragment>
      <Timer
        interval={gameTime - (lastLap + now - start)}
        style={styles.timer}
      />
      {!isStarted && (
        <TouchableOpacity onPress={handleStart} style={styles.button}>
          <Text>START</Text>
        </TouchableOpacity>
      )}
      {start > 0 && (
        <React.Fragment>
          <TouchableOpacity onPress={handleStop} style={styles.button}>
            <Text>STOP</Text>
          </TouchableOpacity>
        </React.Fragment>
      )}
      {isStarted && start === 0 && (
        <React.Fragment>
          <TouchableOpacity onPress={handleReset} style={styles.button}>
            <Text>RESET</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleResume} style={styles.button}>
            <Text>RESUME</Text>
          </TouchableOpacity>
        </React.Fragment>
      )}
      <Text style={styles.label}>LAST LAP</Text>
      <Text style={styles.lastLap}>{lastLap}</Text>
    </React.Fragment>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 20,
  },
  timerContainer: {
    flexDirection: "row",
  },
  timer: {
    fontSize: 76,
    fontWeight: "200",
  },
  button: {
    margin: 10,
    height: 100,
    width: 100,
    backgroundColor: "red",
  },
  lap: {
    flexDirection: "column",
  },
  lapText: {
    fontSize: 20,
  },
  lapTimer: {
    width: 30,
  },
  lastLap: {
    fontSize: 20,
  },
});
