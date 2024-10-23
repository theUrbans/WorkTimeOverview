export type TimeString = `${number}:${number}:${number}`;

export function newDate(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  const offset = date.getTimezoneOffset();
  date.setTime(date.getTime() + offset * 60 * 1000);
  return date;
}

export function isTimeOverThreshold(time: string, threshold: string): boolean {
  if (time === "00:00:00" || threshold === "00:00:00") return false;
  const [hours, minutes, seconds] = time.split(":").map(Number);
  const [thresholdHours, thresholdMinutes, thresholdSeconds] = threshold.split(
    ":",
  ).map(Number);

  const baseDate = new Date();
  baseDate.setHours(hours);
  baseDate.setMinutes(minutes);
  baseDate.setSeconds(seconds);
  const thresholdDate = new Date();
  thresholdDate.setHours(thresholdHours);
  thresholdDate.setMinutes(thresholdMinutes);
  thresholdDate.setSeconds(thresholdSeconds);

  return baseDate > thresholdDate;
}

export function hoursToTimeString(hours: number): string {
  // set hours to hh:mm:ss, eg: 8 -> 08:00:00, 12.5 -> 12:30:00
  const minutes = (hours % 1) * 60;
  const seconds = (minutes % 1) * 60;
  return `${Math.floor(hours)}:${Math.floor(minutes)}:${Math.floor(seconds)}`;
}

export function dailyWorkTimeFromWeekly(
  weekHours: number,
  weekDays: number,
): string { // Step 1: Calculate the total minutes worked in a week
  const totalMinutes = weekHours * 60;

  // Step 2: Calculate the average daily minutes
  const dailyMinutes = totalMinutes / weekDays;

  // Step 3: Convert the average daily minutes to hours, minutes, and seconds
  const hours = Math.floor(dailyMinutes / 60);
  const minutes = Math.floor(dailyMinutes % 60);
  const seconds = Math.floor((dailyMinutes * 60) % 60);

  // Step 4: Format the result as a string "HH:MM:SS"
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

export function dateToString(date: Date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  return `${hours}:${minutes}:${seconds}`;
}
