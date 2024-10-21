import { useEffect } from "preact/hooks";
import { DataProvider, useData } from "../utils/dataStore.tsx";
import CalendarComponent from "./Calendar.tsx";
import Timer from "./Timer.tsx";
import { signal } from "@preact/signals";
import { hoursToTimeString, isTimeOverThreshold } from "../utils/timeHelper.ts";
import {
  getNotificationPermission,
  sendNotification,
} from "../utils/notification.ts";

interface TimeOverviewProps {
  employee: number;
}

const TimeOverview: preact.FunctionalComponent<TimeOverviewProps> = (props) => {
  const { employee } = props;
  const [$store, action] = useData();

  useEffect(() => {
    action.selectDate(new Date());
    action.selectMode("month");
    action.selectEmployee(employee);
    getNotificationPermission();
    sendNotification(
      "Welcome to the time tracking app!",
      "You can now track your time.",
    );

    // connect with sse stream from /api/sse
    const sse = new EventSource(`/api/${employee}/sse`);
    sse.onopen = () => {
      console.log("SSE connection opened");
    };
    sse.onmessage = (event) => {
      console.log("SSE event", event.data);
    };
  }, []);

  useEffect(() => {
    action.selectEmployee(employee);
  }, [employee]);

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

  function getEntry(date: Date) {
    if (!$store.monthly?.value) return null;
    const entry = Object.entries($store.monthly.value).find(([key]) => {
      return key === date.toISOString();
    })?.[1];
    return entry;
  }

  const renderDay = (date: Date) => {
    const entry = getEntry(date);
    const time = signal(entry?.time ?? "00:00:00");
    const active = (entry?.logs ?? []).length > 0 &&
      entry?.logs?.some((log) => !log.out);
    return (
      <div
        class={"flex flex-col gap-4 relative px-2 h-full rounded-lg" +
          ` ${isToday(date) ? "bg-blue-200" : "bg-slate-400"}`}
      >
        {active && (
          <div class="absolute top-0 right-0 w-2 h-2 animate-pulse rounded-full bg-red-600" />
        )}
        <div class="flex justify-between">
          <span class="font-bold">{date.getDate()}</span>
          {active
            ? (
              <Timer
                time={time}
                inProgess={true}
              >
              </Timer>
            )
            : <span>{entry?.time}</span>}
        </div>
        <div>
          {entry?.logs.map((log) => (
            <div class="flex gap-2">
              <span>{log.in}</span>
              <span>-</span>
              <span>
                {log.out}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  function renderWeek(weekNumber: number) {
    const weekData = ($store.weekly?.value ?? []).find(({ week }) =>
      week === weekNumber
    );
    return (
      <div class="flex flex-col w-content">
        <span class="font-bold">
          {weekNumber}
        </span>
        <div class="flex flex-col gap-1">
          <span>
            {weekData?.time}
          </span>
          <span
            class={`${
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

  return (
    <DataProvider>
      <div class="h-screen w-screen box-border p-0 m-0">
        <div class="flex w-full p-2">
          {$store.employeeData?.value.name}
        </div>
        <div class="h-full flex flex-col bg-zinc-600 box-border">
          <CalendarComponent
            startOfWeek={1}
            daysToShow={[1, 2, 3, 4, 5]}
            dayNames={["Mo", "Di", "Mi", "Do", "Fr"]}
            renderDay={renderDay}
            renderWeek={renderWeek}
            onChange={handleDateChange}
            onDayClick={handleDateChange}
          />
        </div>
      </div>
    </DataProvider>
  );
};

export default TimeOverview;
