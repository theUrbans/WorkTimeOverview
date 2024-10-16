import { type Signal, useSignal } from "@preact/signals";
import { useEffect, useState } from "preact/hooks";
import type { HandlerResponse } from "../routes/today/[id].tsx";
import TodayTimer from "./TodayTimer.tsx";
import type { MonthlyWorkTimeResponse } from "../api/TimeService.ts";

interface CalendarProps {
  year: Signal<number>;
  month: Signal<number>;
  employeeId: number;
}

async function getData(id: number): Promise<HandlerResponse> {
  const data = await fetch(`/api/${id}`);
  return await data.json();
}

export default function Calendar(props: CalendarProps) {
  const [data, setData] = useState<HandlerResponse | null>(null);
  const todayTime = useSignal(data?.today.time || "00:00:00");
  const weekTime = useSignal(data?.weekly.time || "00:00:00");

  useEffect(() => {
    async function fetchData() {
      const { today, weekly, monthly } = await getData(props.employeeId);
      setData({ today, weekly, monthly });
      todayTime.value = today.time;
      weekTime.value = weekly.time;
    }

    fetchData();
  }, [props.employeeId, props.year.value, props.month.value]);

  if (!data) {
    return <div>Loading...</div>;
  }

  const daysInMonth = new Date(props.year.value, props.month.value + 1, 0)
    .getDate();
  const firstDayOfMonth =
    (new Date(props.year.value, props.month.value, 1).getDay() + 6) %
    7;
  const days = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push("");
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  function isToday(day: number): boolean {
    const today = new Date();
    return (
      today.getFullYear() === props.year.value &&
      today.getMonth() === props.month.value &&
      today.getDate() === day
    );
  }

  function getEntry(day: number): MonthlyWorkTimeResponse {
    const isoDate = new Date(props.year.value, props.month.value, day)
      .toISOString();
    return data?.monthly[isoDate];
  }

  return (
    <div class="h-full flex flex-col">
      <div className="flex bg-slate-400 p-2 gap-2 box-border justify-center">
        <span>
          <TodayTimer time={weekTime} inProgess={data.today.inProgress} />
        </span>
        <button
          onClick={() => {
            props.month.value = (props.month.value - 1 + 12) % 12;
          }}
        >
          {"<"}
        </button>
        <input
          type="date"
          name=""
          id=""
          value={`${props.year.value}-${
            String(props.month.value + 1).padStart(2, "0")
          }-01`}
          onChange={(e) => {
            const date = new Date(e.currentTarget.value);
            props.year.value = date.getFullYear();
            props.month.value = date.getMonth();
          }}
        />
        <button
          onClick={() => {
            props.month.value = (props.month.value + 1) % 12;
          }}
        >
          {">"}
        </button>
      </div>
      <div class="grid grid-cols-7 gap-2 bg-slate-600 h-full p-5 box-border" // style={{
        //   display: "grid",
        //   gridTemplateColumns: "repeat(7, 1fr)",
        //   gridTemplateRows: "max-content repeat(auto-fill, 1fr)",
        //   gap: "5px",
        //   backgroundColor: "lightgray",
        //   padding: "5px",
        //   height: "100%",
        //   boxSizing: "border-box",
        // }}
      >
        {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
          <div
            key={day}
            style={{ fontWeight: "bold", height: "0px" }}
          >
            {day}
          </div>
        ))}
        {days.map((day, index) => (
          <div
            key={index}
            className={day !== ""
              ? "p-2 flex flex-col justify-between rounded-md border-2 border-solid"
              : ""}
            style={{
              backgroundColor: isToday(Number(day))
                ? "lightblue"
                : day
                ? "darkgray"
                : "",
            }}
          >
            <div class="flex justify-between">
              {/* if day else empty span */}
              {day
                ? (
                  <span class="font-bold">
                    {day}
                  </span>
                )
                : <span></span>}
              <span>
                {isToday(Number(day)) && data.today.inProgress
                  ? (
                    <TodayTimer
                      time={todayTime}
                      inProgess={data.today.inProgress}
                    />
                  )
                  : getEntry(Number(day))?.time}
              </span>
            </div>
            <div>
              {data
                .monthly[
                  new Date(props.year.value, props.month.value, Number(day))
                    .toISOString()
                ]?.logs.map((log: { in: string; out: string }) => (
                  <div>
                    {log.in} - {log.out}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
