import { createContext } from "preact";
import { Signal, signal } from "@preact/signals";
import { useContext, useMemo } from "preact/hooks";
import { dayOfYear } from "@std/datetime/day-of-year";
import type { ComponentChildren } from "preact";

import type {
  EmployeeDataResponse,
  MonthlyWorkTimeResponse,
  TodayResponse,
  WeeklyResponse,
} from "../api/TimeService.ts";
import { weekOfYear } from "@std/datetime/week-of-year";

type WeekResponse = { week: number } & WeeklyResponse;

interface DataStore {
  readonly mode?: Signal<"day" | "week" | "month" | "year">;
  readonly date?: Signal<Date>;
  readonly employeeId?: Signal<number>;
  readonly employeeData?: Signal<EmployeeDataResponse>;
  readonly today?: Signal<TodayResponse>;
  readonly weekly?: Signal<WeekResponse[]>;
  readonly monthly?: Signal<MonthlyWorkTimeResponse>;
}

type DataContextMethods = {
  selectEmployee: (id: number) => Promise<void>;
  selectMode: (mode: "day" | "week" | "month" | "year") => void;
  selectDate: (date: Date) => void;
  getDailyWorkTime: () => Promise<void>;
  getWeeklyWorkTime: () => Promise<void>;
  getMonthlyWorkTime: () => Promise<void>;
};

type DataContextType = readonly [DataStore, DataContextMethods];

const store: DataStore = {
  mode: signal("day"),
  date: signal(new Date()),
  employeeId: signal(0),
  employeeData: signal({} as EmployeeDataResponse),
  today: signal({} as TodayResponse),
  weekly: signal([] as WeekResponse[]),
  monthly: signal({} as MonthlyWorkTimeResponse),
};

const actions = {
  async selectEmployee(id: number) {
    store.employeeId!.value = id;
    const employeeData = await fetch(`/worktime/api/${id}/data`);
    store.employeeData!.value = await employeeData.json();
  },
  selectMode: (mode: "day" | "week" | "month" | "year") => {
    store.mode!.value = mode;
  },
  selectDate: (date: Date) => {
    store.date!.value = date;
  },
  async getDailyWorkTime() {
    const doy = dayOfYear(store.date?.value ?? new Date());
    const response = await fetch(
      `/worktime/api/${store.employeeId!.value}/daily/${doy}`,
    );
    store.today!.value = await response.json();
  },
  async getWeeklyWorkTime() {
    const weeks = weeksInMonth(store.date?.value ?? new Date());
    const weeksReponse = await Promise.all(
      weeks.map((week) =>
        fetch(
          `/worktime/api/${store.employeeId!.value}/weekly/${week}?whrs=${
            store.employeeData!.value.weekHours?.hours ?? "0"
          }`,
        )
      ),
    );

    store.weekly!.value = await Promise.all(
      weeksReponse.map(async (response, index) => ({
        week: weeks[index],
        ...await response.json(),
      })),
    );
  },
  async getMonthlyWorkTime() {
    const month = (store.date?.value?.getMonth() ?? new Date().getMonth()) + 1;
    const response = await fetch(
      `/worktime/api/${store.employeeId!.value}/monthly/${month}`,
    );
    store.monthly!.value = await response.json();
  },
} as const as DataContextMethods;

const DataContext = createContext<DataContextType>([
  store,
  actions,
]);

type StoreProps = {
  children: ComponentChildren;
};

export const DataProvider = ({ children }: StoreProps) => {
  const contextValue = useMemo(
    () => [store, actions] as DataContextType,
    [store, actions],
  );
  // const contextValue = [store, actions] as DataContextType;

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
};

export function useData() {
  return useContext(DataContext)!;
}

const weeksInMonth = (date: Date): number[] => {
  const month = date.getMonth();
  const year = date.getFullYear();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstWeek = weekOfYear(firstDay);
  const lastWeek = weekOfYear(lastDay);
  const weeks = [];
  for (let i = firstWeek; i <= lastWeek; i++) {
    weeks.push(i);
  }
  return weeks;
};
