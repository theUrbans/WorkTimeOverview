import { useEffect } from "preact/hooks";
import { JSX } from "preact";

import type { Signal } from "@preact/signals";

interface TimerProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  time: Signal<string>;
  inProgess: boolean;
}

/**
 * @description This component is used to display the elapsed time since the component was mounted.
 * @description The time is updated every second if the `inProgess` prop is true.
 * @description The time is displayed in the format "HH:MM:SS".
 * @param {TimerProps} props - The props for the Timer component.
 * @param {Signal<string>} props.time - A signal containing the current time as a string in the format "HH:MM:SS".
 * @param {boolean} props.inProgess - A boolean indicating whether the timer is in progress.
 * @returns {JSX.Element} The Timer component as <span> with the time inside.
 */
export default function Timer(props: TimerProps): JSX.Element {
  const { time, inProgess, ...spanProps } = props;

  useEffect(() => {
    if (!inProgess) return;

    const startTime = new Date();
    const timeParts = time.value.split(":").map(Number);
    const now = new Date();
    startTime.setHours(now.getHours() - timeParts[0]);
    startTime.setMinutes(now.getMinutes() - timeParts[1]);
    startTime.setSeconds(now.getSeconds() - timeParts[2]);

    const showTime = () => {
      const endTime = new Date();
      const diff = endTime.getTime() - startTime.getTime();
      const diffParts = new Date(diff).toISOString().split("T")[1].split(":");
      return `${diffParts[0]}:${diffParts[1]}:${diffParts[2].split(".")[0]}`;
    };

    const timer = setInterval(() => {
      time.value = showTime();
    }, 1000);

    return () => clearInterval(timer);
  }, [inProgess]);

  return <span {...spanProps}>{time.value}</span>;
}
