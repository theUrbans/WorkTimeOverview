import type { Signal } from "@preact/signals";
import { useEffect } from "preact/hooks";

interface TodayTimerProps {
  time: Signal<string>;
  inProgess: boolean;
}

export default function TodayTimer(props: TodayTimerProps) {
  const startTime = new Date();
  const timeParts = props.time.value.split(":").map(Number);
  const now = new Date();
  startTime.setHours(now.getHours() - timeParts[0]);
  startTime.setMinutes(now.getMinutes() - timeParts[1]);
  startTime.setSeconds(now.getSeconds() - timeParts[2]);

  function showTime() {
    const endTime = new Date();
    const diff = endTime.getTime() - startTime.getTime();
    const diffParts = new Date(diff).toISOString().split("T")[1].split(":");
    return `${diffParts[0]}:${diffParts[1]}:${diffParts[2].split(".")[0]}`;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      if (props.inProgess) props.time.value = showTime();
    }, 1000);
    return () => clearInterval(timer);
  }, [props.inProgess]);

  return <span>{props.time.value}</span>;
}
