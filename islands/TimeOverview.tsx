import { useEffect } from "preact/hooks";
import { useData } from "../utils/dataStore.tsx";
import CalendarComponent from "./Calendar.tsx";
import Timer from "./Timer.tsx";
import { signal } from "@preact/signals";
import {
  dateToString,
  hoursToTimeString,
  isTimeOverThreshold,
} from "../utils/timeHelper.ts";
import {
  getNotificationPermission,
  sendNotification,
} from "../utils/notification.ts";
import type { TimeDoneResponse } from "../api/TimeService.ts";
import { logger } from "../utils/logger.ts";

interface TimeOverviewProps {
  employee: number;
}

const TimeOverview: preact.FunctionalComponent<TimeOverviewProps> = (props) => {
  const { employee } = props;
  const [$store, action] = useData();

  useEffect(() => {
    action.selectEmployee(employee).then(() => {
      action.selectDate(new Date());
      action.selectMode("month");
    });
    getNotificationPermission();

    const sse = new EventSource(`/worktime/api/${employee}/sse`);

    sse.onopen = () => {
      logger.info("SSE connection opened");
    };

    let counter = 0;
    sse.onmessage = (event) => {
      if (event.data) {
        try {
          const { daily, weekly } = JSON.parse(event.data) as TimeDoneResponse;
          if (weekly.done) {
            sendNotification(
              "Weekly time done!",
              "Stop working and have a nice weekend!",
            );
            return;
          }
          if (daily.done) {
            sendNotification(
              "Daily time done!",
              "Stop working and have a nice day!",
            );
            return;
          }
          if (++counter % 10 === 0) {
            sendNotification(
              "Just a few more",
              `work for ${daily.left} today and ${weekly.left} this week!`,
            );
          }
        } catch (error) {
          logger.error("SSE data error:", error);
        }
      }
    };

    sse.onerror = (event) => {
      logger.error("SSE error");
      if ((event.target as EventSource).readyState === EventSource.CLOSED) {
        logger.info("SSE connection closed");
      }
    };

    return () => {
      sse.close();
      logger.info("SSE connection closed");
    };
  }, []);

  useEffect(() => {
    if (!$store.employeeData) return;
    action.getDailyWorkTime();
    action.getWeeklyWorkTime();
    action.getMonthlyWorkTime();
  }, [$store.date?.value]);

  const handleDateChange = (newDate: Date) => {
    action.selectDate(newDate);
  };

  function isToday(date: Date) {
    return date.toDateString() === new Date().toDateString();
  }

  const isSameMonth = (date: Date) => {
    return date.getMonth() === $store.date?.value.getMonth();
  };

  function setToMidnight(date: Date) {
    date.setHours(0, 0, 0, 0);
    return date;
  }

  function getEntry(date: Date) {
    if (!$store.monthly?.value) {
      action.getMonthlyWorkTime();
      return null;
    }
    const entry = Object.entries($store.monthly?.value ?? {}).find(([key]) => {
      return (
        setToMidnight(new Date(key)).toISOString().split("T")[0] ===
          setToMidnight(date).toISOString().split("T")[0]
      );
    })?.[1];
    return entry;
  }

  const renderDay = (date: Date) => {
    const normalizedDate = setToMidnight(date);
    const entry = getEntry(normalizedDate);
    const time = signal(entry?.time ?? "00:00:00");
    const active = (entry?.logs ?? []).length > 0 &&
      entry?.logs?.some((log) => !log.out);
    const isInMonth = isSameMonth(date);
    return (
      <div
        className={`${
          isInMonth
            ? isToday(date) ? "bg-primary text-secondary" : "bg-secondary"
            : ""
        } ${
          isInMonth
            ? "flex flex-col justify-between gap-4 relative h-full rounded-xl p-4"
            : "grid place-content-center border-2 border-solid border-secondary h-full rounded-xl"
        }`}
      >
        {active && (
          <div className="absolute top-1 right-1 w-4 h-4 animate-pulse rounded-full bg-green-600" />
        )}
        <div className="flex justify-between">
          <span
            className={`${
              isToday(date)
                ? "bg-accent text-text "
                : "bg-background text-primary "
            }${isInMonth ? "font-bold py-1 px-2 rounded-md" : "opacity-50"}`}
          >
            {date.getDate()}
          </span>
          {active
            ? <Timer time={time} inProgess={true} />
            : <span>{entry?.time}</span>}
        </div>
        <ol>
          {entry?.logs.map((log) => (
            <li className="flex gap-2">
              <span>{log.in}</span>
              <span>-</span>
              <span>{log.out}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  };

  function renderWeek(weekNumber: number) {
    const weekData = ($store.weekly?.value ?? []).find(
      ({ week }) => week === weekNumber,
    );
    return (
      <div className="flex flex-col justify-center items-center px-4">
        <span className="font-bold">{weekNumber}</span>
        <div className="flex flex-col gap-1">
          <span>{weekData?.time}</span>
          <span
            className={`${
              isTimeOverThreshold(
                  weekData?.time ?? "00:00:00",
                  hoursToTimeString(
                    Number($store.employeeData?.value.weekHours?.hours ?? "0"),
                  ),
                )
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {weekData?.timeDifference}
          </span>
        </div>
      </div>
    );
  }

  const clock = signal(dateToString(new Date()));

  return (
    <div className="h-full w-full flex flex-col bg-background text-text">
      <header className="flex w-full p-2 bg-secondary items-center justify-between">
        <span>{$store.employeeData?.value.name}</span>
        <span>
          <Timer time={clock} inProgess={true} />
        </span>
        <span>
          <button
            className="p-2 rounded-md bg-background text-text border-2 border-transparent border-solid hover:border-accent transition"
            onClick={() => {
              const root = document.documentElement;
              root.classList.toggle("dark");
            }}
          >
            Theme
          </button>
        </span>
      </header>
      <div className="h-full box-border">
        <CalendarComponent
          startOfWeek={1}
          daysToShow={[1, 2, 3, 4, 5]}
          dayNames={["Mo", "Di", "Mi", "Do", "Fr"]}
          weekLabel=""
          prevLabel="vorheriger Monat"
          nextLabel="nächster Monat"
          renderDay={renderDay}
          renderWeek={renderWeek}
          onChange={handleDateChange}
          onDayClick={handleDateChange}
        />
      </div>
    </div>
  );
};

export default TimeOverview;
