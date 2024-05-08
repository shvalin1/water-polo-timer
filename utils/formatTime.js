import moment from "moment";

export const formatGameTime = (timerData, now) => {
  const interval =
    timerData.gameTime - (timerData.lastLap + now - timerData.start);
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

export const formatShotTime = (timerData, shotTimerNow) => {
  const interval =
    timerData.shotTimerGameTime -
    (timerData.shotTimerLastLap + shotTimerNow - timerData.shotTimerStart);
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

const pad = (n) => (n < 10 ? "0" + n : n);
