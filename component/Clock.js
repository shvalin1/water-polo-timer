import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
} from "react-native";
import { formatGameTime, formatShotTime } from "../utils/formatTime";
import Constants from "expo-constants";

const { width, height } = Dimensions.get("window");
//ステータスバーの高さを取得する
const statusBarHeight = Platform.OS == "ios" ? Constants.statusBarHeight : 0;
//ステータスバーの高さを引いた高さを取得する
const standardHeight = (height - statusBarHeight - 300) / 2;

export const NormalTimer = ({
  timerData,
  now,
  ShotTimerNow,
  blinkingOpacity,
  params,
}) => (
  <>
    <TouchableOpacity style={styles.normalTimerArea}>
      <Animated.Text
        style={[
          styles.timer,
          { fontSize: params.GameTimerTextSize },
          { opacity: timerData.isGamePaused ? blinkingOpacity : 1 },
        ]}
      >
        {formatGameTime(timerData, now)}
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
    <TouchableOpacity style={styles.normalTimerArea}>
      {!timerData.shotTimerBlackout && (
        <Animated.Text
          style={[
            styles.timer,
            { fontSize: params.ShotTimerTextSize },
            {
              opacity: timerData.isShotClockPaused ? blinkingOpacity : 1,
            },
          ]}
        >
          {formatShotTime(timerData, ShotTimerNow)}
        </Animated.Text>
      )}
    </TouchableOpacity>
  </>
);

export const ShotClock = ({
  timerData,
  ShotTimerNow,
  blinkingOpacity,
  params,
}) => (
  <>
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
            { fontSize: params.ShotTimerTextSize },
            {
              opacity: timerData.isShotClockPaused ? blinkingOpacity : 1,
            },
          ]}
        >
          {formatShotTime(timerData, ShotTimerNow)}
        </Animated.Text>
      )}
    </TouchableOpacity>
  </>
);

export const GameClock = ({ timerData, now, blinkingOpacity, params }) => (
  <View style={styles.container}>
    <TouchableOpacity style={styles.timerArea}>
      <Animated.Text
        style={[
          styles.timer,
          { fontSize: params.GameTimerTextSize },
          { opacity: timerData.isGamePaused ? blinkingOpacity : 1 },
        ]}
      >
        {formatGameTime(timerData, now)}
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
  </View>
);

const styles = StyleSheet.create({
  startContainer: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.5)",
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
  },
  normalTimerArea: {
    justifyContent: "center",
    alignItems: "center",
    height: standardHeight,
    width: width,
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
    //height: 300,
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
