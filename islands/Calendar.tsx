import { type Signal, useSignal } from "@preact/signals";
import { useEffect, useState } from "preact/hooks";
import type { HandlerResponse } from "../routes/today/[id].tsx";
import TodayTimer from "./TodayTimer.tsx";

type DailyWorkTime = {
  day: Date;
  time: string;
  pause: string;
  logs: {
    in: string;
    out: string;
  }[];
};

interface CalendarProps {
  data: Signal<HandlerResponse>;
  employeeId: number;
}

async function getData(
  id: number,
  month: number,
  year: number,
): Promise<HandlerResponse> {
  const data = await fetch(`/api/${id}?month=${month}&year=${year}`);
  return await data.json();
}

export default function Calendar(props: CalendarProps) {
  const [data, setData] = useState<HandlerResponse | null>(props.data.value);

  const month = useSignal(new Date().getMonth());
  const year = useSignal(new Date().getFullYear());

  const todayTime = useSignal(data?.data?.today.time || "00:00:00");
  const weekTime = useSignal(data?.data?.weekly.time || "00:00:00");

  useEffect(() => {
    async function fetchData() {
      const { data } = await getData(props.employeeId, month.value, year.value);
      setData({ data });
      todayTime.value = data.today.time;
      weekTime.value = data.weekly.time;
    }

    fetchData();
  }, [year.value, month.value]);

  if (!data) {
    return <div>Loading...</div>;
  }

  const daysInMonth = new Date(year.value, month.value + 1, 0)
    .getDate();
  const firstDayOfMonth = (new Date(year.value, month.value, 1).getDay() + 6) %
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
      today.getFullYear() === year.value &&
      today.getMonth() === month.value &&
      today.getDate() === day
    );
  }

  function getEntry(day: number): DailyWorkTime | undefined {
    const isoDate = new Date(year.value, month.value, day)
      .toISOString();
    const data = props.data.value.data.monthly[isoDate];
    return data;
  }

  function getColor(day: number | string | undefined): string {
    if (isToday(Number(day))) {
      return "lightblue";
    } else if (day) {
      return "darkgray";
    } else {
      return "";
    }
  }

  return (
    <div class="h-full flex flex-col">
      <div className="flex bg-slate-400 p-2 gap-2 box-border justify-center">
        <span>
          <TodayTimer time={weekTime} inProgess={data.data.today.inProgress} />
        </span>
        <button
          onClick={() => {
            month.value = (month.value - 1 + 12) % 12;
          }}
        >
          {"<"}
        </button>
        <input
          type="date"
          name=""
          id=""
          value={`${year.value}-${String(month.value + 1).padStart(2, "0")}-01`}
          onChange={(e) => {
            const date = new Date(e.currentTarget.value);
            year.value = date.getFullYear();
            month.value = date.getMonth();
          }}
        />
        <button
          onClick={() => {
            month.value = (month.value + 1) % 12;
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
              backgroundColor: getColor(day),
            }}
          >
            <div class="flex justify-between">
              {day
                ? (
                  <span class="font-bold">
                    {day}
                  </span>
                )
                : <span></span>}
              <span>
                {isToday(Number(day)) && data.data.today.inProgress
                  ? (
                    <TodayTimer
                      time={todayTime}
                      inProgess={data.data.today.inProgress}
                    />
                  )
                  : getEntry(Number(day))?.time}
                {JSON.stringify(getEntry(Number(day)))}
              </span>
            </div>
            <div>
              {data.data
                .monthly[
                  new Date(year.value, month.value, Number(day))
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
