import pad from './pad';

function getTimeString(rawSeconds) {
  let totalHours;
  let hours = 0;
  let totalMins = rawSeconds / 60;
  if(totalMins >= 60) {
    totalHours = totalMins / 60;
    hours = Math.floor(totalHours);
    totalMins = totalMins - 60;
  }
  let mins = Math.floor(totalMins);
  let totalSeconds = (totalMins - mins) * 60;
  let seconds = Math.floor(totalSeconds);
  let milliseconds = (totalSeconds - seconds).toFixed(3).slice(2);
  return `${pad(hours, 2)}:${pad(mins, 2)}:${pad(seconds, 2)},${pad(milliseconds, 3)}`;
}

export default getTimeString;