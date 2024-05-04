import { db } from "./firebaseConfig";
import { doc, updateDoc, setDoc } from "firebase/firestore";

// ランダムなタイマーIDを生成する関数
export const generateTimerId = () => {
  return Math.random().toString(36).substring(2, 15);
};

const RemoteHandleStart = async (gameTime, shotTimerGameTime, timerId) => {
  try {
    const timerDocRef = doc(db, `timers/${timerId}`);
    const start = Date.now();
    await setDoc(timerDocRef, {
      start,
      shotTimerStart: start,
      lastLap: 0,
      shotTimerLastLap: 0,
      isGamePaused: false, // ゲームが一時停止していない状態を示す
      isShotClockPaused: false, // ショットクロックが一時停止していない状態を示す
      gameTime, // ゲームの残り時間（ミリ秒）
      shotTimerGameTime, // ショットクロックの残り時間（ミリ秒）
      teamA: 0, // チームAの得点
      teamB: 0, // チームBの得点
    });
  } catch (error) {
    console.error("RemoteHandleStartでエラーが発生しました:", error);
    throw error;
  }
};

const RemoteHandleStop = async (lastLap, timerId) => {
  try {
    const timerDocRef = doc(db, `timers/${timerId}`);
    const isGamePaused = true;
    const start = 0;
    await updateDoc(timerDocRef, { start, lastLap, isGamePaused });
  } catch (error) {
    console.error("RemoteHandleStopでエラーが発生しました:", error);
    throw error;
  }
};

const RemoteHandleResume = async (start, timerId) => {
  try {
    const timerDocRef = doc(db, `timers/${timerId}`);
    const isGamePaused = false;
    await updateDoc(timerDocRef, { start, isGamePaused });
  } catch (error) {
    console.error("RemoteHandleResumeでエラーが発生しました:", error);
    throw error;
  }
};

const RemoteHandleShotTimerStop = async (shotTimerLastLap, timerId) => {
  try {
    const timerDocRef = doc(db, `timers/${timerId}`);
    const isShotClockPaused = true;
    const shotTimerStart = 0;
    await updateDoc(timerDocRef, {
      shotTimerStart,
      shotTimerLastLap,
      isShotClockPaused,
    });
  } catch (error) {
    console.error("RemoteHandleShotTimerStopでエラーが発生しました:", error);
    throw error;
  }
};

const RemoteHandleShotTimerResume = async (shotTimerStart, timerId) => {
  try {
    const timerDocRef = doc(db, `timers/${timerId}`);
    const isShotClockPaused = false;
    await updateDoc(timerDocRef, { shotTimerStart, isShotClockPaused });
  } catch (error) {
    console.error("RemoteHandleShotTimerResumeでエラーが発生しました:", error);
    throw error;
  }
};

const RemoteHandleShotTimerReset = async (resetTime, timerId) => {
  try {
    const timerDocRef = doc(db, `timers/${timerId}`);
    await updateDoc(timerDocRef, {
      shotTimerGameTime: resetTime,
      shotTimerLastLap: 0,
    });
  } catch (error) {
    console.error("RemoteHandleShotTimerResetでエラーが発生しました:", error);
    throw error;
  }
};

const RemoteScoreChange = async (team, score, timerId) => {
  try {
    const timerDocRef = doc(db, `timers/${timerId}`);
    await updateDoc(timerDocRef, {
      [team]: score,
    });
  } catch (error) {
    console.error("RemoteIncrementScoreでエラーが発生しました:", error);
    throw error;
  }
};

export const firebaseFunctions = {
  RemoteHandleStart,
  RemoteHandleStop,
  RemoteHandleResume,
  RemoteHandleShotTimerStop,
  RemoteHandleShotTimerResume,
  RemoteHandleShotTimerReset,
  RemoteScoreChange,
};
